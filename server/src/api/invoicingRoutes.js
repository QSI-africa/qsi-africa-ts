const router = require("express").Router();
const {
  generateAndSendInvoice,
  downloadInvoice,
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoicingController");
const { authMiddleware, isSuperUserOrAdmin } = require("../middleware/authMiddleware");

// Existing routes (Public/Shared)
router.post("/generate", generateAndSendInvoice);
router.get("/download/:id", downloadInvoice);

// Admin Management Routes (Protected)
router.get("/", authMiddleware, isSuperUserOrAdmin, getAllInvoices);
router.post("/", authMiddleware, isSuperUserOrAdmin, createInvoice);
router.get("/:id", authMiddleware, isSuperUserOrAdmin, getInvoiceById);
router.put("/:id", authMiddleware, isSuperUserOrAdmin, updateInvoice);
router.delete("/:id", authMiddleware, isSuperUserOrAdmin, deleteInvoice);

module.exports = router;
