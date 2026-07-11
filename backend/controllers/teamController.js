const db = require("../utils/db");

const COLORS = ["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ec4899","#06b6d4","#f97316"];

exports.getMembers = (req, res) => {
  const members = db.prepare("SELECT * FROM team_members ORDER BY id ASC").all();
  res.json({ success: true, data: members });
};

exports.addMember = (req, res) => {
  const { name, email, role = "Agent" } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, message: "Name and email required." });
  const existing = db.prepare("SELECT id FROM team_members WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ success: false, message: "This email is already a member." });
  const count = db.prepare("SELECT COUNT(*) as c FROM team_members").get().c;
  const avatar = name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const color  = COLORS[count % COLORS.length];
  const joined = new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const result = db.prepare("INSERT INTO team_members (name, email, role, status, joined, avatar, color) VALUES (?,?,?,?,?,?,?)")
    .run(name.trim(), email.trim(), role, "Pending", joined, avatar, color);
  const member = db.prepare("SELECT * FROM team_members WHERE id = ?").get(result.lastInsertRowid);
  res.json({ success: true, data: member });
};

exports.updateMember = (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;
  const member = db.prepare("SELECT * FROM team_members WHERE id = ?").get(id);
  if (!member) return res.status(404).json({ success: false, message: "Member not found." });
  db.prepare("UPDATE team_members SET role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?")
    .run(role || null, status || null, id);
  const updated = db.prepare("SELECT * FROM team_members WHERE id = ?").get(id);
  res.json({ success: true, data: updated });
};

exports.deleteMember = (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM team_members WHERE id = ?").run(id);
  res.json({ success: true });
};
