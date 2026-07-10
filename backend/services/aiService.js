const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const BATCH_SIZE = 15;

const SYSTEM_PROMPT = `You are a CRM data extraction AI for GrowEasy. Extract lead information from CSV rows and map them to GrowEasy CRM format.

OUTPUT FORMAT: Return ONLY a valid JSON array. No markdown, no code blocks, no explanation.

REQUIRED OUTPUT KEYS (use exactly these, no others):
created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

FIELD RULES:

1. crm_status — MUST be one of these exact values or empty string:
   - GOOD_LEAD_FOLLOW_UP → interested, hot lead, follow up, callback, wants demo, potential
   - DID_NOT_CONNECT → not reachable, busy, no answer, switched off, not picking, voicemail
   - BAD_LEAD → not interested, junk, wrong number, duplicate, spam, invalid
   - SALE_DONE → closed, won, purchased, deal done, converted, booked
   - "" → if unclear or missing

2. data_source — MUST be one of these exact values or empty string:
   leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots
   Only set if you are very confident. Otherwise use "".

3. created_at — Convert ANY date format to ISO 8601 (e.g. "2026-06-29T10:00:00.000Z"). If unparseable, use "".

4. mobile_without_country_code — digits ONLY, strip country code prefix, spaces, dashes, brackets.
   Examples: "91-9876543210" → "9876543210", "+1 (555) 123-4567" → "5551234567"

5. country_code — format as +XX or +XXX. Extract from phone if present. Default to +91 if Indian context.

6. Multiple emails → first in email field, rest appended to crm_note as "Additional emails: ..."
   Multiple phones → first in mobile field, rest appended to crm_note as "Additional phones: ..."

7. crm_note — Combine: remarks, follow-up notes, extra contacts, budget, property type, any info not fitting other fields.

8. SKIP records with NEITHER email NOR mobile. Do NOT include them in output.

9. All missing fields → use "" (empty string). Never use null or undefined.

10. Column name mapping examples (handle any variation):
    - "Full Name", "Contact Name", "Lead Name", "Customer" → name
    - "Phone", "Mobile", "Cell", "Contact No", "Ph No" → mobile_without_country_code
    - "Mail", "Email ID", "E-mail" → email
    - "Org", "Organization", "Business" → company
    - "Remarks", "Notes", "Comment", "Feedback" → crm_note
    - "Status", "Lead Status", "Stage" → crm_status
    - "Source", "Lead Source", "Channel" → data_source
    - "Date", "Created", "Timestamp", "Entry Date" → created_at`;

