const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const { uploadCSV } = require("../controllers/uploadController");
const { processCSV } = require("../controllers/processController");

router.post("/upload", upload.single("file"), uploadCSV);
router.post("/process", processCSV);

module.exports = router;