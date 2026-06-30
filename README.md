# 🏛️ CivicAI 

Welcome to the **CivicAI** —a modern, AI-augmented citizen engagement and municipal operations mapping portal. Built with **Next.js 15**, **Tailwind CSS v4**, and **Clerk**, civic engagement is made seamless, transparent, and gamified.

---

## 🌟 Key Features

### 1. 🧑‍💻 Citizen Portal (`/report`)

- **AI-Assisted Reporting:** Citizens can submit pictures, text, or **AI Voice Messages (Speech-to-Text)** to describe local issues.
- **Map Pinning & Search:** Integrated **Leaflet Maps + OpenStreetMap API** allowing citizens to search addresses or click the map to drop a precise pin.
- **Issue Classification:** Dropdown menu for categorizing issues: _Road Pothole_, _Sewer Blockage_, _Streetlight Issue / Power Outage_, or _Other_.
- **Immediate Triage Feedback:** The system generates a unique submission ID (e.g., `REP-1024`) and displays a glassmorphic confirmation displaying the AI-triaged department and severity.

### 2. 🔍 Real-Time Issue Tracker (`/tracker`)

- **Chronological Timeline:** View progress as the issue moves through _Reported_, _Triaged_, _Officer Dispatched_, and _Resolved_.
- **Operations Transparency:** Displays the assigned municipal officer and target SLA (Service Level Agreement) timeline.
- **Recent Submissions Sidebar:** Persists reported issues in the browser's `localStorage` so citizens can track their reports with a single click.

### 3. ⚡ Simulated Authority Portal (Exclusive to `/`)

- **One-Click Simulation:** Click the **"Simulate Authority Portal"** button in the home page header.
- **Secure Access PIN:** Prompts for a 4-digit security PIN (**`1234`**).
- **Auto-Redirect:** Upon entering the correct PIN, the user is redirected to the `/tracker` page with **Authority Dispatch Actions** unlocked.
- **Dispatch Controls:** Authorities can assign officers, set SLA targets (24h, 48h, 72h), and update status (Pending, In Progress, Resolved) which updates live.

### 4. 🏆 Gamification & Leaderboard (`/leaderboard`)

- **Civic XP Points:** Earning XP by submitting valid issues and verifying others.
- **Verification Tasks:** Citizen task board containing recently resolved issues that need community verification (uploading a photo of the completed fix to earn bonus XP).
- **Leaderboard Ranks:** Dynamic rank list placing active citizens in tiers (_Community Hero_, _Gold Citizen_, _Silver Citizen_).

---

## 🛠️ Technology Stack

- **Core Framework:** Next.js 15 (App Router) & React 19
- **Styling:** Tailwind CSS v4 (Vanilla-based custom layout tokens) & Shadcn/UI
- **Authentication:** Clerk (with restored Google OAuth to bypass development CAPTCHA walls)
- **Maps:** Leaflet & React-Leaflet
- **Icons & Animation:** Lucide React & Framer Motion
- **Analytics:** Recharts

---

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 20.9.0)
- npm, yarn, or pnpm

### Environment Variables config

Create a `.env.local` file in the root of the `frontend` folder:

```ini
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Routing Redirection (Clerk default URLs)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend API Endpoint
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Installation & Run

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📂 Project Structure

```bash
frontend/
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── page.tsx        # Landing Page (includes Authority Portal trigger & PIN Modal)
│   │   ├── report/         # Citizen reporting page
│   │   ├── tracker/        # Issue tracking timeline & Authority Dispatch panel
│   │   ├── map/            # Interactive Live Issue Map
│   │   ├── leaderboard/    # Gamified verified tasks & leaderboard rankings
│   │   ├── sign-in/        # Custom Clerk Auth Sign In
│   │   └── sign-up/        # Custom Clerk Auth Sign Up
│   ├── components/         # Reusable UI Components (Map, Header, UI elements)
│   └── middleware.ts       # Clerk middleware (configured to bypass auth on dev routes)
└── package.json
```
