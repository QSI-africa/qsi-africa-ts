// server/src/api/mobilityRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { sendEmail } = require("../services/emailService");

const router = express.Router();

// 1. User Journey: Request for site visit
router.post("/site-visit", authMiddleware, async (req, res) => {
  const { projectId, message } = req.body;
  const userId = req.user.id;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required." });
  }

  try {
    const visitRequest = await prisma.siteVisitRequest.create({
      data: {
        userId,
        projectId,
        message,
        status: "PENDING"
      },
      include: {
        project: {
          include: {
            engineerProfile: {
              include: {
                user: true
              }
            }
          }
        },
        user: true
      }
    });

    // Send email to the engineer responsible
    const engineerEmail = visitRequest.project.engineerProfile.user.email;
    const engineerName = visitRequest.project.engineerProfile.user.name;
    const projectTitle = visitRequest.project.title;
    const requesterName = visitRequest.user.name;

    await sendEmail({
      to: engineerEmail,
      subject: `New Site Visit Request: ${projectTitle}`,
      text: `Hello ${engineerName},\n\n${requesterName} has requested a site visit for the project "${projectTitle}".\n\nMessage: ${message || "No message"}\n\nPlease log in to the platform to respond.\n\nBest regards,\nQSI Mobility Team`,
    });

    res.status(201).json(visitRequest);
  } catch (error) {
    console.error("Site visit request error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. Engineer Journey: Request engineering car/vehicle
router.post("/vehicle-hire", authMiddleware, async (req, res) => {
  const { location, duration, price, details } = req.body;
  const engineerId = req.user.id;

  // Restriction removed: Anyone can request vehicle hire

  try {
    const hireRequest = await prisma.vehicleHireRequest.create({
      data: {
        engineerId,
        location,
        duration,
        price,
        details,
        status: "BROADCASTING"
      },
      include: {
        engineer: {
          select: { name: true, phone: true }
        }
      }
    });

    // Broadcast to all connected users via Socket.io
    // Note: io is attached to app in index.js (req.app.get('io'))
    const io = req.app.get("io");
    if (io) {
      io.emit("new-vehicle-hire", {
        id: hireRequest.id,
        location,
        duration,
        price,
        engineerName: hireRequest.engineer.name,
        details
      });
    }

    res.status(201).json(hireRequest);
  } catch (error) {
    console.error("Vehicle hire request error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. Driver/User accepts vehicle hire
router.post("/vehicle-hire/:id/accept", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const request = await prisma.vehicleHireRequest.findUnique({ where: { id } });
    
    if (!request || request.status !== "BROADCASTING") {
      return res.status(400).json({ error: "Request is no longer available." });
    }

    const updatedRequest = await prisma.vehicleHireRequest.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        acceptedById: userId
      },
      include: {
        acceptedBy: { select: { name: true } },
        engineer: { select: { id: true, name: true } }
      }
    });

    // Notify engineer via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(updatedRequest.engineerId).emit("vehicle-hire-accepted", {
        requestId: id,
        acceptedBy: updatedRequest.acceptedBy.name
      });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Accept vehicle hire error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. Get active broadcasts
router.get("/broadcasts", authMiddleware, async (req, res) => {
  try {
    const broadcasts = await prisma.vehicleHireRequest.findMany({
      where: { status: "BROADCASTING" },
      include: {
        engineer: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(broadcasts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 5. Get site visits for projects belonging to the current engineer
router.get("/my-project-visits", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const visits = await prisma.siteVisitRequest.findMany({
      where: { project: { engineerProfile: { userId } } },
      include: {
        project: { select: { title: true } },
        user: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 5. Get personal site visit requests
router.get("/my-visits", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const visits = await prisma.siteVisitRequest.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            engineerProfile: { include: { user: { select: { name: true } } } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 6. Update site visit status
router.patch("/site-visit/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED, REJECTED
  
  try {
    const visit = await prisma.siteVisitRequest.update({
      where: { id },
      data: { status },
      include: { project: { select: { title: true } } }
    });

    // Notify the user who requested the visit
    const io = req.app.get("io");
    if (io) {
      io.emit("site-visit-status", {
        userId: visit.userId,
        projectTitle: visit.project.title,
        status: status
      });
    }

    res.status(200).json(visit);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 7. Create a Ride Post (Offer or Request)
router.post("/rides", authMiddleware, async (req, res) => {
  const { type, startLocation, endLocation, departureTime, seats, price, notes } = req.body;
  const userId = req.user.id;

  if (!type || !startLocation || !endLocation || !departureTime) {
    return res.status(400).json({ error: "Type, startLocation, endLocation, and departureTime are required." });
  }

  try {
    const ride = await prisma.ridePost.create({
      data: {
        userId,
        type,
        startLocation,
        endLocation,
        departureTime: new Date(departureTime),
        seats: seats ? parseInt(seats, 10) : 1,
        price: price || 0,
        notes
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    res.status(201).json(ride);
  } catch (error) {
    console.error("Create ride error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 8. Get Ride Posts (with optional type filter)
router.get("/rides", authMiddleware, async (req, res) => {
  const { type } = req.query;

  try {
    const filter = type ? { type: String(type).toUpperCase() } : {};
    
    // Only fetch rides that are in the future
    const rides = await prisma.ridePost.findMany({
      where: {
        ...filter,
        departureTime: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: {
        departureTime: "asc"
      }
    });

    res.status(200).json(rides);
  } catch (error) {
    console.error("Get rides error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 9. Delete a Ride Post
router.delete("/rides/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const ride = await prisma.ridePost.findUnique({ where: { id } });

    if (!ride) {
      return res.status(404).json({ error: "Ride post not found." });
    }

    if (ride.userId !== userId && req.user.role !== "SUPER_USER") {
      return res.status(403).json({ error: "Unauthorized to delete this ride post." });
    }

    await prisma.ridePost.delete({ where: { id } });

    res.status(200).json({ message: "Ride post deleted." });
  } catch (error) {
    console.error("Delete ride error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
