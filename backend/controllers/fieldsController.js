const db = require("../utils/db");

exports.getCustomFields = (req, res) => {
  const fields = db.prepare("SELECT * FROM custom_fields ORDER BY id ASC").all();
  res.json({ success: true, data: fields.map(f => ({ ...f, required: !!f.required, system: false })) });
};

exports.addCustomField = (req, res) => {
  const { name, label, type = "Text", required = false } = req.body;
  if (!name || !label) return res.status(400).json({ success: false, message: "Name and label required." });
  const slug = name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const existing = db.prepare("SELECT id FROM custom_fields WHERE name = ?").get(slug);
  if (existing) return res.status(409).json({ success: false, message: "Field name already exists." });
  const result = db.prepare("INSERT INTO custom_fields (name, label, type, required) VALUES (?,?,?,?)")
    .run(slug, label.trim(), type, required ? 1 : 0);
  const field = db.prepare("SELECT * FROM custom_fields WHERE id = ?").get(result.lastInsertRowid);
  res.json({ success: true, data: { ...field, required: !!field.required, system: false } });
};

exports.updateCustomField = (req, res) => {
  const { id } = req.params;
  const { label, type, required } = req.body;
  const field = db.prepare("SELECT * FROM custom_fields WHERE id = ?").get(id);
  if (!field) return res.status(404).json({ success: false, message: "Field not found." });
  db.prepare("UPDATE custom_fields SET label = COALESCE(?, label), type = COALESCE(?, type), required = COALESCE(?, required) WHERE id = ?")
    .run(label || null, type || null, required !== undefined ? (required ? 1 : 0) : null, id);
  const updated = db.prepare("SELECT * FROM custom_fields WHERE id = ?").get(id);
  res.json({ success: true, data: { ...updated, required: !!updated.required, system: false } });
};

exports.deleteCustomField = (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM custom_fields WHERE id = ?").run(id);
  res.json({ success: true });
};
