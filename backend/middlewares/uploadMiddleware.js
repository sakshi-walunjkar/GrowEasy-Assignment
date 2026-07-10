const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (_req, file, cb) => {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  const allowed = [".csv"];
  const allowedMime = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain", "text/x-csv"];

  if (allowed.includes(ext) || allowedMime.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed."));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
