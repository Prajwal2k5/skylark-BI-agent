# 🦅 Skylark BI Agent - Full-Stack Monday.com AI Business Intelligence Assistant

**Skylark BI Agent** is a full-stack executive AI Business Intelligence chatbot and dashboard built with **React**, **Tailwind CSS**, **Node.js**, **Express**, **Monday.com GraphQL API v2**, and **Google Gemini AI**.

It seamlessly integrates live Monday.com boards (**Deals** and **Work Orders**), cleans and normalizes messy real-world datasets (handling nulls, inconsistent date formats, currency strings, missing fields), and empowers founders and executives to ask complex business queries, discover operational risks, view interactive charts, and generate 1-click leadership briefings.

---

## 🌟 Key Features

- 💬 **Interactive BI Chat Interface**:
  - Conversational AI assistant with message history and preset suggested questions (*Pipeline Health*, *Revenue by Sector*, *Delayed Work Orders*, *Leadership Summary*).
  - Dynamic step-by-step loading state ("Connecting to Monday.com...", "Cleaning & normalizing data...", "Generating executive insights...").
  - Embedded **Recharts** visualizations directly in AI response bubbles.
  - Clarifying questions detector for vague or ambiguous founder queries.

- 📊 **Executive BI Analytics Dashboard**:
  - Top KPI summary cards (*Total Pipeline Value*, *Active Open Deals*, *Work Orders Execution*, *Delayed Projects Risk Value*).
  - Interactive sector revenue bar charts and work order execution pie charts.
  - At-risk delayed projects table.

- 🔍 **Data Hygiene & Data Inspector**:
  - Automatic Data Hygiene Score calculation (0-100%).
  - Searchable and filterable data tables for live normalized Deals and Work Orders datasets.

- 👑 **Leadership Updates Studio**:
  - 1-Click Executive Board Briefing generator combining pipeline revenue metrics and project execution risks into a copyable markdown report.

- 🛡️ **Resilient Dual Ingestion & AI Engine**:
  - Supports live **Monday.com GraphQL API v2** querying with automatic board discovery.
  - Seamless fallback to local dataset loading (`Deal funnel Data.xlsx` & `Work_Order_Tracker Data.xlsx`) if API credentials are not set.
  - Integrates **Google Gemini API** (`GEMINI_API_KEY`) with an automatic local heuristic AI fallback engine for offline testing.

---

## 🏗️ Architecture Overview

```
skylark/
├── server/                      # Node.js + Express Backend API
│   ├── .env.example             # Environment variables template
│   ├── src/
│   │   ├── index.js             # Express server entry point
│   │   ├── routes/
│   │   │   └── apiRoutes.js     # API Endpoints (/api/status, /api/data, /api/chat, /api/leadership-update)
│   │   ├── services/
│   │   │   ├── mondayService.js # Monday.com GraphQL API v2 Client
│   │   │   ├── dataCleaningService.js # Normalization engine & KPI calculator
│   │   │   ├── aiService.js     # Google Gemini AI Integration & Local AI Engine
│   │   │   └── localDataLoader.js # Offline Excel dataset loader fallback
│   │   └── utils/
│   │       └── logger.js        # Logging utility
├── client/                      # Vite + React 19 Frontend
│   ├── src/
│   │   ├── App.jsx              # Main tabbed application container
│   │   ├── components/
│   │   │   ├── Header.jsx       # Header with status badges & API key settings
│   │   │   ├── KpiCards.jsx     # Executive KPI cards
│   │   │   ├── ChatInterface.jsx# Conversational chat UI with markdown & charts
│   │   │   ├── DashboardView.jsx# BI Analytics charts & risk tables
│   │   │   ├── DataInspector.jsx# Data quality meter & table view
│   │   │   ├── LeadershipStudio.jsx# Executive briefing generator
│   │   │   └── ChartRenderer.jsx# Recharts renderer component
│   │   └── services/
│   │       └── api.js           # API communication client
├── README.md                    # Setup and documentation
└── DECISION_LOG.md              # 2-Page Executive Decision Log
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `server/` directory (or copy from `server/.env.example`):

```env
# Server Port
PORT=5000

# Monday.com GraphQL API v2 Key
MONDAY_API_KEY=your_monday_api_key_here

# Optional Board IDs (Auto-discovered if left blank)
MONDAY_DEALS_BOARD_ID=
MONDAY_WORK_ORDERS_BOARD_ID=

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Gemini Model Name (default: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash
```

> **Note**: You can also enter or update your `MONDAY_API_KEY` and `GEMINI_API_KEY` directly in the web UI using the **"API Config"** button in the header bar!

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
From the project root:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Start Backend Server
In the `server/` directory:

```bash
npm start
```
The server will boot up at `http://localhost:5000`.

### Step 3: Start Frontend Client
In a separate terminal, navigate to `client/`:

```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🔌 Monday.com Board Setup Guide

1. Log in to your **Monday.com** account.
2. Create two new boards:
   - Board 1: **Deals** (Import `Deal funnel Data.xlsx` or CSV)
   - Board 2: **Work Orders** (Import `Work_Order_Tracker Data.xlsx` or CSV)
3. Navigate to **Avatar -> Developers -> API Tokens** to copy your Personal API Token.
4. Add `MONDAY_API_KEY` to your `server/.env` file or paste it into the **API Config** modal in the top right of the Skylark BI Agent header.

---

## 📄 Deliverables

- `README.md`: Technical documentation & setup guide.
- `DECISION_LOG.md`: Executive decision log covering trade-offs, assumptions, leadership updates interpretation, and future scope.
