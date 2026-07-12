# GrowEasy — CRM Lead Importer

A full-stack CRM dashboard where you can upload any CSV file and let AI figure out which columns map to which CRM fields. Built with Next.js, Express, and Google Gemini.

> Applying for: Software Developer Intern
> Submission to: varun@groweasy.ai

---

## Live Links

| | URL |
|---|---|
| Frontend | https://grow-easy-assignment.vercel.app |
| Backend | https://groweasy-backend.onrender.com |

> The backend runs on Render's free tier, so the first request might take 30–60 seconds to wake up. Just wait a moment and try again.

---

## What it does

You upload a CSV file — doesn't matter what the column names are. The app sends it to Gemini AI which figures out what each column means and maps it to the right CRM field. You get a live progress bar while it's processing, and after it's done you can see exactly what got mapped where.

If you don't have a Gemini API key, it still works using a built-in fallback that matches common column name variations.

---

## Features

**Import flow**
- Drag and drop CSV upload
- Preview your raw data before importing
- Warnings if the file is missing email/phone columns or has empty rows
- Live progress bar (real SSE, not a fake timer) while AI processes batches
- See the full column mapping after import — what original column became what CRM field

**Lead management**
- Search and filter leads by status
- Update lead status inline
- Export leads to CSV (all or filtered by status)
- Duplicate detection — same email or phone won't be imported twice

**Other pages**
- Dashboard with charts and stats (auto-refreshes every 30s)
- Import History — see all past imports with success rates
- CRM Fields — view system fields, add your own custom fields
- Team Members — invite people, manage roles
- API Center — check backend/Gemini/DB status, test endpoints live
- Ad Accounts, Lead Sources, WhatsApp, Engage Leads, Tele Calling pages (UI with modals and state)

---

## Tech used

**Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts, Axios, react-dropzone

**Backend** — Node.js, Express 5, SQLite (better-sqlite3), Multer, csv-parser

**AI** — Google Gemini 1.5 Flash

**Other** — Jest (22 unit tests), Docker, deployed on Vercel + Render

---

## Running locally

You need Node.js 18+ installed. A Gemini API key is optional.

**1. Clone the repo**

```bash
git clone https://github.com/sakshi-walunjkar/GrowEasy-Assignment.git
cd GrowEasy-Assignment
```

**2. Start the backend**

```bash
cd backend
npm install
```

Create a file called `.env` inside the `backend` folder:

```
PORT=5000
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
```

Get a free Gemini key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). If you skip it, imports still work via fallback mapping.

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

**3. Start the frontend**

Open a new terminal:

```bash
cd frontend
npm install
```

Create a file called `.env.local` inside the `frontend` folder:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Running tests

```bash
cd backend
npm test
```

22 tests covering date parsing, column mapping, duplicate detection, status normalization, and batch processing.

---

## Deploying

**Backend on Render**

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Render picks up `render.yaml` automatically — just click Apply
4. Add these environment variables in the Render dashboard:
   - `GEMINI_API_KEY` — your Gemini key
   - `FRONTEND_URL` — your Vercel URL (fill this in after deploying frontend)
5. Hit Deploy

**Frontend on Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import the same GitHub repo
3. Vercel reads `vercel.json` and sets the root directory to `frontend` automatically
4. Add this environment variable:
   - `NEXT_PUBLIC_API_URL` — your Render backend URL + `/api`
5. Hit Deploy
6. Go back to Render and update `FRONTEND_URL` to your Vercel URL, then redeploy

**Docker (optional)**

```bash
docker-compose up --build
```

Frontend at `http://localhost:3000`, backend at `http://localhost:5000`. Set `GEMINI_API_KEY` in `docker-compose.yml`.

---

## Project structure

