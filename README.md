# GrowEasy — AI-Powered CRM Lead Importer

> **Applying For:** Software Developer Intern
> **Submission:** [varun@groweasy.ai](mailto:varun@groweasy.ai)

A full-stack CRM dashboard with AI-powered CSV lead importing using **Google Gemini 1.5 Flash**. Upload any CSV file, let AI intelligently map columns to CRM fields, and manage your leads through a clean dashboard.

---

## 🚀 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** (Vercel) | https://grow-easy-assignment.vercel.app |
| **Backend** (Render) | https://groweasy-backend.onrender.com |

> **Note:** Backend is hosted on Render's free tier — it may take **30–60 seconds to wake up** on first request.

---

## Live Demo Flow

1. Open the [live frontend](https://grow-easy-assignment.vercel.app)
2. Click **Import CSV** → drag & drop any CSV file
3. Review **CSV validation warnings** before confirming
4. Click **Confirm & Import with AI** → watch **real-time batch progress**
5. View **AI Column Mapping** — see exactly what AI mapped
6. View AI-mapped leads in **Manage Leads**
7. Track all past imports in **Import History**
8. Monitor stats on **Dashboard** (auto-refreshes every 30s)

---

## Features

### Core (Fully Functional)
- **AI CSV Import** — Gemini 1.5 Flash maps any column names to GrowEasy CRM fields automatically
- **Real-time SSE Progress** — live batch-by-batch progress bar during AI processing (no fake timers)
- **AI Column Mapping Preview** — after import, shows exactly which original column mapped to which CRM field
- **CSV Validation Warnings** — warns before confirming if no email/phone column, empty rows, or unknown columns detected
- **Direct Mapping Fallback** — imports still work 100% even without a Gemini API key
- **Duplicate Detection** — skips leads whose email or mobile already exists in the CRM
- **Batch Processing** — processes records in batches of 15 with auto-retry (3 attempts, exponential backoff) on AI failure
- **Drag & Drop Upload** — react-dropzone with raw CSV preview table (sticky headers, scroll)
- **Confirm Step** — review raw data before triggering AI processing
- **Export CSV** — download all leads (or filtered by status) as a CSV file
- **Import History** — full page showing all past imports with date, counts, success rate, pagination
- **Manage Leads** — search, filter by status, view all imported leads with pagination, inline status update
- **Dashboard** — real-time stats: import history bar chart, status donut chart, live stat cards, 30s auto-refresh
- **API Center** — live backend/Gemini/DB status monitor, per-endpoint test with HTTP status + response time
- **CRM Fields** — view all 15 system fields, add/edit/delete custom fields (persisted to SQLite)
- **Team Members** — invite members (persisted to SQLite), role management, activate/deactivate
- **SQLite persistence** — leads, import history, team members, custom fields stored in `backend/groweasy.db`

### UI Pages (Interactive Modals & State)
- **Ad Accounts** — connect/manage modals, add custom platforms (LinkedIn, Twitter, TikTok, etc.), budget update, pause/resume
- **Lead Sources** — connect sources with account ID, status updates dynamically after connecting
- **WhatsApp Account** — connect phone, create message templates, send messages
- **Engage Leads** — create campaigns, pause/resume, delete with confirm
- **Tele Calling** — schedule calls, simulate call outcomes (Connected / Not Answered / Busy)
- **Generate Leads** — lead generation UI

### Bonus Features Implemented
- ✅ Drag & Drop upload
- ✅ Real-time SSE progress during AI processing
- ✅ Retry mechanism (3 attempts, exponential backoff)
- ✅ AI Column Mapping preview modal
- ✅ CSV validation warnings
- ✅ Import History page with pagination
- ✅ Unit tests (22 passing)
- ✅ Docker setup
- ✅ Deployed on Vercel (frontend) + Render (backend)
- ✅ Well-written README

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
| Testing | Jest (22 unit tests) |
| Dev Server | Nodemon |
| Containers | Docker + docker-compose |

---

## Project Structure

```
GrowEasy-Assignment/
├── backend/
│   ├── __tests__/
│   │   └── aiService.test.js       # 22 unit tests (date parsing, mapping, batching)
│   ├── controllers/
│   │   ├── leadsController.js      # CRUD for leads + stats + CSV export + import history
│   │   ├── processController.js    # AI processing pipeline + SSE streaming + column mapping
│   │   ├── uploadController.js     # CSV upload + parse
│   │   ├── teamController.js       # Team members CRUD
│   │   └── fieldsController.js     # Custom CRM fields CRUD
│   ├── middlewares/
│   │   └── uploadMiddleware.js     # Multer config (10 MB, CSV only)
│   ├── routes/
│   │   ├── leadsRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── teamRoutes.js
│   │   └── fieldsRoutes.js
│   ├── services/
│   │   ├── aiService.js            # Gemini AI + direct mapping fallback + date parser + batch callback
│   │   └── csvService.js           # CSV parsing helpers
│   ├── utils/
│   │   └── db.js                   # SQLite setup + schema (leads, import_history, team_members, custom_fields)
│   ├── server.js                   # Express app
│   ├── Dockerfile
│   └── .env                        # PORT, GEMINI_API_KEY, FRONTEND_URL
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main layout + page routing + modal orchestration + SSE handling
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Dashboard.tsx           # Real-time stats + charts
│   │   ├── ImportHistory.tsx       # Full import history page with pagination
│   │   ├── ManageLeads.tsx         # Lead table + search/filter/export
│   │   ├── ImportModal.tsx         # CSV upload → preview → import flow
│   │   ├── PreviewModal.tsx        # Raw CSV preview + validation warnings
│   │   ├── ResultModal.tsx         # Import results with all 15 CRM fields
│   │   ├── APICenter.tsx           # Backend monitor + endpoint tester
│   │   ├── CRMFields.tsx           # Field management + custom fields (DB-backed)
│   │   ├── TeamMembers.tsx         # Team management (DB-backed)
│   │   ├── AdAccounts.tsx          # Ad account management + add custom platforms
│   │   ├── LeadSources.tsx         # Lead source connect with dynamic status
│   │   ├── EngageLeads.tsx
│   │   ├── TeleCalling.tsx
│   │   ├── WhatsAppAccount.tsx
│   │   └── Sidebar.tsx
│   ├── services/
│   │   └── api.ts                  # Axios instance + leadsAPI + uploadAPI + teamAPI + fieldsAPI
│   ├── types/
│   │   └── crm.ts                  # TypeScript interfaces
│   └── Dockerfile
│
├── docker-compose.yml
└── TestFiles/
    ├── CRM_leads_import_29th_june.csv   # Real CRM data test file
    └── addresses.csv                    # Generic CSV test file
```

---

## Setup Instructions

### Prerequisites

- **Node.js 18+** — [download](https://nodejs.org)
- **npm** (comes with Node.js)
- A free **Google Gemini API key** — [get one here](https://aistudio.google.com/app/apikey) *(optional — imports work without it)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/sakshi-walunjkar/GrowEasy-Assignment.git
cd GrowEasy-Assignment
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
GEMINI_API_KEY=AIzaSy...your_key_here
FRONTEND_URL=http://localhost:3000
```

> **No Gemini key?** Leave it as `your_gemini_api_key_here` — the app uses direct column mapping fallback and all imports still work.

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

---

### 3. Frontend Setup

Open a **new terminal**:

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

### 4. Run Unit Tests

```bash
cd backend
npm test
```

Expected output: **22 tests passing** covering:
- Date parsing (ISO, Indian format, Unix timestamp)
- Column alias mapping
- Skip invalid records
- CRM status normalization
- Batch processing with callbacks

---

### 5. Deployment

#### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo: `sakshi-walunjkar/GrowEasy-Assignment`
3. Render auto-detects `render.yaml` — click **Apply**
4. Set environment variables in Render dashboard:
   - `GEMINI_API_KEY` → your key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
   - `FRONTEND_URL` → your Vercel frontend URL (set after deploying frontend)
5. Deploy — your backend URL will be `https://groweasy-backend.onrender.com`

#### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `sakshi-walunjkar/GrowEasy-Assignment` from GitHub
3. Vercel auto-detects `vercel.json` — root directory is set to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` → `https://groweasy-backend.onrender.com/api`
5. Deploy — your frontend URL will be `https://grow-easy-assignment.vercel.app`
6. Go back to Render → update `FRONTEND_URL` to your Vercel URL → redeploy

---

### 6. Docker Setup (Optional)

```bash
# From project root
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

Set `GEMINI_API_KEY` in `docker-compose.yml` or pass as environment variable.

---

### 7. Verify TypeScript (Optional)

```bash
cd frontend
npx tsc --noEmit
# exits 0 — no errors
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/upload` | Upload & parse CSV file |
| POST | `/api/process` | AI-extract CRM fields (standard) |
| POST | `/api/process-stream` | AI-extract with SSE real-time progress |
| GET | `/api/leads` | Fetch all leads (`?q=`, `?status=`, `?page=`, `?limit=`) |
| GET | `/api/leads/stats` | Lead stats + import history |
| GET | `/api/leads/export` | Download leads as CSV (`?status=` filter) |
| GET | `/api/leads/import-history` | Full paginated import history |
| GET | `/api/leads/:id` | Get single lead |
| PATCH | `/api/leads/:id` | Update lead fields |
| DELETE | `/api/leads/:id` | Delete single lead |
| DELETE | `/api/leads` | Clear all leads and history |
| GET | `/api/gemini-status` | Check if Gemini API key is configured |
| GET | `/api/team` | Get all team members |
| POST | `/api/team` | Invite team member |
| PATCH | `/api/team/:id` | Update member role/status |
| DELETE | `/api/team/:id` | Remove team member |
| GET | `/api/fields` | Get custom CRM fields |
| POST | `/api/fields` | Add custom field |
| PATCH | `/api/fields/:id` | Update custom field |
| DELETE | `/api/fields/:id` | Delete custom field |

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
2. Rows are split into **batches of 15**
3. Each batch is sent to **Gemini 1.5 Flash** with a detailed system prompt
4. **SSE events** stream real-time progress back to the frontend per batch
5. Gemini maps any column names → GrowEasy CRM fields
6. If Gemini fails → automatic **fallback to direct column alias mapping**
7. Records with neither email nor mobile are **skipped**
8. Records whose email or mobile **already exist** in the DB are skipped as duplicates
9. All extracted records are saved to SQLite in a single transaction
10. **Column mapping summary** returned showing original column → CRM field

**Fallback mapping handles column name variations like:**
- `Full Name`, `Contact Name`, `Customer` → `name`
- `Phone`, `Mobile`, `Cell`, `Ph No` → `mobile_without_country_code`
- `Remarks`, `Notes`, `Comment` → `crm_note`
- `Status`, `Lead Status`, `Stage` → `crm_status`

**Date parsing handles:**
- ISO 8601: `2026-05-13T14:20:48Z`
- Indian format: `13/06/2026`, `13-06-2026`
- Natural language: `June 13 2026`, `13-Jun-2026`
- Unix timestamps: `1718265600` (10-digit) or `1718265600000` (13-digit)

---

## CSV Validation Warnings

Before confirming import, the preview step automatically checks for:

| Warning | Type |
|---------|------|
| No email or phone column detected | 🔴 Warning |
| Only email found (no phone) | 🔵 Info |
| Only phone found (no email) | 🔵 Info |
| No name column detected | 🔵 Info |
| Completely empty rows found | 🔴 Warning |
| Unrecognized column names | 🔵 Info (AI will map) |
| Large file (200+ rows) | 🔵 Info (shows batch count) |

---

## Test Files

Two CSV files are included in `TestFiles/` to test the importer:

- `CRM_leads_import_29th_june.csv` — real CRM format with standard column names
- `addresses.csv` — generic address data to test AI column mapping

---

## Environment Variables Reference

**`backend/.env`**
```env
PORT=5000
GEMINI_API_KEY=AIzaSy...          # Get from aistudio.google.com/app/apikey
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to backend` | Make sure `npm run dev` is running in `backend/` (local) or backend is awake on Render |
| `CORS error` | Check `FRONTEND_URL` in `backend/.env` (local) or Render env vars (deployed) matches your frontend URL |
| `Gemini API error` | Verify your API key starts with `AIzaSy` and has no extra spaces |
| `CSV not uploading` | File must be `.csv` extension, max 10 MB |
| `0 leads imported` | All rows may lack both email and mobile — check CSV validation warnings |
| `Duplicate leads skipped` | Expected — same email/mobile won't be imported twice |
| Port 5000 in use | Change `PORT=5001` in `backend/.env` and update `NEXT_PUBLIC_API_URL` |
| `Stream failed` error | Backend may not support SSE — check Express version is 5.x |

---

## Key Design Decisions

- **SSE over WebSockets** — simpler, HTTP-native, perfect for one-way progress streaming
- **No auth required** — single-user local CRM tool as per assignment scope
- **SQLite over PostgreSQL** — zero-config, file-based, perfect for local demo
- **Gemini lazy-init** — AI model only initializes when a valid key is present, no crash on startup
- **Batch size 15** — balances Gemini token limits vs. number of API calls
- **WAL mode** — SQLite Write-Ahead Logging for better concurrent read performance
- **Transaction inserts** — all leads from one import saved atomically (all-or-nothing)
- **Dual endpoints** — `/api/process` (standard JSON) + `/api/process-stream` (SSE) for flexibility
