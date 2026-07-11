const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const { uploadCSV } = require("../controllers/uploadController");
const { processCSV, processCSVStream } = require("../controllers/processController");

router.post("/upload", upload.single("file"), uploadCSV);
router.post("/process", processCSV);
router.post("/process-stream", processCSVStream);

module.exports = router;