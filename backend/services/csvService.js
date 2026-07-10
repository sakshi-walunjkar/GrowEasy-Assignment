const fs  = require("fs");
const csv = require("csv-parser");

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ""), // strip BOM
        mapValues:  ({ value })  => (value || "").trim(),
      }))
      .on("data", (row) => {
        // Skip completely empty rows
        const hasValue = Object.values(row).some((v) => v && v.trim());
        if (hasValue) results.push(row);
      })
      .on("end",   () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

module.exports = { parseCSV };
