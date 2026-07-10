# GrowEasy — AI-Powered CRM Lead Importer

> **Applying For:** Software Developer Intern

A full-stack CRM dashboard with AI-powered CSV lead importing using Google Gemini 1.5 Flash. Upload any CSV file, let AI intelligently map columns to CRM fields, and manage your leads through a clean dashboard.

---

## Live Demo Flow

1. Open `http://localhost:3000`
2. Click **Import CSV** → drag & drop any CSV file
3. Preview raw data → click **Confirm & Import with AI**
4. View AI-mapped leads in **Manage Leads**
5. Monitor stats on **Dashboard** (auto-refreshes every 30s)

---

## Features

### Core (Fully Functional)
- **AI CSV Import** — Gemini 1.5 Flash maps any column names to GrowEasy CRM fields automatically
- **Direct Mapping Fallback** — imports still work 100% even without a Gemini API key
- **Batch Processing** — processes records in batches of 15 with auto-retry (3 attempts) on AI failure
- **Drag & Drop Upload** — react-dropzone with raw CSV preview table (sticky headers, scroll)
- **Confirm Step** — review before triggering AI processing
- **Manage Leads** — search, filter by status, view all imported leads with pagination
- **Dashboard** — 100% real-time stats: import history bar chart, status donut chart, live stat cards, 30s auto-refresh
- **API Center** — live backend/Gemini/DB status monitor, per-endpoint test with HTTP status + response time
- **CRM Fields** — view all 15 system fields, add/edit/delete custom fields with type selection
- **SQLite persistence** — all leads and import history stored in `backend/groweasy.db`

### UI Pages (Interactive Modals & State)
- **Team Members** — invite with email autocomplete, role management, activate/deactivate
- **Ad Accounts** — connect/manage modals, budget update, pause/resume
- **WhatsApp Account** — connect phone, create message templates, send messages
- **Engage Leads** — create campaigns, pause/resume, delete with confirm
- **Tele Calling** — schedule calls, simulate call outcomes (Connected / Not Answered / Busy)
- **Lead Sources** — view configured lead source channels
- **Generate Leads** — lead generation UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| File Upload | react-dropzone, papaparse |
| Backend | Node.js, Express 5 |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Database | SQLite via better-sqlite3 |
| File Parsing | csv-parser, Multer |
| Dev Server | Nodemon |

---

## Project Structure

```
GrowEasy-Assignment/
├── backend/
│   ├── controllers/
│   │   ├── leadsController.js      # CRUD for leads + stats
│   │   ├── processController.js    # AI processing pipeline
│   │   └── uploadController.js     # CSV upload + parse
│   ├── routes/
│   │   ├── leadsRoutes.js
│   │   └── uploadRoutes.js
│   ├── services/
│   │   ├── aiService.js            # Gemini AI + direct mapping fallback
│   │   └── csvService.js           # CSV parsing helpers
│   ├── utils/
│   │   ├── db.js                   # SQLite setup + schema
│   │   └── store.js                # In-memory upload store
│   ├── server.js                   # Express app + /api/gemini-status
│   └── .env                        # PORT, GEMINI_API_KEY, FRONTEND_URL
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main layout + page routing
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Dashboard.tsx           # Real-time stats + charts
│   │   ├── ManageLeads.tsx         # Lead table + search/filter
│   │   ├── ImportModal.tsx         # CSV upload → preview → import flow
│   │   ├── APICenter.tsx           # Backend monitor + endpoint tester
│   │   ├── CRMFields.tsx           # Field management + custom fields
│   │   ├── TeamMembers.tsx
│   │   ├── EngageLeads.tsx
│   │   ├── TeleCalling.tsx
│   │   ├── WhatsAppAccount.tsx
│   │   ├── AdAccounts.tsx
│   │   └── ...
│   ├── services/
│   │   └── api.ts                  # Axios instance + API helpers
│   └── types/
│       └── crm.ts                  # TypeScript interfaces
│
└── TestFiles/
    ├── CRM_leads_import_29th_june.csv   # Real CRM data test file
    └── addresses.csv                    # Generic CSV test file
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey) *(optional — imports work without it)*

---

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

> **No Gemini key?** Leave it blank or as placeholder — the app uses direct column mapping fallback and imports will still work.

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

---

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/upload` | Upload & parse CSV file |
| POST | `/api/process` | AI-extract CRM fields from parsed CSV |
| GET | `/api/leads` | Fetch all leads (supports `?search=`, `?status=`) |
| GET | `/api/leads/stats` | Lead stats + import history |
| GET | `/api/leads/:id` | Get single lead |
| PATCH | `/api/leads/:id` | Update lead fields |
| DELETE | `/api/leads/:id` | Delete single lead |
| DELETE | `/api/leads` | Clear all leads and history |
| GET | `/api/gemini-status` | Check if Gemini API key is configured |

---

## CRM Fields

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | DateTime | Lead creation timestamp |
| `name` | Text | Full name |
| `email` | Email | Email address |
| `country_code` | Text | Phone country code (e.g. +91) |
| `mobile_without_country_code` | Phone | Mobile number digits only |
| `company` | Text | Company / organization |
| `city` | Text | City |
| `state` | Text | State / province |
| `country` | Text | Country |
| `lead_owner` | Email | Assigned agent email |
| `crm_status` | Dropdown | `GOOD_LEAD_FOLLOW_UP` / `DID_NOT_CONNECT` / `BAD_LEAD` / `SALE_DONE` |
| `crm_note` | TextArea | Notes, remarks, extra info |
| `data_source` | Dropdown | Lead source channel |
| `possession_time` | Text | Property possession timeline |
| `description` | TextArea | Additional description |

---

## How AI Extraction Works

1. CSV is parsed into JSON rows by the backend
2. Rows are split into batches of 15
3. Each batch is sent to Gemini 1.5 Flash with a detailed system prompt
4. Gemini maps any column names → GrowEasy CRM fields
5. If Gemini fails (rate limit, invalid key, network) → automatic fallback to direct column alias mapping
6. Records with neither email nor mobile are skipped
7. All extracted records are saved to SQLite

**Fallback mapping handles column name variations like:**
- `Full Name`, `Contact Name`, `Customer` → `name`
- `Phone`, `Mobile`, `Cell`, `Ph No` → `mobile_without_country_code`
- `Remarks`, `Notes`, `Comment` → `crm_note`
- `Status`, `Lead Status`, `Stage` → `crm_status`

---

## Test Files

Two CSV files are included in `TestFiles/` to test the importer:

- `CRM_leads_import_29th_june.csv` — real CRM format with standard column names
- `addresses.csv` — generic address data to test AI column mapping

---

## Environment Variables Reference

**backend/.env**
```env
PORT=5000
GEMINI_API_KEY=AIzaSy...          # Get from aistudio.google.com/app/apikey
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## TypeScript

The frontend is fully typed with zero TypeScript errors:

```bash
cd frontend
npx tsc --noEmit
# exits 0 — no errors
```
