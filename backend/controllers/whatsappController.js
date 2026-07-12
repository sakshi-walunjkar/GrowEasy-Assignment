const db = require("../utils/db");

exports.getAccount = (req, res) => {
  const acc = db.prepare("SELECT * FROM whatsapp_account ORDER BY id DESC LIMIT 1").get();
  res.json({ success: true, data: acc || null });
};

exports.connectAccount = (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone required." });
  db.prepare("DELETE FROM whatsapp_account").run();
  const now = new Date().toISOString();
  const r = db.prepare("INSERT INTO whatsapp_account (phone, connected, created_at) VALUES (?,1,?)").run(phone.trim(), now);
  res.json({ success: true, data: db.prepare("SELECT * FROM whatsapp_account WHERE id = ?").get(r.lastInsertRowid) });
};

exports.disconnectAccount = (req, res) => {
  db.prepare("DELETE FROM whatsapp_account").run();
  res.json({ success: true });
};

exports.getTemplates = (req, res) => {
  const data = db.prepare("SELECT * FROM whatsapp_templates ORDER BY id DESC").all();
  res.json({ success: true, data });
};

exports.addTemplate = (req, res) => {
  const { name, type = "Greeting", body } = req.body;
  if (!name || !body) return res.status(400).json({ success: false, message: "Name and body required." });
  const now = new Date().toISOString();
  const r = db.prepare("INSERT INTO whatsapp_templates (name, type, status, sent, body, created_at) VALUES (?,?,'Pending',0,?,?)").run(name.trim(), type, body.trim(), now);
  res.json({ success: true, data: db.prepare("SELECT * FROM whatsapp_templates WHERE id = ?").get(r.lastInsertRowid) });
};

exports.sendTemplate = (req, res) => {
  const { id } = req.params;
  const t = db.prepare("SELECT * FROM whatsapp_templates WHERE id = ?").get(id);
  if (!t) return res.status(404).json({ success: false, message: "Template not found." });
  db.prepare("UPDATE whatsapp_templates SET sent = sent + 1 WHERE id = ?").run(id);
  res.json({ success: true, data: db.prepare("SELECT * FROM whatsapp_templates WHERE id = ?").get(id) });
};

exports.deleteTemplate = (req, res) => {
  db.prepare("DELETE FROM whatsapp_templates WHERE id = ?").run(req.params.id);
  res.json({ success: true });
};
