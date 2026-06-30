# ⚙️ CivicAI — Backend

Welcome to the **CivicAI** backend—the high-performance, AI-driven core of the platform. Built with **NestJS**, **Prisma (PostgreSQL)**, and **Socket.io**, it orchestrates report ingestion, AI-triage routing, duplication checks, and real-time dispatch synchronization.

---

## 🌟 Key Backend Features

### 1. 🤖 AI Triage & Orchestration Engine

- **Automated Categorization:** Analyzes citizen complaints (text/images) via **Google Gemini AI / OpenAI** to identify the issue category (_Roads_, _Sanitation_, _Environment_, _Parks_).
- **Automatic Severity Assessment:** Determines the urgency (High, Medium, Low) and assigns a target SLA response limit (e.g., 24h, 48h, 72h).
- **Duplicate Detection:** Employs semantic analysis and image-hashing to identify duplicate reports within proximity coordinates.
- **Auto-Routing:** Dynamically assigns the ticket to the corresponding municipal department.

### 2. 📡 Real-Time Synchronized Dispatch

- **WebSocket Server:** Uses **Socket.io** to broadcast updates instantly to all connected clients.
- **Live Status Broadcasts:** When an authority updates a ticket's status on `/tracker` (e.g. assigning a crew, setting officer status to _In Progress_ or _Resolved_), the changes reflect instantly on the citizen's browser.

### 3. 💾 Secure Data Persistence

- **Database Management:** Configured with **PostgreSQL** for storing reports, user points, verification history, and officer dispatch records.
- **Next-Gen ORM:** Uses **Prisma ORM** for easy type-safe database queries and migrations.

### 4. 🎛️ Cross-Origin Resource Sharing (CORS)

- Secured and configured CORS policy to enable smooth document uploads and API requests from the Next.js frontend.

---

## 🛠️ Technology Stack

- **Core Framework:** NestJS (NodeJS)
- **Database ORM:** Prisma ORM
- **Database:** PostgreSQL
- **WebSockets:** Socket.io
- **AI Model API:** Google Gemini Pro / OpenAI GPT-4o

---

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 20.9.0)
- PostgreSQL Database Server running locally or in the cloud.

### Environment Setup

Create a `.env` file in the root of the `backend` folder:

```ini
# Server Configuration
PORT=3001

# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/civicai?schema=public"

# AI Model APIs
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# WebSocket Config
SOCKET_PORT=3002
```

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run Prisma Database Migrations
npx prisma migrate dev --name init

# 3. Start the development server (with watch mode)
npm run start:dev
```

The server will start running on [http://localhost:3001](http://localhost:3001).

---

## 📡 API Endpoint Overview

### Citizen Services

- `POST /api/issues` — Intake a citizen report (processes description, coordinates, image URL, and flags categories).
- `GET /api/issues` — Query all active or resolved issues.
- `GET /api/issues/:id` — Retrieve details, timeline tracker, and assigned officer for a specific `REP-XXXX` code.

### Authority Tools

- `PATCH /api/issues/:id/dispatch` — Assign an officer, set SLA limits, and update progress states.

### Gamification & Community

- `GET /api/users/:userId/points` — Retrieve citizen's XP, badges, and leaderboard standing.
- `POST /api/issues/:id/verify` — Submit a community verification picture to secure bonus XP and resolve a ticket.

---

## 📂 Project Structure

```bash
backend/
├── prisma/                 # Database Schema and Migrations
│   └── schema.prisma       # Prisma Database Layout
├── src/
│   ├── issues/             # Issues Module (Controllers, Services, Logic)
│   ├── users/              # Users & Leaderboard Module
│   ├── ai/                 # AI Engine service wrappers (Gemini/OpenAI)
│   ├── gateway/            # Socket.io Gateways for WebSocket broadcasts
│   └── main.ts             # Application entry point (sets up CORS & ports)
└── package.json
```
