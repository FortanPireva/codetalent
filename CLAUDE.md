# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talentflow is an internal hiring automation platform that pairs GitHub-based technical assessments with AI-powered code review. Candidates complete coding challenges via forked repos, and admins trigger Claude AI reviews to generate structured scoring, producing a searchable talent pool.

## Tech Stack

- **Frontend:** React 19 + Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- **API:** tRPC v11 with Zod validation (end-to-end type safety)
- **Auth:** NextAuth.js v4 with credentials (JWT strategy, 30-day sessions)
- **ORM:** Prisma v6 with PostgreSQL 15 (Supabase)
- **AI:** Anthropic Claude API (Sonnet model for code review)
- **External:** GitHub REST API v3 for repository fetching

## Commands

```bash
# Development
npm run dev              # Start local dev server

# Database
npm run db:generate      # Regenerate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed admin + sample data
npm run db:studio        # Visual database browser
npm run db:reset         # Nuke and reseed (force reset + seed)

# Build
npm run build            # Production build
```

## Architecture

### Request Flow
```
Browser (tRPC React Client + React Query)
  → Next.js Server (Vercel serverless)
    → NextAuth middleware (JWT validation + role guard)
      → tRPC Router (Zod input validation)
        → Prisma ORM → Supabase PostgreSQL
        → GitHub API (repo fetching)
        → Anthropic Claude API (code review)
```

### tRPC Procedure Types
- `publicProcedure` — No auth (registration, public assessment listing)
- `protectedProcedure` — Requires valid JWT (any logged-in user)
- `adminProcedure` — Requires JWT + role === "ADMIN"

### Core Data Models
- **User** — Admin/Candidate roles, profile, skills, availability status
- **Assessment** — Reusable challenge templates linked to GitHub repos
- **Submission** — Candidate progress (ASSIGNED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → PASSED/REJECTED)
- **Review** — AI evaluation with 8-category scoring (1-5 scale), pass determined by difficulty thresholds

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login/Register
│   ├── (candidate)/        # Dashboard, Profile, Assessments
│   ├── (admin)/admin/      # Admin dashboard, Pipeline, Talent Pool
│   └── api/                # NextAuth + tRPC endpoints
├── server/
│   ├── db.ts               # Prisma client singleton
│   ├── auth.ts             # NextAuth configuration
│   └── api/routers/        # tRPC routers (auth, assessment, review, talentPool)
├── trpc/react.tsx          # tRPC React client setup
└── middleware.ts           # Route protection
prisma/
├── schema.prisma           # Database schema (source of truth)
└── seed.ts                 # Seed data
```

## AI Review Pipeline

1. Fetch repo tree via GitHub API (max 40 files, 10KB each)
2. Build prompt with assessment metadata + code + scoring rubric
3. Call Claude API (Sonnet, 4000 max tokens)
4. Parse JSON response → Create Review record → Update submission status

**Scoring categories:** codeQuality, architecture, typeSafety, errorHandling, testing, gitPractices, documentation, bestPractices

**Pass thresholds:** INTERN ≥3.0, JUNIOR ≥3.5, MID ≥4.0

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — Supabase pooled connection (port 6543)
- `DIRECT_URL` — Supabase direct connection (port 5432)
- `NEXTAUTH_SECRET` — JWT signing key
- `NEXTAUTH_URL` — Callback URL base
- `ANTHROPIC_API_KEY` — Claude API access
- `GITHUB_TOKEN` — GitHub API (5000 req/hr authenticated)

## Development Conventions

- TypeScript strict mode throughout
- Absolute imports via `@/*` alias
- tRPC procedures with Zod validation
- React Query for server state, useState for local
- Tailwind utility classes (no CSS modules)
- Colocate components with page until reused 3+ times
