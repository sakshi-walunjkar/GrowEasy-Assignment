const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../groweasy.db"));

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id                          TEXT PRIMARY KEY,
    created_at                  TEXT,
    name                        TEXT,
    email                       TEXT,
    country_code                TEXT,
    mobile_without_country_code TEXT,
    company                     TEXT,
    city                        TEXT,
    state                       TEXT,
    country                     TEXT,
    lead_owner                  TEXT,
    crm_status                  TEXT,
    crm_note                    TEXT,
    data_source                 TEXT,
    possession_time             TEXT,
    description                 TEXT,
    imported_at                 TEXT NOT NULL,
    updated_at                  TEXT
  );

  CREATE TABLE IF NOT EXISTS import_history (
    id            TEXT PRIMARY KEY,
    imported_at   TEXT NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    imported      INTEGER NOT NULL DEFAULT 0,
    skipped       INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_leads_email    ON leads(email);
  CREATE INDEX IF NOT EXISTS idx_leads_mobile   ON leads(mobile_without_country_code);
  CREATE INDEX IF NOT EXISTS idx_leads_status   ON leads(crm_status);
  CREATE INDEX IF NOT EXISTS idx_leads_imported ON leads(imported_at DESC);
`);

module.exports = db;
