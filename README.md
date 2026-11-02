# SupportIQ — AI Customer Support & Knowledge Operations Platform

SupportIQ is an enterprise-grade AI customer support platform built using the **Midnight Operations** visual identity. It integrates Generative AI, Retrieval-Augmented Generation (RAG), automated ticket intelligence, and real-time operational telemetry using **Supabase (PostgreSQL, Row Level Security, Auth, Storage)** and **Google Gemini 3.8 Flash**.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    SupportIQ Frontend (React 19)     │
                      │       "Midnight Operations" UI       │
                      └──────────────────┬───────────────────┘
                                         │
                   Client Auth & Queries │ (Public Anon Key + RLS)
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Supabase Client & Auth Gateway    │
                      └──────────────────┬───────────────────┘
                                         │
                 Server REST / RAG Calls │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    SupportIQ Backend (Express.js)    │
                      │  • Gemini 3.8 Flash RAG Pipeline     │
                      │  • Ticket Intelligence AI            │
                      │  • Privileged Supabase Service Role  │
                      └──────────┬─────────────────┬─────────┘
                                 │                 │
                SQL & Storage    │                 │ Grounding & Vectors
                                 ▼                 ▼
          ┌────────────────────────────┐    ┌─────────────────────┐
          │    Supabase PostgreSQL     │    │   Google Gemini     │
          │  • Multi-Tenant RLS Tables │    │   3.8 Flash API     │
          │  • Storage: knowledge-docs │    │                     │
          └────────────────────────────┘    └─────────────────────┘
```

---

## Key Features

1. **Supabase PostgreSQL & Row Level Security (RLS)**:
   - Full PostgreSQL relational schema (`supabase/schema.sql`) for organizations, users, tickets, comments, documents, chunks, conversations, and evaluations.
   - Comprehensive multi-tenant RLS policies enforcing organization-level isolation and role-based permissions (`ADMIN`, `SUPPORT_AGENT`, `CUSTOMER`).
   - Customer data is strictly isolated; internal support notes are hidden from customers.

2. **Supabase Authentication**:
   - Supabase Auth supporting password-based login, registration, and OAuth (Google / GitHub).
   - Instant Demo Role Switcher for seamless development and evaluation without login friction.

3. **Supabase Storage**:
   - `knowledge-documents` storage bucket for uploaded knowledge base assets (PDF, DOCX, TXT, Markdown).

4. **Preserved Gemini 3.8 Flash RAG Pipeline**:
   - Strict server-side `@google/genai` calls with `User-Agent: 'aistudio-build'`.
   - Hybrid retrieval combining BM25 keyword matching and vector semantic scoring.
   - Verified grounded citations (document title, section, page, and exact quote extract).

5. **AI Ticket Intelligence**:
   - Automatic classification into 6 support categories.
   - Sentiment analysis (-1.0 to +1.0) and urgency scoring.
   - Executive problem summary.
   - Suggested agent response with one-click **"Insert into Reply"** allowing human agents to review and refine before sending.

6. **Automated AI Quality Benchmark**:
   - Automated 8-suite evaluation runner checking retrieval hit rates, semantic relevance, groundedness, and sub-500ms latency.

7. **Operational Analytics**:
   - Database-calculated KPIs: Active Support Load, Mean Resolution Time, Customer CSAT, AI Deflection Rate.
   - Recharts visual volume trajectories and sentiment distributions.
   - One-click CSV ticket report export.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React, Recharts
- **Backend**: Node.js, Express.js (mounted with Vite middlewares for full-stack HMR in development)
- **Database & Auth**: Supabase PostgreSQL 15, Row Level Security (RLS), Supabase Storage, Supabase Auth
- **AI & RAG Engine**: Google GenAI SDK (`@google/genai`), Gemini 3.8 Flash (`gemini-3.8-flash`), Hybrid BM25 + Vector Retrieval
- **Runtime & Deployment**: Node.js, Google Cloud Run

---

## Installation & Local Development

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/patelanurag250-ctrl/SupportIQ.git
cd SupportIQ
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `GEMINI_API_KEY`.

### 3. Initialize Supabase Database
Run `supabase/schema.sql` in your Supabase Dashboard SQL Editor to create tables, indexes, and RLS policies.

### 4. Run Development Server
```bash
npm run dev
```
The full-stack application will be live at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## Database Setup (Supabase)

To initialize your Supabase PostgreSQL instance:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run the SQL script located in `supabase/schema.sql`.
3. The script creates all tables, foreign keys, indexes, and activates Row Level Security (RLS) policies.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# Supabase Project Credentials (Current API Key Format)
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_SECRET_KEY="your-secret-key"

# Client Vite Environment Variables
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"

# Google Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_MODEL="gemini-3.8-flash"

# Server Configuration (CLIENT_URL is optional during development/preview)
PORT="3000"
CLIENT_URL=""
```

> **Security Mandate**: Never expose `SUPABASE_SECRET_KEY` to browser or client code (never use as a `VITE_` prefix variable). Privileged database mutations remain strictly on the backend server.

---

## Demo Accounts

Switch roles instantly from the top-right profile menu:
- **Admin**: `admin@supportiq.com` (full organization oversight, RAG evaluations, document ingestion)
- **Support Agent**: `sarah.agent@supportiq.com` (queue triage, review/send AI suggested responses)
- **Customer**: `elena.rodriguez@clientcorp.io` (incident creation, personal tickets, AI Assistant)

---

## Deployment to Google Cloud Run

```bash
npm run build
npm start
```
The Express server serves the compiled static files and backend API on `0.0.0.0:${PORT}`.
