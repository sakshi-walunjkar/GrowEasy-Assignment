const express = require("express");
const cors = require("cors");
require("dotenv").config();

const uploadRoutes = require("./routes/uploadRoutes");
const leadsRoutes  = require("./routes/leadsRoutes");
const teamRoutes   = require("./routes/teamRoutes");
const fieldsRoutes = require("./routes/fieldsRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api", uploadRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/fields", fieldsRoutes);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "GrowEasy Backend Running", version: "1.0.0" });
});

app.get("/api/gemini-status", (_req, res) => {
  const key = process.env.GEMINI_API_KEY || "";
  const missing = !key || key === "your_gemini_api_key_here" || key.length < 20 || !key.startsWith("AIza");
  res.json({ status: missing ? "missing" : "configured" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ GrowEasy Backend running at http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST   /api/upload`);
  console.log(`   POST   /api/process`);
  console.log(`   GET    /api/leads`);
  console.log(`   GET    /api/leads/stats`);
  console.log(`   GET    /api/leads/export`);
  console.log(`   GET    /api/leads/:id`);
  console.log(`   PATCH  /api/leads/:id`);
  console.log(`   DELETE /api/leads/:id`);
  console.log(`   DELETE /api/leads`);
  console.log(`   GET    /api/gemini-status\n`);
});
