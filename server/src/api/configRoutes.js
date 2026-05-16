// server/src/api/configRoutes.js
const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

router.get("/stats", configController.getStats);
router.get("/services", configController.getServices);

module.exports = router;
