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

  CREATE TABLE IF NOT EXISTS team_members (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    email   TEXT NOT NULL UNIQUE,
    role    TEXT NOT NULL DEFAULT 'Agent',
    status  TEXT NOT NULL DEFAULT 'Pending',
    joined  TEXT NOT NULL,
    avatar  TEXT,
    color   TEXT
  );

  CREATE TABLE IF NOT EXISTS custom_fields (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL UNIQUE,
    label    TEXT NOT NULL,
    type     TEXT NOT NULL DEFAULT 'Text',
    required INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    channel    TEXT NOT NULL DEFAULT 'Email',
    sent       INTEGER NOT NULL DEFAULT 0,
    opened     INTEGER NOT NULL DEFAULT 0,
    replied    INTEGER NOT NULL DEFAULT 0,
    status     TEXT NOT NULL DEFAULT 'Draft',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS call_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_name  TEXT NOT NULL,
    phone      TEXT NOT NULL,
    duration   TEXT NOT NULL DEFAULT '0:00',
    status     TEXT NOT NULL DEFAULT 'Scheduled',
    agent      TEXT NOT NULL DEFAULT '',
    call_time  TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'Greeting',
    status     TEXT NOT NULL DEFAULT 'Pending',
    sent       INTEGER NOT NULL DEFAULT 0,
    body       TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS whatsapp_account (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    phone      TEXT NOT NULL,
    connected  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
`);

module.exports = db;
