const fs = require("fs");
const { parseCSV } = require("../services/csvService");

exports.uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No CSV file uploaded" });
  }

  try {
    const csvData = await parseCSV(req.file.path);

    if (csvData.length === 0) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "CSV file is empty or has no data rows" });
    }

    fs.unlink(req.file.path, () => {});

    return res.status(200).json({
      success: true,
      message: "CSV parsed successfully",
      totalRecords: csvData.length,
      data: csvData,
    });
  } catch (error) {
    fs.unlink(req.file.path, () => {});
    console.error("Upload error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to parse CSV: " + error.message });
  }
};
