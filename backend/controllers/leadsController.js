const db = require("../utils/db");

exports.getLeads = (req, res) => {
  const { q, status, page = 1, limit = 50 } = req.query;

  const conditions = [];
  const params = [];

  if (q && q.trim()) {
    conditions.push("(name LIKE ? OR email LIKE ? OR mobile_without_country_code LIKE ? OR company LIKE ?)");
    const like = `%${q.trim()}%`;
    params.push(like, like, like, like);
  }
  if (status && status.trim()) {
    conditions.push("crm_status = ?");
    params.push(status.trim());
  }

  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
  const total = db.prepare(`SELECT COUNT(*) as count FROM leads${where}`).get(...params).count;

  const pageNum   = Math.max(1, parseInt(page) || 1);
  const limitNum  = Math.min(200, Math.max(1, parseInt(limit) || 50));
  const offset    = (pageNum - 1) * limitNum;

  const data = db.prepare(
    `SELECT * FROM leads${where} ORDER BY imported_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limitNum, offset);

  return res.status(200).json({
    success: true,
    total,
    page: pageNum,
    limit: limitNum,
    data,
  });
};

exports.getLeadById = (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
  return res.status(200).json({ success: true, data: lead });
};

exports.updateLead = (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

  const allowed = ["crm_status", "crm_note", "lead_owner", "description", "name", "email",
                   "mobile_without_country_code", "country_code", "company", "city", "state",
                   "country", "data_source", "possession_time", "created_at"];
  const updates = [];
  const params  = [];

  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (!updates.length) {
    return res.status(400).json({ success: false, message: "No valid fields to update" });
  }

  updates.push("updated_at = ?");
  params.push(new Date().toISOString(), req.params.id);

  db.prepare(`UPDATE leads SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  const updated = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);

  return res.status(200).json({ success: true, data: updated });
};

exports.deleteLead = (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
  db.prepare("DELETE FROM leads WHERE id = ?").run(req.params.id);
  return res.status(200).json({ success: true, message: "Lead deleted" });
};

exports.clearLeads = (req, res) => {
  db.prepare("DELETE FROM leads").run();
  db.prepare("DELETE FROM import_history").run();
  return res.status(200).json({ success: true, message: "All leads and history cleared" });
};

exports.getStats = (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM leads").get().count;

  const byStatus = {
    GOOD_LEAD_FOLLOW_UP: db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'GOOD_LEAD_FOLLOW_UP'").get().c,
    SALE_DONE:           db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'SALE_DONE'").get().c,
    DID_NOT_CONNECT:     db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'DID_NOT_CONNECT'").get().c,
    BAD_LEAD:            db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'BAD_LEAD'").get().c,
  };

  const importHistory = db.prepare(
    "SELECT * FROM import_history ORDER BY imported_at DESC LIMIT 20"
  ).all();

  return res.status(200).json({
    success: true,
    data: {
      totalLeads: total,
      byStatus,
      importHistory,
      lastImport: importHistory[0] || null,
    },
  });
};
