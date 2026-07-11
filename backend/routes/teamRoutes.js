const express = require("express");
const router  = express.Router();
const { getMembers, addMember, updateMember, deleteMember } = require("../controllers/teamController");

router.get("/",     getMembers);
router.post("/",    addMember);
router.patch("/:id", updateMember);
router.delete("/:id", deleteMember);

module.exports = router;
