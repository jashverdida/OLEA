<div align="center">

```
 ██████╗ ██╗     ███████╗ █████╗
██╔═══██╗██║     ██╔════╝██╔══██╗
██║   ██║██║     █████╗  ███████║
██║   ██║██║     ██╔══╝  ██╔══██║
╚██████╔╝███████╗███████╗██║  ██║
 ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
```

**Oltek Logistics Extraction Automation**

*Extract, review, and export structured logistics data from digital service contracts — entirely local, at zero cost.*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![API Cost](https://img.shields.io/badge/API%20Cost-%240.00-22C55E?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-A855F7?style=for-the-badge)](LICENSE)

</div>

---

## What is O.L.E.A.?

O.L.E.A. is a **hackathon-built MVP** that eliminates hours of manual data entry by automatically extracting structured data from OLTK digital service contract PDFs.

Drop in a PDF → get a fully structured Excel workbook with all rate tables, header metadata, and commodity codes — in **under 2 seconds**, with **zero API costs**.

### Why it matters

| The Old Way | O.L.E.A. |
|---|---|
| 2–4 hours manual copy-paste per contract | **~1.3 seconds** automated extraction |
| Human error in rate tables | **Regex-verified** with confidence scoring |
| Expensive OCR/NLP cloud APIs | **$0.00** — fully local |
| Data leaves your network | **100% on-premise** — data never leaves your machine |

---

## Features

- **⚡ Sub-2s Extraction** — PyMuPDF word-grouping reconstructs multi-column tables 57× faster than pdfplumber alone
- **🎯 100% Confidence on ATL0347N25** — 1,385 rate rows, all 6 header fields, all commodities
- **🟢🟡🔴 Human-in-the-Loop** — Per-field confidence badges (EXTRACTED / PARTIAL / MISSING); every field is editable before export
- **📊 One-Click Excel Export** — Two-sheet workbook: `Contract Header` + `Rate Table` with colour-coded confidence
- **🔒 Zero Cloud Dependency** — No OpenAI, no AWS Textract, no Google Document AI
- **✨ Glassmorphism Dashboard** — Animated PS3-style background, frosted glass panels, framer-motion transitions

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│   ┌──────────┐   ┌─────────────────┐   ┌───────────────┐   │
│   │UploadZone│   │ ResultsDashboard│   │   RateTable   │   │
│   │drag+drop │──▶│ Header fields   │   │ 1,385 rows    │   │
│   │laser scan│   │ Confidence bars │   │ search+sort   │   │
│   └──────────┘   └─────────────────┘   └───────────────┘   │
│              React 18 + Framer Motion + Tailwind CSS        │
└──────────────────────────┬──────────────────────────────────┘
                           │ axios  POST /upload · POST /export
┌──────────────────────────▼──────────────────────────────────┐
│                     FastAPI  :8000                           │
│   POST /upload ──▶ parse_contract(pdf) ──▶ JSON             │
│   POST /export ──▶ pandas + openpyxl  ──▶ .xlsx download    │
│   GET  /health ──▶ { status: "ok", api_cost_usd: 0.00 }     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      parser.py                              │
│  PDF ──▶ PyMuPDF (fitz) word-grouping ──▶ reconstructed txt │
│       └─▶ fallback: pdfplumber if fitz unavailable          │
│  Regex engine:                                              │
│   • Header    : contract_no, carrier, shipper, dates        │
│   • Trade lanes: [NORTH AMERICA - ASIA (WB)]                │
│   • Commodities: TPWB / TAEB / FAK codes                    │
│   • Rate rows  : anchor (CY|SD + Dry|Reefer + USD)          │
│                  Y-coord grouping joins split columns        │
│  Every field: { value, confidence: 0|0.5|1.0, status }      │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance

Tested on `ATL0347N25 Contract (1).pdf` — 94 pages, OLTK Westbound service contract.

| Metric | Result |
|---|---|
| Processing time | **1.33 s** |
| Pages scanned | **94** |
| Rate rows extracted | **1,385** |
| Header fields | **6 / 6** |
| Overall confidence | **100%** |
| API cost | **$0.00** |

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | 3.10 + | 3.14 tested and working |
| Node.js | 18 + | LTS recommended |
| npm | 9 + | Bundled with Node |

---

## Quick Start

### 1 — Clone

```bash
git clone https://github.com/jashverdida/OLEA.git
cd OLEA
```

### 2 — Backend

```bash
cd backend
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

API live at `http://localhost:8000` · Interactive docs: `http://localhost:8000/docs`

### 3 — Frontend

Open a **second terminal:**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4 — Use it

1. Drop an OLTK service contract PDF onto the glowing upload zone
2. Watch the laser-scan animation (~1.3 s for a 94-page contract)
3. Review extracted fields — click any value to correct it inline
4. Click **Export to Excel** → download your structured `.xlsx`

---

## Project Structure

```
OLEA/
│
├── backend/
│   ├── parser.py           # Core extraction engine (PyMuPDF + regex)
│   ├── main.py             # FastAPI server (POST /upload, POST /export)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx                      # Root state machine + dashboard shell
    │   ├── index.css                    # Design system (PS3 orbs, glassmorphism)
    │   ├── main.jsx
    │   └── components/
    │       ├── Sidebar.jsx              # Icon nav with cyan active glow
    │       ├── StatsRow.jsx             # $0.00 · 1.2s · 1,402 docs stat cards
    │       ├── UploadZone.jsx           # Drag-drop + laser scan animation
    │       ├── ResultsDashboard.jsx     # Confidence review + editable panels
    │       ├── RateTable.jsx            # Sortable, searchable, paginated table
    │       └── ConfidenceBadge.jsx      # Green / Yellow / Red pill component
    ├── tailwind.config.js
    ├── vite.config.js                   # Dev proxy → :8000
    └── package.json
```

---

## API Reference

### `POST /upload`

Upload a PDF contract, receive structured JSON.

**Request:** `multipart/form-data` — field name `file` (PDF only)

**Response (excerpt):**
```json
{
  "processing_time_ms": 1333,
  "api_cost_usd": 0.00,
  "overall_confidence": 1.0,
  "page_count": 94,
  "header": {
    "contract_no":    { "value": "ATL0347N25",    "confidence": 1.0, "status": "EXTRACTED" },
    "carrier":        { "value": "OLTEK",          "confidence": 1.0, "status": "EXTRACTED" },
    "shipper":        { "value": "Hayahai",         "confidence": 1.0, "status": "EXTRACTED" },
    "effective_date": { "value": "01 Jul, 2025",   "confidence": 1.0, "status": "EXTRACTED" },
    "expiration_date":{ "value": "30 JUN, 2026",   "confidence": 1.0, "status": "EXTRACTED" }
  },
  "rate_records": [
    {
      "origin":      { "value": "CHARLESTON, SC, UNITED STATES", "confidence": 1.0, "status": "EXTRACTED" },
      "destination": { "value": "DALIAN, LIAONING",              "confidence": 1.0, "status": "EXTRACTED" },
      "rate_20":     { "value": "360",  "confidence": 1.0, "status": "EXTRACTED" },
      "rate_40":     { "value": "450",  "confidence": 1.0, "status": "EXTRACTED" },
      "rate_40hc":   { "value": "450",  "confidence": 1.0, "status": "EXTRACTED" },
      "rate_45":     { "value": "800",  "confidence": 1.0, "status": "EXTRACTED" }
    }
  ]
}
```

### `POST /export`

Send (optionally user-corrected) JSON → receive `.xlsx` download.

**Body:** `{ header, commodities, rate_records }` — same shape as `/upload` response.

### `GET /health`

```json
{ "status": "ok", "service": "O.L.E.A.", "api_cost_usd": 0.00 }
```

---

## Confidence System

Every extracted field carries a confidence envelope:

| Status | Score | UI Badge | Meaning |
|---|---|---|---|
| `EXTRACTED` | `1.0` | 🟢 **100%** | Regex matched exactly — no action needed |
| `PARTIAL` | `0.5` | 🟡 **Review** | Matched but ambiguous — human review recommended |
| `MISSING` | `0.0` | 🔴 **0%** | Pattern not found — manual entry required |

All `PARTIAL` and `MISSING` fields are highlighted and **editable inline** before export.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| PDF extraction | **PyMuPDF 1.27** (fitz) | Fast word-level text extraction (57× speedup) |
| Text parsing | **Python `re`** | Zero-dependency pattern matching |
| API framework | **FastAPI 0.135** | Async REST endpoints + automatic OpenAPI docs |
| Excel export | **pandas 2.3 + openpyxl** | DataFrame → styled .xlsx workbook |
| Frontend | **React 18 + Vite** | SPA with instant hot-module reload |
| Animations | **Framer Motion 11** | Laser scan, page transitions, confidence bar |
| Styling | **Tailwind CSS 3** | Utility-first glassmorphism design system |
| Icons | **Lucide React** | Crisp, consistent SVG icon set |

---

## Roadmap

- [ ] Multi-contract batch processing with progress queue
- [ ] Template learning — refine regex patterns from user corrections
- [ ] Contract diff view — compare two rate schedules side by side
- [ ] Direct output into OLTK `.xlsm` macro-enabled template
- [ ] Local LLM fallback for non-standard or scanned PDF layouts

---

<div align="center">

Built at Oltek · Hackathon MVP · 2025

*Zero cloud calls · Fully local · $0.00 per document*

</div>
