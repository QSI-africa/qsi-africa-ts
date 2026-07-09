const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to ensure user is a fleet driver
const isFleetDriver = (req, res, next) => {
  if (req.user.role !== "FLEET_DRIVER") {
    return res.status(403).json({ error: "Forbidden: Requires Fleet Driver role." });
  }
  next();
};

// Apply auth middleware and role check to all routes
router.use(authMiddleware);
router.use(isFleetDriver);

// 1. Get driver's vehicle details
router.get("/my-vehicle", async (req, res) => {
  try {
    const vehicle = await prisma.fleetVehicle.findUnique({
      where: { driverId: req.user.id },
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }
    
    res.status(200).json(vehicle);
  } catch (error) {
    console.error("Fetch vehicle error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. Update vehicle details
router.put("/my-vehicle", async (req, res) => {
  const { make, model, year, color, licensePlate, vehicleType, capacity } = req.body;
  
  try {
    const vehicle = await prisma.fleetVehicle.update({
      where: { driverId: req.user.id },
      data: {
        make,
        model,
        year: year ? parseInt(year, 10) : null,
        color,
        licensePlate,
        vehicleType,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
      }
    });
    
    res.status(200).json(vehicle);
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. Toggle availability status
router.patch("/availability", async (req, res) => {
  const { isAvailable } = req.body;
  
  try {
    const vehicle = await prisma.fleetVehicle.update({
      where: { driverId: req.user.id },
      data: { isAvailable },
    });
    
    res.status(200).json({ isAvailable: vehicle.isAvailable });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. Get pending + active requests for this driver
router.get("/my-requests", async (req, res) => {
  try {
    // A driver sees requests that are BROADCASTING (available to accept)
    // OR requests that are ASSIGNED/ACCEPTED/IN_PROGRESS by them
    const requests = await prisma.fleetRideRequest.findMany({
      where: {
        OR: [
          { status: "BROADCASTING" },
          { 
            assignedDriverId: req.user.id,
            status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] }
          }
        ]
      },
      include: {
        client: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: { rideDate: 'asc' }
    });
    
    res.status(200).json(requests);
  } catch (error) {
    console.error("Fetch driver requests error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 5. Get completed ride history
router.get("/my-history", async (req, res) => {
  try {
    const history = await prisma.fleetRideRequest.findMany({
      where: {
        assignedDriverId: req.user.id,
        status: { in: ["COMPLETED", "CANCELLED"] }
      },
      include: {
        client: {
          select: { id: true, name: true }
        }
      },
      orderBy: { completedAt: 'desc' }
    });
    
    res.status(200).json(history);
  } catch (error) {
    console.error("Fetch driver history error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 6. Accept a broadcasted request
router.post("/requests/:id/accept", async (req, res) => {
  const { id } = req.params;
  
  try {
    const request = await prisma.fleetRideRequest.findUnique({
      where: { id },
      include: { client: true }
    });
    
    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }
    
    if (request.status !== "BROADCASTING") {
      return res.status(400).json({ error: "Request is no longer available." });
    }
    
    const updatedRequest = await prisma.fleetRideRequest.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        assignedDriverId: req.user.id,
        assignedAt: new Date(),
      },
      include: {
        client: true,
        assignedDriver: {
          include: { fleetVehicle: true }
        }
      }
    });

    // Notify admins and client via Socket
    const io = req.app.get("io");
    if (io) {
      io.emit("fleet:request-accepted", { requestId: id, driverId: req.user.id });
      io.emit(`fleet:request-assigned:${updatedRequest.clientId}`, updatedRequest);
    }
    
    // We should send email to client about assignment here, but let's just let the admin do it or 
    // the system can do it automatically. We'll import sendRideAssignedEmail if needed.
    const { sendRideAssignedEmail } = require("../services/emailService");
    await sendRideAssignedEmail(updatedRequest.client, updatedRequest, false);
    
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 7. Update ride status (IN_PROGRESS, COMPLETED)
router.patch("/requests/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, driverNotes } = req.body;
  
  const validStatuses = ["IN_PROGRESS", "COMPLETED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status update." });
  }
  
  try {
    const request = await prisma.fleetRideRequest.findUnique({
      where: { id },
      include: { client: true }
    });
    
    if (!request || request.assignedDriverId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized or request not found." });
    }
    
    const updateData = { status };
    if (status === "COMPLETED") updateData.completedAt = new Date();
    if (driverNotes) updateData.driverNotes = driverNotes;
    
    const updatedRequest = await prisma.fleetRideRequest.update({
      where: { id },
      data: updateData,
    });
    
    // Socket emit
    const io = req.app.get("io");
    if (io) {
      io.emit(`fleet:status-update:${request.clientId}`, updatedRequest);
    }

    // Send email to client
    const { sendRideStatusUpdateEmail } = require("../services/emailService");
    await sendRideStatusUpdateEmail(request.client, updatedRequest, status);
    
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 8. Stats for dashboard
router.get("/dashboard-stats", async (req, res) => {
  try {
    const [pendingRequests, activeRides, completedRides] = await Promise.all([
      prisma.fleetRideRequest.count({ where: { status: "BROADCASTING" } }),
      prisma.fleetRideRequest.count({ 
        where: { 
          assignedDriverId: req.user.id,
          status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] }
        } 
      }),
      prisma.fleetRideRequest.count({ 
        where: { 
          assignedDriverId: req.user.id,
          status: "COMPLETED" 
        } 
      })
    ]);
    
    // Calculate total earnings
    const completed = await prisma.fleetRideRequest.findMany({
      where: { assignedDriverId: req.user.id, status: "COMPLETED" },
      select: { finalPrice: true, offerPrice: true }
    });
    
    const totalEarnings = completed.reduce((sum, ride) => {
      const price = parseFloat(ride.finalPrice || ride.offerPrice || 0);
      return sum + price;
    }, 0);
    
    res.status(200).json({
      pendingRequests,
      activeRides,
      completedRides,
      totalEarnings,
    });
  } catch (error) {
    console.error("Fetch dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
