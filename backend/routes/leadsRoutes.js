const express = require("express");
const router = express.Router();
const {
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  clearLeads,
  getStats,
} = require("../controllers/leadsController");

router.get("/",        getLeads);
router.get("/stats",   getStats);
router.get("/:id",     getLeadById);
router.patch("/:id",   updateLead);
router.delete("/",     clearLeads);
router.delete("/:id",  deleteLead);

module.exports = router;
