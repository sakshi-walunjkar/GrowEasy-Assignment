const db = require("../utils/db");

exports.getCampaigns = (req, res) => {
  const data = db.prepare("SELECT * FROM campaigns ORDER BY id DESC").all();
  res.json({ success: true, data });
};

exports.addCampaign = (req, res) => {
  const { name, channel = "Email" } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Name required." });
  const now = new Date().toISOString();
  const r = db.prepare("INSERT INTO campaigns (name, channel, sent, opened, replied, status, created_at) VALUES (?,?,0,0,0,'Draft',?)").run(name.trim(), channel, now);
  res.json({ success: true, data: db.prepare("SELECT * FROM campaigns WHERE id = ?").get(r.lastInsertRowid) });
};

exports.updateCampaign = (req, res) => {
  const { id } = req.params;
  const { status, sent, opened, replied } = req.body;
  const c = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id);
  if (!c) return res.status(404).json({ success: false, message: "Not found." });
  db.prepare("UPDATE campaigns SET status=COALESCE(?,status), sent=COALESCE(?,sent), opened=COALESCE(?,opened), replied=COALESCE(?,replied) WHERE id=?")
    .run(status||null, sent??null, opened??null, replied??null, id);
  res.json({ success: true, data: db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id) });
};

exports.deleteCampaign = (req, res) => {
  db.prepare("DELETE FROM campaigns WHERE id = ?").run(req.params.id);
  res.json({ success: true });
};
