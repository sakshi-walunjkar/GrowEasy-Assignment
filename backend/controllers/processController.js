const { processWithAI } = require("../services/aiService");
const db = require("../utils/db");
const { v4: uuidv4 } = require("uuid");

exports.processCSV = async (req, res) => {
  const { records } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: "No records provided" });
  }

  if (records.length > 500) {
    return res.status(400).json({ success: false, message: "Maximum 500 records per import" });
  }

  try {
    console.log(`Processing ${records.length} records with AI...`);
    const { extracted, skipped } = await processWithAI(records);
    console.log(`AI done: ${extracted.length} extracted, ${skipped.length} skipped`);

    const now = new Date().toISOString();

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

    const leadsWithIds = extracted.map((lead) => ({
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

    // Insert all leads in a single transaction
    const insertAll = db.transaction((leads) => {
      for (const lead of leads) insertLead.run(lead);
    });
    insertAll(leadsWithIds);

    // Save import history
    db.prepare(
      "INSERT INTO import_history (id, imported_at, total_records, imported, skipped) VALUES (?, ?, ?, ?, ?)"
    ).run(uuidv4(), now, records.length, extracted.length, skipped.length);

    return res.status(200).json({
      success: true,
      totalImported: extracted.length,
      totalSkipped: skipped.length,
      data: leadsWithIds,
      skippedRecords: skipped,
    });
  } catch (error) {
    console.error("Process error:", error.message);
    return res.status(500).json({
      success: false,
      message: "AI processing failed: " + error.message,
    });
  }
};
