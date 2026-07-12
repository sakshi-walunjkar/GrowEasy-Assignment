const db = require("../utils/db");

exports.getCallLogs = (req, res) => {
  const data = db.prepare("SELECT * FROM call_logs ORDER BY id DESC").all();
  res.json({ success: true, data });
};

exports.addCallLog = (req, res) => {
  const { lead_name, phone, agent = "", call_time = "" } = req.body;
  if (!lead_name || !phone) return res.status(400).json({ success: false, message: "lead_name and phone required." });
  const now = new Date().toISOString();
  const time = call_time || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const r = db.prepare("INSERT INTO call_logs (lead_name, phone, duration, status, agent, call_time, created_at) VALUES (?,?,'—','Scheduled',?,?,?)")
    .run(lead_name.trim(), phone.trim(), agent, time, now);
  res.json({ success: true, data: db.prepare("SELECT * FROM call_logs WHERE id = ?").get(r.lastInsertRowid) });
};

exports.updateCallLog = (req, res) => {
  const { id } = req.params;
  const { status, duration, call_time } = req.body;
  const c = db.prepare("SELECT * FROM call_logs WHERE id = ?").get(id);
  if (!c) return res.status(404).json({ success: false, message: "Not found." });
  db.prepare("UPDATE call_logs SET status=COALESCE(?,status), duration=COALESCE(?,duration), call_time=COALESCE(?,call_time) WHERE id=?")
    .run(status||null, duration||null, call_time||null, id);
  res.json({ success: true, data: db.prepare("SELECT * FROM call_logs WHERE id = ?").get(id) });
};
