// server/src/controllers/configController.js
const prisma = require("../config/prisma");

exports.getStats = async (req, res) => {
  try {
    const [activeNodes, livePilots, digitalConcepts] = await Promise.all([
      prisma.user.count({ where: { role: "ENGINEER" } }),
      prisma.pilotProject.count({ where: { isActive: true, type: "DEMO" } }),
      prisma.pilotProject.count({ where: { isActive: true, type: "CONCEPT" } })
    ]);

    res.json({
      activeNodes,
      livePilots,
      digitalConcepts,
      uptime: "99.9%" // Hardcoded for now
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await prisma.serviceModule.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    });
    res.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    res.status(500).json({ error: "Failed to fetch services." });
  }
};