async function processWithAI(records) {
  const allExtracted = [];
  const allSkipped   = [];

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}: ${batch.length} records`);
    const result = await processBatch(batch, i);
    allExtracted.push(...result.extracted);
    allSkipped.push(...result.skipped);
  }

  return { extracted: allExtracted, skipped: allSkipped };
}

// Column name aliases for direct mapping fallback
const FIELD_ALIASES = {
  name:                        ["name", "full name", "contact name", "lead name", "customer", "client name"],
  email:                       ["email", "mail", "email id", "e-mail", "email address"],
  mobile_without_country_code: ["phone", "mobile", "cell", "contact no", "ph no", "phone number", "mobile number", "contact", "telephone"],
  country_code:                ["country code", "isd", "dial code"],
  company:                     ["company", "org", "organization", "business", "firm"],
  city:                        ["city", "town"],
  state:                       ["state", "province", "region"],
  country:                     ["country", "nation"],
  lead_owner:                  ["lead owner", "owner", "assigned to", "agent"],
  crm_status:                  ["status", "lead status", "stage"],
  crm_note:                    ["notes", "note", "remarks", "remark", "comment", "feedback", "description"],
  data_source:                 ["source", "lead source", "channel"],
  created_at:                  ["date", "created", "timestamp", "entry date", "created at", "created_at"],
  possession_time:             ["possession", "possession time", "handover"],
  description:                 ["description", "details", "info"],
};

const STATUS_MAP = {
  "interested": "GOOD_LEAD_FOLLOW_UP", "hot": "GOOD_LEAD_FOLLOW_UP", "follow up": "GOOD_LEAD_FOLLOW_UP",
  "callback": "GOOD_LEAD_FOLLOW_UP", "potential": "GOOD_LEAD_FOLLOW_UP", "good": "GOOD_LEAD_FOLLOW_UP",
  "not reachable": "DID_NOT_CONNECT", "busy": "DID_NOT_CONNECT", "no answer": "DID_NOT_CONNECT",
  "not picking": "DID_NOT_CONNECT", "did not connect": "DID_NOT_CONNECT",
  "not interested": "BAD_LEAD", "junk": "BAD_LEAD", "wrong number": "BAD_LEAD", "bad": "BAD_LEAD",
  "closed": "SALE_DONE", "won": "SALE_DONE", "purchased": "SALE_DONE", "sale done": "SALE_DONE", "converted": "SALE_DONE",
};

function directMap(record) {
  const lower = {};
  for (const [k, v] of Object.entries(record)) lower[k.toLowerCase().trim()] = v;

  const get = (aliases) => {
    for (const a of aliases) if (lower[a] !== undefined) return lower[a];
    return "";
  };

  const mapped = {};
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) mapped[field] = get(aliases);

  // Clean phone: strip country code prefix, spaces, dashes, brackets
  if (mapped.mobile_without_country_code) {
    let ph = mapped.mobile_without_country_code.replace(/[\s\-().+]/g, "");
    if (ph.startsWith("91") && ph.length > 10) ph = ph.slice(2);
    if (ph.startsWith("1")  && ph.length > 10) ph = ph.slice(1);
    mapped.mobile_without_country_code = ph;
  }

  // Normalise country_code
  if (!mapped.country_code) mapped.country_code = "+91";
  else if (!mapped.country_code.startsWith("+")) mapped.country_code = "+" + mapped.country_code;

  // Normalise crm_status
  if (mapped.crm_status) {
    const s = mapped.crm_status.toLowerCase().trim();
    const VALID = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
    if (VALID.includes(mapped.crm_status.toUpperCase())) {
      mapped.crm_status = mapped.crm_status.toUpperCase();
    } else {
      mapped.crm_status = STATUS_MAP[s] || "";
    }
  }

  return mapped;
}

async function processBatch(batch, offset, retries = 3) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const keyInvalid = !apiKey || apiKey === "your_gemini_api_key_here" || apiKey.length < 10;

  if (keyInvalid) {
    console.log("  No valid Gemini key — using direct column mapping fallback");
    return directMapBatch(batch, offset);
  }

  const prompt = `${SYSTEM_PROMPT}

INPUT (${batch.length} CSV records as JSON):
${JSON.stringify(batch, null, 2)}

Return extracted CRM records as a JSON array. Skip records with no email and no mobile.`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text   = result.response.text().trim();

      // Strip any markdown code fences
      const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error("AI response is not a JSON array");

      // Filter out records with no contact info
      const extracted = parsed.filter(
        (r) => (r.email && r.email.trim()) || (r.mobile_without_country_code && r.mobile_without_country_code.trim())
      );

      const skipped = [];
      const skippedCount = batch.length - extracted.length;
      if (skippedCount > 0) {
        for (let i = extracted.length; i < batch.length; i++) {
          skipped.push({ index: offset + i, record: batch[i], reason: "No email or mobile number found by AI" });
        }
      }

      return { extracted, skipped };
    } catch (err) {
      console.error(`  Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) {
        console.warn(`  AI failed — falling back to direct mapping for this batch`);
        return directMapBatch(batch, offset);
      }
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

function directMapBatch(batch, offset) {
  const extracted = [];
  const skipped   = [];
  for (let i = 0; i < batch.length; i++) {
    const mapped = directMap(batch[i]);
    if (mapped.email || mapped.mobile_without_country_code) {
      extracted.push(mapped);
    } else {
      skipped.push({ index: offset + i, record: batch[i], reason: "No email or mobile number found" });
    }
  }
  return { extracted, skipped };
}

module.exports = { processWithAI };
