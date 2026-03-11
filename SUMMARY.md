# Talentflow — Platform Summary

## Overview

Talentflow is an internal hiring automation platform that pairs GitHub-based technical assessments with AI-powered code review. It serves three user roles — **Admins**, **Candidates**, and **Client Companies** — on a single integrated system, producing a searchable talent pool and streamlined hiring pipeline.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 15 (App Router), Tailwind CSS, shadcn/ui |
| API | tRPC v11 with Zod validation (end-to-end type safety) |
| Auth | NextAuth.js v4, JWT strategy, 30-day sessions |
| Database | Prisma v6, PostgreSQL 15 (Supabase) |
| AI | Anthropic Claude API (Sonnet) |
| External | GitHub REST API v3, file upload endpoints |

## Implemented Features

### Authentication & Authorization

- Credential-based login with bcrypt password hashing
- Three roles: **ADMIN**, **CANDIDATE**, **CLIENT**
- Middleware-enforced route protection with status-based redirects
- JWT tokens carrying role and onboarding status claims
- Separate registration flows for candidates and clients

### Candidate Workflow

- **Multi-step onboarding** — resume upload, personal info, professional links, skills & availability
- **Verification pipeline** — ONBOARDING → PENDING_REVIEW → APPROVED / REJECTED
- **Assessment dashboard** — browse available coding challenges by difficulty
- **Submission flow** — fork GitHub repo, submit fork URL, receive AI-powered review
- **Job board** — search and filter open positions (experience level, work arrangement, employment type)
- **Application management** — Kanban-style board tracking status (APPLIED → INVITED → INTERVIEW → HIRED)
- **Profile management** — bio, skills, GitHub/LinkedIn links, availability status

### Admin Capabilities

- **Dashboard** — 8 real-time stats cards, recent submissions, pending reviews, quick actions
- **Candidate verification** — approve/reject pending candidates with optional rejection reason
- **Client verification** — approve/reject pending companies
- **Assessment management** — CRUD operations for coding challenges linked to GitHub repos
- **AI review pipeline** — trigger Claude-powered code reviews with automatic pass/fail scoring
- **Talent pool** — searchable/filterable view of approved candidates with availability filters
- **Submission pipeline** — view and manage all candidate submissions across statuses
- **Job oversight** — global view and management of all job postings
- **Client management** — CRUD operations for client companies

### Client (Company) Workflow

- **Company onboarding** — name, website, industry, size, location, description, tech stack, logo
- **Verification pipeline** — ONBOARDING → PENDING_REVIEW → APPROVED / REJECTED
- **Job management** — comprehensive job creation with status state machine (DRAFT → OPEN → PAUSED / FILLED / CLOSED)
- **Talent browsing** — search approved candidates who are actively looking or open to offers
- **Application management** — Kanban board, candidate profile drawer, invite to interview, status tracking
- **Company settings** — profile and logo management

### AI Code Review Pipeline

1. Fetch repository file tree via GitHub API (max 40 files, 10KB each)
2. Smart file filtering (excludes node_modules, dist, lock files, images)
3. Build structured prompt with assessment metadata, code, and scoring rubric
4. Call Claude Sonnet API (4000 max tokens)
5. Parse structured JSON response into 8 scoring categories (1–5 scale each):
   - Code Quality, Architecture, Type Safety, Error Handling, Testing, Git Practices, Documentation, Best Practices
6. Determine pass/fail by difficulty threshold (INTERN ≥ 3.0, JUNIOR ≥ 3.5, MID ≥ 4.0)
7. Store review with scores, summary, strengths, and improvements

### Landing & Legal Pages

- Marketing homepage with hero, social proof, feature sections, and CTAs
- Privacy policy and terms of service pages

## Data Models

| Model | Purpose |
|-------|---------|
| **User** | Accounts with role, profile, skills, availability, resume |
| **Assessment** | Reusable coding challenge templates linked to GitHub repos |
| **Submission** | Candidate progress (ASSIGNED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → PASSED/REJECTED) |
| **Review** | AI evaluation with 8-category scoring, pass determination, feedback |
| **Client** | Company profiles with industry, size, tech stack, contact info |
| **Job** | Comprehensive postings with requirements, compensation, interview stages |
| **JobApplication** | Candidate applications with status tracking |

## API Surface (9 tRPC Routers)

| Router | Key Procedures |
|--------|---------------|
| `auth` | register, getProfile, updateProfile |
| `assessment` | CRUD, apply, submitFork, listSubmissions |
| `review` | runReview, getBySubmission |
| `talentPool` | list, stats, approve/reject candidates, client talent browsing |
| `onboarding` | getStatus, submit (candidate) |
| `clientOnboarding` | getStatus, submit, updateProfile (client) |
| `client` | CRUD, approve/reject, stats |
| `job` | CRUD per role (client, admin, candidate views), status management |
| `application` | apply, withdraw, statusUpdates, clientOverview, inviteForInterview |

## Security

- bcrypt password hashing (12 rounds)
- Zod input validation on all tRPC procedures
- Role-based access: `publicProcedure`, `protectedProcedure`, `adminProcedure`, `approvedProcedure`
- Middleware route guards with status-aware redirects
- JWT tokens with 30-day expiration

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Register (candidate + client)
│   ├── (admin)/admin/       # Admin dashboard, assessments, pipeline, talent pool, verification, clients, jobs
│   ├── (candidate)/         # Onboarding, dashboard, assessments, profile, jobs, applications
│   ├── (client)/client/     # Onboarding, dashboard, jobs, applications, talent, settings
│   ├── _components/landing/ # Landing page sections
│   └── api/                 # NextAuth, tRPC, upload endpoints
├── server/
│   ├── db.ts                # Prisma client singleton
│   ├── auth.ts              # NextAuth configuration
│   └── api/routers/         # 9 tRPC routers
├── components/ui/           # shadcn/ui components
├── trpc/react.tsx           # tRPC React client
└── middleware.ts            # Route protection
prisma/
├── schema.prisma            # Database schema (source of truth)
└── seed.ts                  # Development seed data
```
