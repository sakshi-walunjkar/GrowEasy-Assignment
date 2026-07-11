const { processWithAI } = require("../services/aiService");
const db = require("../utils/db");
const { v4: uuidv4 } = require("uuid");

// SSE: real-time batch progress
exports.processCSVStream = async (req, res) => {
  const { records } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: "No records provided" });
  }
  if (records.length > 500) {
    return res.status(400).json({ success: false, message: "Maximum 500 records per import" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    send({ type: "start", total: records.length, batches: Math.ceil(records.length / 15) });

    const { extracted, skipped } = await processWithAI(records, (batchNum, totalBatches, extractedSoFar, skippedSoFar) => {
      send({ type: "batch", batchNum, totalBatches, extractedSoFar, skippedSoFar });
    });

    send({ type: "saving", message: "Saving leads to database..." });

    const now = new Date().toISOString();
    const checkEmail  = db.prepare("SELECT id FROM leads WHERE email = ? AND email != ''");
    const checkMobile = db.prepare("SELECT id FROM leads WHERE mobile_without_country_code = ? AND mobile_without_country_code != ''");

    const unique = [], dupeSkip = [];
    for (const lead of extracted) {
      const emailDupe  = lead.email  && checkEmail.get(lead.email);
      const mobileDupe = lead.mobile_without_country_code && checkMobile.get(lead.mobile_without_country_code);
      if (emailDupe || mobileDupe) {
        dupeSkip.push({ index: 0, record: lead, reason: "Duplicate: email or mobile already exists in CRM" });
      } else {
        unique.push(lead);
      }
    }
    const allSkipped = [...skipped, ...dupeSkip];

    const insertLead = db.prepare(`
      INSERT INTO leads (
        id, created_at, name, email, country_code, mobile_without_country_code,
        company, city, state, country, lead_owner, crm_status, crm_note,
        data_source, possession_time, description, imported_at
      ) VALUES (
        @id, @created_at, @name, @email, @country_code, @mobile_without_country_code,
        @company, @city, @state, @country, @lead_owner, @crm_status, @crm_note,
        @data_source, @possession_time, @description, @imported_at
      )
    `);

    const leadsWithIds = unique.map((lead) => ({
      id: uuidv4(),
      created_at:                  lead.created_at                  || "",
      name:                        lead.name                        || "",
      email:                       lead.email                       || "",
      country_code:                lead.country_code                || "",
      mobile_without_country_code: lead.mobile_without_country_code || "",
      company:                     lead.company                     || "",
      city:                        lead.city                        || "",
      state:                       lead.state                       || "",
      country:                     lead.country                     || "",
      lead_owner:                  lead.lead_owner                  || "",
      crm_status:                  lead.crm_status                  || "",
      crm_note:                    lead.crm_note                    || "",
      data_source:                 lead.data_source                 || "",
      possession_time:             lead.possession_time             || "",
      description:                 lead.description                 || "",
      imported_at: now,
    }));

    db.transaction((leads) => { for (const lead of leads) insertLead.run(lead); })(leadsWithIds);
    db.prepare("INSERT INTO import_history (id, imported_at, total_records, imported, skipped) VALUES (?, ?, ?, ?, ?)")
      .run(uuidv4(), now, records.length, leadsWithIds.length, allSkipped.length);

    // Build column mapping summary
    const columnMapping = buildColumnMapping(records[0] || {}, leadsWithIds[0] || {});

    send({
      type: "done",
      totalImported: leadsWithIds.length,
      totalSkipped: allSkipped.length,
      data: leadsWithIds,
      skippedRecords: allSkipped,
      columnMapping,
    });

    res.end();
  } catch (error) {
    console.error("Process error:", error.message);
    send({ type: "error", message: "AI processing failed: " + error.message });
    res.end();
  }
};

// Original non-SSE endpoint (kept for compatibility)
exports.processCSV = async (req, res) => {
  const { records } = req.body;
  if (!records || !Array.isArray(records) || records.length === 0)
    return res.status(400).json({ success: false, message: "No records provided" });
  if (records.length > 500)
    return res.status(400).json({ success: false, message: "Maximum 500 records per import" });

  try {
    const { extracted, skipped } = await processWithAI(records);
    const now = new Date().toISOString();
    const checkEmail  = db.prepare("SELECT id FROM leads WHERE email = ? AND email != ''");
    const checkMobile = db.prepare("SELECT id FROM leads WHERE mobile_without_country_code = ? AND mobile_without_country_code != ''");

    const unique = [], dupeSkip = [];
    for (const lead of extracted) {
      const emailDupe  = lead.email  && checkEmail.get(lead.email);
      const mobileDupe = lead.mobile_without_country_code && checkMobile.get(lead.mobile_without_country_code);
      if (emailDupe || mobileDupe) dupeSkip.push({ index: 0, record: lead, reason: "Duplicate: email or mobile already exists in CRM" });
      else unique.push(lead);
    }
    const allSkipped = [...skipped, ...dupeSkip];

    const insertLead = db.prepare(`INSERT INTO leads (id,created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description,imported_at) VALUES (@id,@created_at,@name,@email,@country_code,@mobile_without_country_code,@company,@city,@state,@country,@lead_owner,@crm_status,@crm_note,@data_source,@possession_time,@description,@imported_at)`);
    const leadsWithIds = unique.map((lead) => ({ id: uuidv4(), created_at: lead.created_at||"", name: lead.name||"", email: lead.email||"", country_code: lead.country_code||"", mobile_without_country_code: lead.mobile_without_country_code||"", company: lead.company||"", city: lead.city||"", state: lead.state||"", country: lead.country||"", lead_owner: lead.lead_owner||"", crm_status: lead.crm_status||"", crm_note: lead.crm_note||"", data_source: lead.data_source||"", possession_time: lead.possession_time||"", description: lead.description||"", imported_at: now }));
    db.transaction((leads) => { for (const lead of leads) insertLead.run(lead); })(leadsWithIds);
    db.prepare("INSERT INTO import_history (id,imported_at,total_records,imported,skipped) VALUES (?,?,?,?,?)").run(uuidv4(), now, records.length, leadsWithIds.length, allSkipped.length);

    const columnMapping = buildColumnMapping(records[0] || {}, leadsWithIds[0] || {});
    return res.status(200).json({ success: true, totalImported: leadsWithIds.length, totalSkipped: allSkipped.length, data: leadsWithIds, skippedRecords: allSkipped, columnMapping });
  } catch (error) {
    return res.status(500).json({ success: false, message: "AI processing failed: " + error.message });
  }
};

function buildColumnMapping(originalRow, mappedRow) {
  const CRM_FIELDS = ["name","email","country_code","mobile_without_country_code","company","city","state","country","lead_owner","crm_status","crm_note","data_source","possession_time","description","created_at"];
  const originalKeys = Object.keys(originalRow);
  const mapping = [];
  for (const crmField of CRM_FIELDS) {
    const value = mappedRow[crmField];
    if (!value) continue;
    // Find which original column likely provided this value
    const matchedCol = originalKeys.find(k => {
      const v = (originalRow[k] || "").toString().trim();
      return v && value.toString().includes(v.slice(0, 10));
    }) || originalKeys.find(k => k.toLowerCase().replace(/[\s_]/g,"").includes(crmField.replace(/_/g,""))) || "—";
    mapping.push({ originalColumn: matchedCol, crmField, sampleValue: value.toString().slice(0, 40) });
  }
  return mapping;
}
