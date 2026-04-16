markdown# WritersHub Kenya — Educational Ponzi Scheme Simulator

A full-stack web application that replicates a real-world online writing agency Ponzi scheme, built for financial fraud awareness and classroom education.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Key Features](#key-features)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Educational Overlay System](#educational-overlay-system)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

WritersHub Kenya is a full-stack simulation of a Ponzi scheme disguised as a freelance writing platform — a scam format widespread across East Africa. The app has two distinct views:

- **Public site** — what a victim sees: a polished job board full of writing assignments, with every bid attempt blocked behind a KSh 500 "activation fee"
- **Admin dashboard** — what the operator controls: a protected panel for posting fake assignments, tracking activation revenue, and managing members

The application is built to be deployed live so students can interact with it on their own devices, experiencing the scam from both sides in a controlled classroom environment.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework with file-based routing |
| Language | TypeScript 5 | Type safety across frontend and backend |
| Styling | Tailwind CSS 3 | Utility-first CSS, responsive out of the box |
| Database | PostgreSQL via Supabase | Hosted Postgres with real-time subscriptions |
| ORM | Prisma | Type-safe database queries and migrations |
| Auth | NextAuth.js + JWT | Session management, admin route protection |
| Real-time | Supabase Realtime | Live job sync from admin to public site |
| Hosting | Vercel | Zero-config Next.js deployment |
| Dev DB | SQLite (via Prisma) | Local development without a cloud database |

---

## System Architecture
┌─────────────┐         ┌─────────────┐
│   Student   │         │    Admin    │
│ (victim view)│         │ (educator)  │
└──────┬──────┘         └──────┬──────┘
│                       │
▼                       ▼
┌─────────────────────────────────────────────────────┐
│             Frontend — Next.js 14 / React            │
│  ┌───────────────────┐  ┌───────────────────────┐   │
│  │   Public site     │  │   Admin dashboard     │   │
│  │   / job board     │  │   /admin post jobs    │   │
│  │   /jobs/[id]      │  │   /admin/members      │   │
│  │   /activate       │  │   /admin/revenue      │   │
│  └───────────────────┘  └───────────────────────┘   │
└───────────────────┬─────────────────────────────────┘
│  HTTP / fetch
▼
┌─────────────────────────────────────────────────────┐
│            API layer — Next.js API routes            │
│  GET /api/jobs          POST /api/jobs               │
│  POST /api/activate     GET /api/revenue             │
│  POST /api/bids         POST /api/auth/[...nextauth] │
└───────────────────┬─────────────────────────────────┘
│  Prisma
▼
┌─────────────────────────────────────────────────────┐
│        Database — PostgreSQL (Supabase)              │
│          jobs │ users │ payments │ bids              │
└─────────────────────────────────────────────────────┘

### Data Flow: Admin Posts a Job

Admin fills form → `POST /api/jobs` → Prisma inserts into `jobs` table → Supabase Realtime broadcasts insert event → Public site receives event via `supabase.channel()` → Job appears on public board instantly, no page refresh

### Data Flow: Student Tries to Bid

Student clicks "Bid now" → `POST /api/bids` → API checks `users.activated` → If false: return 402, frontend shows KSh 500 modal → Student clicks "Pay" → `POST /api/activate` → `users.activated = true`, row inserted into `payments` → Frontend shows "Account activated" + educational reveal

---

## Database Schema

```sql
-- Writing assignments posted by admin
CREATE TABLE jobs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  category    TEXT,
  pay         INTEGER,
  pages       INTEGER,
  deadline    TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- All users: members (victims) and admins
CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        UNIQUE NOT NULL,
  password    TEXT        NOT NULL,
  role        TEXT        DEFAULT 'member',
  activated   BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Every simulated KSh 500 activation payment
CREATE TABLE payments (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        REFERENCES users(id) ON DELETE CASCADE,
  amount    INTEGER     DEFAULT 500,
  paid_at   TIMESTAMPTZ DEFAULT now()
);

-- Every bid attempt — activated or blocked
CREATE TABLE bids (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID        REFERENCES jobs(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT        DEFAULT 'blocked',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Job {
  id          String   @id @default(uuid())
  title       String
  category    String?
  pay         Int?
  pages       Int?
  deadline    String?
  description String?
  createdAt   DateTime @default(now())
  bids        Bid[]
}

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  role      String    @default("member")
  activated Boolean   @default(false)
  createdAt DateTime  @default(now())
  payments  Payment[]
  bids      Bid[]
}

model Payment {
  id      String   @id @default(uuid())
  user    User     @relation(fields: [userId], references: [id])
  userId  String
  amount  Int      @default(500)
  paidAt  DateTime @default(now())
}

model Bid {
  id        String   @id @default(uuid())
  job       Job      @relation(fields: [jobId], references: [id])
  jobId     String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  status    String   @default("blocked")
  createdAt DateTime @default(now())
}
```

---

## Project Structure
writershub/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── jobs/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── activate/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── jobs/
│   │   │   └── page.tsx
│   │   ├── members/
│   │   │   └── page.tsx
│   │   └── revenue/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── jobs/
│       │   └── route.ts
│       ├── jobs/[id]/
│       │   └── route.ts
│       ├── activate/
│       │   └── route.ts
│       ├── bids/
│       │   └── route.ts
│       ├── revenue/
│       │   └── route.ts
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts
│
├── components/
│   ├── JobCard.tsx
│   ├── JobGrid.tsx
│   ├── ActivationModal.tsx
│   ├── RedFlagBadge.tsx
│   ├── AdminJobForm.tsx
│   ├── StatsRow.tsx
│   └── EduBanner.tsx
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── supabase.ts
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── types/
│   └── index.ts
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md

---

## API Reference

All endpoints return JSON. Admin-only endpoints require a valid JWT session with `role: "admin"`.

### Jobs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs` | Public | List all jobs, ordered by `createdAt` desc |
| GET | `/api/jobs/:id` | Public | Get a single job by ID |
| POST | `/api/jobs` | Admin | Create a new job |
| PATCH | `/api/jobs/:id` | Admin | Update a job |
| DELETE | `/api/jobs/:id` | Admin | Delete a job |

**`POST /api/jobs` — request body**

```json
{
  "title": "Literature review on climate adaptation",
  "category": "Academic",
  "pay": 4500,
  "pages": 12,
  "deadline": "3 days",
  "description": "Optional short brief shown to bidders"
}
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register a new member account |
| POST | `/api/auth/signin` | Public | Sign in, returns JWT session |
| GET | `/api/auth/session` | Session | Get current session user |

### Payments & Bids

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/activate` | Member | Simulate KSh 500 payment, sets `activated: true` |
| POST | `/api/bids` | Member | Attempt to bid — blocked if not activated |
| GET | `/api/revenue` | Admin | Total activation fees and payment count |

**`POST /api/bids` — response when not activated**

```json
{
  "error": "not_activated",
  "message": "Activate your account to bid",
  "activationFee": 500
}
```

---

## Key Features

### Real-Time Job Sync

When the admin posts a job, it appears on the public board immediately without a page reload, powered by Supabase Realtime channels.

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// In JobGrid.tsx
useEffect(() => {
  const channel = supabase
    .channel('jobs')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'jobs'
    }, (payload) => setJobs(prev => [payload.new as Job, ...prev]))
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

### Admin Route Protection

```ts
// app/admin/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
  return <>{children}</>
}
```

### Bid Wall — Server-Side Enforcement

```ts
// app/api/bids/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.activated) {
    return Response.json({ error: 'not_activated', activationFee: 500 }, { status: 402 })
  }

  const { jobId } = await req.json()
  const bid = await prisma.bid.create({
    data: { jobId, userId: session.user.id, status: 'submitted' }
  })
  return Response.json(bid, { status: 201 })
}
```

### Simulated Payment

```ts
// app/api/activate/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activated: true }
  })
  await prisma.payment.create({
    data: { userId: session.user.id, amount: 500 }
  })
  return Response.json({ activated: true, message: 'Account activated' })
}
```

---

## Environment Variables

Create a `.env.local` file in the project root. **Never commit this file** — only commit `.env.example`.

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/writershub"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (for realtime)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# First admin account (used by seed script)
SEED_ADMIN_EMAIL="admin@writershub.co.ke"
SEED_ADMIN_PASSWORD="change-this-before-deploying"
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- A free [Supabase](https://supabase.com) project — or skip and use SQLite for local-only dev

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/writershub-simulator.git
cd writershub-simulator

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Push the database schema
npx prisma db push

# 5. Seed fake jobs and create the admin account
npx prisma db seed

# 6. Start the dev server
npm run dev
```

The public site is at `http://localhost:3000`. The admin panel is at `http://localhost:3000/admin`.

### Local Dev with SQLite (No Supabase Needed)

Change the datasource provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Set `DATABASE_URL="file:./dev.db"` in `.env.local`.

> **Note:** Real-time sync will not work in this mode — the public board requires a manual refresh to pick up new jobs.

---

## Deployment

### Vercel + Supabase (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

After deploying, run the schema push and seed against your production database:

```bash
DATABASE_URL="your-production-url" npx prisma db push
DATABASE_URL="your-production-url" npx prisma db seed
```

### Classroom Setup Checklist

1. Deploy to Vercel and confirm the public URL loads
2. Log into the admin panel and verify job creation works
3. Share the public URL with students — **do not share admin credentials yet**
4. Let students browse and attempt to bid independently
5. Reveal the admin panel on the projector: post a job live and watch it appear on their screens
6. Append `?edu=true` to the URL to activate educational red flag overlays
7. Use the revenue counter to show fees accumulating in real time as students click "Pay"

---

## Educational Overlay System

Appending `?edu=true` to any public URL activates the `RedFlagBadge` component on every deceptive element, rendering annotated tooltips that explain why each design choice is manipulative.

```ts
// components/RedFlagBadge.tsx
'use client'
import { useSearchParams } from 'next/navigation'

export default function RedFlagBadge({ label }: { label: string }) {
  const params = useSearchParams()
  if (!params.get('edu')) return null
  return (
    <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">
      ⚠ {label}
    </span>
  )
}
```

Usage on the activation modal:

```tsx
<RedFlagBadge label="Legitimate platforms never charge to bid" />
```

Share `https://your-app.vercel.app` first (plain view), then switch to `https://your-app.vercel.app?edu=true` (annotated view) to show students exactly what was deceptive and why.

---

## Contributing

```bash
git checkout -b feature/your-improvement
git commit -m "feat: description of change"
git push origin feature/your-improvement
# Open a pull request against main
```

Suggested contributions: Swahili language toggle, mobile layout improvements, additional scam variant modes (crypto, forex signals, data entry schemes), post-session quiz component, PDF export of session activity for educators.

**Please do not submit:**
- Real payment gateway integrations
- Changes that increase realism without adding educational annotations
- Anything that removes the `EduBanner` disclaimer component

---

## License

See `LICENSE` for details.