```
GrowEasy-Assignment/
├── backend/
│   ├── __tests__/          # Jest unit tests
│   ├── controllers/        # Route handlers (leads, upload, process, team, fields)
│   ├── middlewares/        # Multer file upload config
│   ├── routes/             # Express route definitions
│   ├── services/           # AI logic (Gemini + fallback), CSV parsing
│   ├── utils/db.js         # SQLite setup and schema
│   └── server.js           # Express app entry point
│
├── frontend/
│   ├── app/                # Next.js app router (page.tsx is the main layout)
│   ├── components/         # All UI components
│   ├── services/api.ts     # Axios API calls
│   └── types/crm.ts        # TypeScript types
│
├── TestFiles/              # Sample CSVs to test the importer
├── render.yaml             # Render deployment config
├── vercel.json             # Vercel deployment config
└── docker-compose.yml
```

---

## API endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/` | Health check |
| POST | `/api/upload` | Upload and parse a CSV |
| POST | `/api/process` | Run AI extraction (returns JSON) |
| POST | `/api/process-stream` | Run AI extraction with live SSE progress |
| GET | `/api/leads` | Get leads (supports search, filter, pagination) |
| GET | `/api/leads/stats` | Stats for the dashboard |
| GET | `/api/leads/export` | Download leads as CSV |
| GET | `/api/leads/import-history` | All past imports |
| PATCH | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead |
| DELETE | `/api/leads` | Clear everything |
| GET | `/api/gemini-status` | Check if Gemini key is set |
| GET/POST/PATCH/DELETE | `/api/team` | Team member management |
| GET/POST/PATCH/DELETE | `/api/fields` | Custom CRM field management |

---

## CRM fields

These are the 15 fields every lead gets mapped to:

| Field | Description |
|-------|-------------|
| `name` | Full name |
| `email` | Email address |
| `country_code` | Phone country code (e.g. +91) |
| `mobile_without_country_code` | Phone number without country code |
| `company` | Company name |
| `city` | City |
| `state` | State |
| `country` | Country |
| `lead_owner` | Assigned agent's email |
| `crm_status` | GOOD_LEAD_FOLLOW_UP / DID_NOT_CONNECT / BAD_LEAD / SALE_DONE |
| `crm_note` | Any notes or remarks |
| `data_source` | Where the lead came from |
| `possession_time` | Property possession timeline |
| `description` | Extra info |
| `created_at` | When the lead was imported |

---

## How the AI import works

1. You upload a CSV — it gets parsed into rows
2. Rows are split into batches of 15
3. Each batch goes to Gemini with a prompt explaining the CRM fields
4. Gemini maps whatever column names you have to the right CRM fields
5. Progress streams back live via SSE so you see a real progress bar
6. If Gemini fails on a batch, it retries up to 3 times with backoff
7. If Gemini is unavailable entirely, a fallback mapper handles common column name variations
8. Rows without email or phone are skipped
9. Rows with an email/phone already in the DB are skipped as duplicates
10. Everything else gets saved to SQLite

The fallback handles things like: `Full Name` → `name`, `Phone / Mobile / Cell` → `mobile_without_country_code`, `Remarks / Notes` → `crm_note`, etc.

Date formats supported: ISO 8601, Indian format (DD/MM/YYYY), natural language (June 13 2026), Unix timestamps.

---

## Common issues

**Backend not connecting** — make sure `npm run dev` is running in the `backend` folder. On Render, the free tier sleeps after inactivity — just wait 30–60s.

**CORS error** — the `FRONTEND_URL` in your backend `.env` needs to exactly match where your frontend is running.

**Gemini error** — check your API key starts with `AIzaSy` and has no extra spaces.

**0 leads imported** — your CSV rows probably don't have email or phone. Check the validation warnings on the preview screen.

**Port 5000 in use** — change `PORT=5001` in `backend/.env` and update `NEXT_PUBLIC_API_URL` to match.

---

## Test files

Two sample CSVs are in the `TestFiles/` folder:

- `CRM_leads_import_29th_june.csv` — standard CRM format, tests direct mapping
- `addresses.csv` — generic address data, tests AI column mapping
