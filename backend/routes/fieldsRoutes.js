const express = require("express");
const router  = express.Router();
const { getCustomFields, addCustomField, updateCustomField, deleteCustomField } = require("../controllers/fieldsController");

router.get("/",      getCustomFields);
router.post("/",     addCustomField);
router.patch("/:id", updateCustomField);
router.delete("/:id", deleteCustomField);

module.exports = router;
