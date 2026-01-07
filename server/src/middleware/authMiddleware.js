// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided, authorization denied.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the user to the request object
    req.user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true } // Don't attach the password
    });

    if (!req.user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    
    next(); // Move to the next function
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

module.exports = { authMiddleware };

// Middleware to check if the user is a SUPER_USER
const isSuperUser = (req, res, next) => {
  if (req.user.role !== "SUPER_USER") {
    return res
      .status(403)
      .json({ error: "Forbidden: Requires Super User role." });
  }
  next();
};

const isSuperUserOrAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_USER" && req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Forbidden: Requires Super User or Admin role." });
  }
  next();
};

module.exports = { authMiddleware, isSuperUser, isSuperUserOrAdmin };