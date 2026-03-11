# Talentflow Platform — Technical Architecture Document

**Version:** 1.0  
**Date:** February 2026  
**Author:** Codeks Agency  
**Status:** Implementation Ready

---

## 1. Executive Overview

Talentflow is an internal web platform that automates the technical hiring pipeline for Codeks Agency. It replaces manual screening with a structured, GitHub-based assessment workflow paired with AI-powered code review, producing a searchable talent pool of verified engineers ready for client resourcing.

### 1.1 Business Objectives

- **Automate screening** — Eliminate manual code review for initial candidate evaluation, reducing time-to-review from days to minutes.
- **Build talent supply** — Create a continuously growing pool of pre-verified engineers (intern/junior/mid) deployable to client projects on demand.
- **Standardize quality** — Enforce consistent evaluation criteria through structured rubrics and AI scoring across all candidates.
- **Reduce cost-per-hire** — Minimize senior engineer time on initial screening by automating the first review pass.

### 1.2 Target Users

| Role          | Description                       | Key Actions                                                                                |
| ------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| **Admin**     | Codeks hiring managers / founders | Create assessments, trigger AI reviews, manage talent pool, resource candidates to clients |
| **Candidate** | Intern/junior/mid engineers       | Register, complete profile, take assessments, submit GitHub forks, view review feedback    |

### 1.3 Scope

This document covers the full MVP architecture — infrastructure through application layer, including data models, API design, authentication, AI integration, and deployment strategy.

---

## 2. System Architecture

### 2.1 High-Level Stack

| Layer        | Technology                         | Purpose                                                  |
| ------------ | ---------------------------------- | -------------------------------------------------------- |
| Client       | React 19 + Next.js 15 (App Router) | Server-rendered UI with client-side interactivity        |
| API          | tRPC v11 (HTTP batch link)         | End-to-end type-safe RPC with auto-generated types       |
| Auth         | NextAuth.js v4 (JWT strategy)      | Session management, role-based access control            |
| ORM          | Prisma v6                          | Type-safe database access, migrations, schema management |
| Database     | PostgreSQL 15 on Supabase          | Primary data store with connection pooling (PgBouncer)   |
| AI Engine    | Anthropic Claude API (Sonnet)      | Automated code review with structured JSON output        |
| External API | GitHub REST API v3                 | Repository content fetching for code analysis            |
| Hosting      | Vercel (Edge + Serverless)         | Zero-config deployment with global CDN                   |
| Styling      | Tailwind CSS + shadcn/ui           | Utility-first CSS with accessible component primitives   |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (CLIENT)                          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  Candidate    │  │  Admin       │  │  Public                   │ │
│  │  Dashboard    │  │  Dashboard   │  │  Landing + Auth           │ │
│  │  Profile      │  │  Pipeline    │  │  Login / Register         │ │
│  │  Assessments  │  │  Talent Pool │  │  Assessment Catalog       │ │
│  │  Submissions  │  │  Assessments │  │                           │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬─────────────┘ │
│         │                 │                         │               │
│         └─────────────────┼─────────────────────────┘               │
│                           │                                         │
│                    tRPC React Client                                │
│                    (React Query + superjson)                        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS (batch requests)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER (VERCEL)                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                          │   │
│  │  NextAuth JWT Validation → Role Guard (ADMIN / CANDIDATE)   │   │
│  │  Route Protection: /admin/*, /dashboard/*, /profile/*       │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐   │
│  │                     tRPC ROUTER LAYER                       │   │
│  │                                                             │   │
│  │  ┌─────────┐  ┌────────────┐  ┌────────┐  ┌────────────┐  │   │
│  │  │  auth   │  │ assessment │  │ review │  │ talentPool │  │   │
│  │  │ Router  │  │  Router    │  │ Router │  │  Router    │  │   │
│  │  └────┬────┘  └─────┬──────┘  └───┬────┘  └─────┬──────┘  │   │
│  │       │             │             │              │          │   │
│  │  publicProc     protectedProc  adminProc     adminProc     │   │
│  │  protectedProc  adminProc                                  │   │
│  └─────────────────────┬───────────────────────────────────────┘   │
│                        │                                            │
│  ┌─────────────────────▼───────────────────────────────────────┐   │
│  │                    PRISMA ORM LAYER                          │   │
│  │         Type-safe queries · Parameterized SQL                │   │
│  └─────────────────────┬───────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│   SUPABASE   │ │  GITHUB API │ │  ANTHROPIC   │
│  PostgreSQL  │ │   (v3 REST) │ │  Claude API  │
│              │ │             │ │              │
│  Users       │ │ Fetch repo  │ │ Code review  │
│  Assessments │ │ tree + file │ │ w/ structured│
│  Submissions │ │ contents    │ │ JSON scoring │
│  Reviews     │ │             │ │              │
│  (PgBouncer) │ │             │ │ (Sonnet)     │
└──────────────┘ └─────────────┘ └──────────────┘
```

### 2.3 Design Principles

- **Type safety everywhere** — TypeScript from database schema (Prisma) through API (tRPC) to UI (React). Zero type gaps across the stack.
- **Server-first rendering** — Next.js App Router with React Server Components where possible; client components only for interactivity.
- **Progressive complexity** — Start monolithic, extract services only when scale demands. No premature microservices.
- **Minimal external dependencies** — Use managed services (Supabase, Vercel) to eliminate ops overhead.
- **Security by default** — Middleware-level auth guards, role-based procedures, parameterized queries via Prisma.

---

## 3. Data Architecture

### 3.1 Database — Supabase PostgreSQL

Supabase provides managed PostgreSQL with built-in connection pooling via PgBouncer. Prisma connects through both endpoints:

| Connection                | Port | URL Env Var    | Used For                               |
| ------------------------- | ---- | -------------- | -------------------------------------- |
| Transaction mode (pooled) | 6543 | `DATABASE_URL` | Application queries at runtime         |
| Session mode (direct)     | 5432 | `DIRECT_URL`   | Migrations, schema push, Prisma Studio |

### 3.2 Entity-Relationship Model

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     USER     │       │    ASSESSMENT    │       │    REVIEW    │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (cuid)    │       │ id (cuid)        │       │ id (cuid)    │
│ email ◄──────┼─ UK   │ title            │       │ submissionId │──── 1:1
│ name         │       │ slug ◄───────────┼─ UK   │ reviewerId?  │
│ password     │       │ description      │       │ scores (JSON)│
│ role (enum)  │       │ instructions     │       │ summary      │
│ githubUser   │       │ githubTemplate   │       │ strengths[]  │
│ phone        │       │ requirements (J) │       │ improvements│
│ location     │       │ timeLimit        │       │ overallScore │
│ bio          │       │ difficulty (enum)│       │ pass (bool)  │
│ skills[]     │       │ category         │       │ rawResponse  │
│ resumeUrl    │       │ tags[]           │       │ createdAt    │
│ linkedinUrl  │       │ isActive         │       └──────┬───────┘
│ portfolioUrl │       │ createdAt        │              │
│ availability │       └────────┬─────────┘              │
│ createdAt    │                │                        │
└──────┬───────┘                │                        │
       │                        │                        │
       │    ┌───────────────────┴────────────────────┐   │
       │    │             SUBMISSION                  │   │
       │    ├────────────────────────────────────────┤   │
       └────┤ id (cuid)                              │   │
     1:N    │ candidateId (FK → User)                │   │
            │ assessmentId (FK → Assessment)         ├───┘
            │ forkedRepoUrl                    1:1   │
            │ status (enum)                          │
            │ notes                                  │
            │ submittedAt                            │
            │ deadline                               │
            │ createdAt                              │
            │                                        │
            │ ◄── UNIQUE(candidateId, assessmentId)  │
            └────────────────────────────────────────┘
```

### 3.3 Core Entities

#### User

Serves both admin and candidate roles. Single table with role-based discrimination.

| Field                                      | Type                                      | Notes                                            |
| ------------------------------------------ | ----------------------------------------- | ------------------------------------------------ |
| `id`                                       | `String (cuid)`                           | Primary key                                      |
| `email`                                    | `String`                                  | Unique, login identifier                         |
| `name`                                     | `String`                                  | Display name                                     |
| `password`                                 | `String`                                  | bcrypt-hashed (12 rounds)                        |
| `role`                                     | `Enum: ADMIN / CANDIDATE`                 | Determines access level and UI routing           |
| `githubUsername`                           | `String?`                                 | For linking to GitHub profiles and repos         |
| `skills`                                   | `String[]`                                | PostgreSQL array; used for talent pool filtering |
| `availability`                             | `Enum: AVAILABLE / ENGAGED / UNAVAILABLE` | Talent pool status for client resourcing         |
| `phone`, `location`, `bio`                 | `String?`                                 | Profile completeness                             |
| `resumeUrl`, `linkedinUrl`, `portfolioUrl` | `String?`                                 | External references                              |

**Indexes:** `role`, `availability`

#### Assessment

A reusable technical challenge template linked to a GitHub template repository.

| Field                | Type                          | Notes                                             |
| -------------------- | ----------------------------- | ------------------------------------------------- |
| `id`                 | `String (cuid)`               | Primary key                                       |
| `title`              | `String`                      | Human-readable name                               |
| `slug`               | `String`                      | Unique, URL-safe identifier for public routes     |
| `description`        | `String`                      | Brief summary shown in catalog                    |
| `instructions`       | `String`                      | Full markdown-style instructions for candidates   |
| `githubTemplateRepo` | `String`                      | Format: `org/repo-name`                           |
| `requirements`       | `Json`                        | Array of evaluation criteria strings              |
| `timeLimit`          | `Int?`                        | Hours allowed (null = no limit)                   |
| `difficulty`         | `Enum: INTERN / JUNIOR / MID` | Maps to pass thresholds                           |
| `category`           | `String`                      | Grouping label (Full-Stack, AI Engineering, etc.) |
| `tags`               | `String[]`                    | Filterable tech tags                              |
| `isActive`           | `Boolean`                     | Controls visibility in public catalog             |

#### Submission

Tracks a candidate's progress through a specific assessment. One candidate can only have one submission per assessment (enforced by unique composite key).

| Field           | Type              | Notes                                     |
| --------------- | ----------------- | ----------------------------------------- |
| `id`            | `String (cuid)`   | Primary key                               |
| `candidateId`   | `FK → User`       | Cascade delete                            |
| `assessmentId`  | `FK → Assessment` | Cascade delete                            |
| `forkedRepoUrl` | `String?`         | GitHub fork URL submitted by candidate    |
| `status`        | `Enum`            | Pipeline stage (see below)                |
| `deadline`      | `DateTime?`       | Auto-calculated from assessment timeLimit |
| `submittedAt`   | `DateTime?`       | When candidate submitted their fork       |

**Unique constraint:** `(candidateId, assessmentId)`  
**Index:** `status`

#### Review

AI-generated evaluation of a submission. One-to-one relationship with Submission.

| Field          | Type              | Notes                                      |
| -------------- | ----------------- | ------------------------------------------ |
| `id`           | `String (cuid)`   | Primary key                                |
| `submissionId` | `FK → Submission` | Unique (1:1), cascade delete               |
| `reviewerId`   | `FK → User?`      | Admin who triggered the review             |
| `scores`       | `Json`            | `{ codeQuality: 4, architecture: 3, ... }` |
| `summary`      | `String`          | 2-3 sentence AI assessment                 |
| `strengths`    | `String[]`        | Top 3 positive observations                |
| `improvements` | `String[]`        | Top 3 areas for growth                     |
| `overallScore` | `Float`           | 1.0 – 5.0 weighted average                 |
| `pass`         | `Boolean`         | Based on difficulty threshold              |
| `rawResponse`  | `Text`            | Full Claude API response for debugging     |

### 3.4 Status Pipeline (SubmissionStatus)

```
ASSIGNED ──► IN_PROGRESS ──► SUBMITTED ──► UNDER_REVIEW ──► REVIEWED
                                                              │
                                                         ┌────┴────┐
                                                         ▼         ▼
                                                      PASSED   REJECTED
```

| Status         | Trigger                                | Description                                        |
| -------------- | -------------------------------------- | -------------------------------------------------- |
| `ASSIGNED`     | Candidate applies                      | Assessment assigned, timer starts if timeLimit set |
| `IN_PROGRESS`  | Manual / future auto-detect            | Candidate has forked and started working           |
| `SUBMITTED`    | Candidate submits fork URL             | Code ready for review                              |
| `UNDER_REVIEW` | Admin triggers AI review               | GitHub fetch + Claude analysis in progress         |
| `REVIEWED`     | AI review complete (score < threshold) | Did not meet passing criteria                      |
| `PASSED`       | AI review complete (score ≥ threshold) | Candidate enters talent pool                       |
| `REJECTED`     | Admin manual action                    | Disqualified for any reason                        |

**Pass thresholds by difficulty:**

| Difficulty | Minimum Overall Score |
| ---------- | --------------------- |
| INTERN     | 3.0 / 5.0             |
| JUNIOR     | 3.5 / 5.0             |
| MID        | 4.0 / 5.0             |

---

## 4. API Architecture

### 4.1 tRPC Design

The API uses tRPC v11 with the fetch adapter, providing end-to-end type safety from Prisma schema through to React Query hooks. No REST endpoints, no OpenAPI spec maintenance, no manual type duplication.

**Transport:** HTTP batch link over `/api/trpc`  
**Serialization:** superjson (handles Date, BigInt, Map, Set natively)  
**Error format:** Zod validation errors included in structured error response

### 4.2 Procedure Security Levels

```typescript
// Three tRPC procedure types enforce access control at the API layer
publicProcedure    // No auth required — registration, public assessment listing
protectedProcedure // Requires valid JWT — any logged-in user
adminProcedure     // Requires valid JWT + role === "ADMIN"
```

Middleware chain:

```
Request → Context Creation (session from JWT) → Auth Middleware → Zod Input Validation → Handler → Response
```

### 4.3 Router Reference

#### `auth` Router

| Procedure       | Type     | Access    | Input                                                               | Description                                   |
| --------------- | -------- | --------- | ------------------------------------------------------------------- | --------------------------------------------- |
| `register`      | mutation | public    | `{ name, email, password, githubUsername? }`                        | Create candidate account with bcrypt password |
| `getProfile`    | query    | protected | —                                                                   | Return current user's full profile            |
| `updateProfile` | mutation | protected | `{ name?, githubUsername?, phone?, location?, bio?, skills?, ... }` | Update profile fields                         |
| `getSession`    | query    | protected | —                                                                   | Return current session data                   |

#### `assessment` Router

| Procedure                | Type     | Access    | Input                             | Description                                    |
| ------------------------ | -------- | --------- | --------------------------------- | ---------------------------------------------- |
| `listActive`             | query    | public    | —                                 | Active assessments for public catalog          |
| `listAll`                | query    | admin     | —                                 | All assessments including inactive             |
| `getBySlug`              | query    | protected | `{ slug }`                        | Single assessment by URL slug                  |
| `getById`                | query    | protected | `{ id }`                          | Single assessment with submissions             |
| `create`                 | mutation | admin     | Full assessment object            | Create new assessment template                 |
| `update`                 | mutation | admin     | Partial assessment + id           | Update assessment fields                       |
| `delete`                 | mutation | admin     | `{ id }`                          | Delete assessment (cascades submissions)       |
| `apply`                  | mutation | protected | `{ assessmentId }`                | Candidate applies; creates submission          |
| `mySubmissions`          | query    | protected | —                                 | Current user's submissions with reviews        |
| `submitFork`             | mutation | protected | `{ submissionId, forkedRepoUrl }` | Submit GitHub fork URL                         |
| `listSubmissions`        | query    | admin     | `{ status?, assessmentId? }`      | Filtered submission pipeline                   |
| `getSubmission`          | query    | admin     | `{ id }`                          | Full submission detail with candidate + review |
| `updateSubmissionStatus` | mutation | admin     | `{ id, status }`                  | Manual status override                         |

#### `review` Router

| Procedure         | Type     | Access    | Input              | Description                                               |
| ----------------- | -------- | --------- | ------------------ | --------------------------------------------------------- |
| `runReview`       | mutation | admin     | `{ submissionId }` | Fetch code from GitHub → Claude AI review → store results |
| `getBySubmission` | query    | protected | `{ submissionId }` | Get review (candidates can only see their own)            |

#### `talentPool` Router

| Procedure            | Type     | Access | Input                                                       | Description                                              |
| -------------------- | -------- | ------ | ----------------------------------------------------------- | -------------------------------------------------------- |
| `list`               | query    | admin  | `{ search?, skills?, availability?, hasPassedAssessment? }` | Filtered candidate list with assessment history          |
| `updateAvailability` | mutation | admin  | `{ candidateId, availability }`                             | Set candidate resourcing status                          |
| `stats`              | query    | admin  | —                                                           | Pool metrics: totals, availability breakdown, top skills |
| `getCandidate`       | query    | admin  | `{ id }`                                                    | Full candidate detail with all submissions               |

---

## 5. Authentication & Authorization

### 5.1 Auth Strategy

| Decision         | Choice                       | Rationale                                                    |
| ---------------- | ---------------------------- | ------------------------------------------------------------ |
| Provider         | NextAuth.js v4 (Credentials) | Simple email/password; no OAuth complexity for internal tool |
| Session          | JWT (not database sessions)  | Stateless, no session table, works with serverless           |
| Token lifetime   | 30 days                      | Balance between security and UX for internal users           |
| Password hashing | bcrypt (12 rounds)           | Industry standard; 12 rounds balances security and latency   |

### 5.2 Auth Flow

```
Registration:
  Client form → tRPC auth.register → bcrypt hash → Prisma create User → auto-login via signIn()

Login:
  Client form → NextAuth signIn("credentials") → Prisma findUnique → bcrypt compare
    → JWT issued (contains: id, email, name, role) → stored in httpOnly cookie

Protected Request:
  Request → NextAuth middleware checks JWT → getServerSession() in tRPC context
    → enforceAuth / enforceAdmin middleware → handler executes
```

### 5.3 Route Protection Matrix

| Route Pattern         | Auth Required | Role Required | Enforcement                                                 |
| --------------------- | ------------- | ------------- | ----------------------------------------------------------- |
| `/`                   | No            | —             | Public landing                                              |
| `/login`, `/register` | No            | —             | Public auth pages                                           |
| `/dashboard/*`        | Yes           | CANDIDATE     | NextAuth middleware + layout redirect                       |
| `/profile/*`          | Yes           | CANDIDATE     | NextAuth middleware + layout redirect                       |
| `/assessments/*`      | Yes           | CANDIDATE     | NextAuth middleware + layout redirect                       |
| `/admin/*`            | Yes           | ADMIN         | NextAuth middleware + layout redirect + tRPC adminProcedure |
| `/api/trpc/*`         | Varies        | Varies        | Per-procedure middleware (public/protected/admin)           |

### 5.4 Security Measures

- Passwords never stored in plaintext; bcrypt with 12 salt rounds
- JWT contains minimal claims (id, role) — no sensitive data
- tRPC procedures validate input with Zod before any database access
- Prisma parameterized queries prevent SQL injection
- CORS handled by Next.js/Vercel defaults
- Candidate users cannot access admin routes even with direct URL manipulation (both middleware and tRPC guard)

---

## 6. AI Review Engine

### 6.1 Review Pipeline

```
Admin triggers review
        │
        ▼
┌───────────────────────┐
│  1. FETCH REPOSITORY  │
│                       │
│  Parse GitHub URL     │
│  → GET /repos/:owner/ │
│    :repo/git/trees/   │
│    main?recursive=1   │
│                       │
│  Filter code files    │
│  (skip node_modules,  │
│   binaries, lockfiles)│
│                       │
│  Fetch up to 40 files │
│  via Contents API     │
│  Base64 decode each   │
│                       │
│  Truncate files       │
│  > 10,000 chars       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  2. BUILD PROMPT      │
│                       │
│  System context:      │
│  - Senior interviewer │
│    persona at Codeks  │
│  - Assessment metadata│
│    (title, difficulty,│
│    requirements)      │
│                       │
│  Rubric (8 categories │
│  scored 1-5):         │
│  - Code Quality       │
│  - Architecture       │
│  - Type Safety        │
│  - Error Handling     │
│  - Testing            │
│  - Git Practices      │
│  - Documentation      │
│  - Best Practices     │
│                       │
│  Output format:       │
│  Structured JSON      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  3. CLAUDE API CALL   │
│                       │
│  Model: claude-sonnet │
│  Max tokens: 4000     │
│  Temperature: default │
│                       │
│  Response parsed as   │
│  JSON with regex      │
│  fallback extraction  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  4. STORE RESULTS     │
│                       │
│  Create/replace Review│
│  Update Submission    │
│  status to PASSED or  │
│  REVIEWED based on    │
│  difficulty threshold │
└───────────────────────┘
```

### 6.2 AI Review Scoring Rubric

| Category       | What it Evaluates                                   | Weight |
| -------------- | --------------------------------------------------- | ------ |
| Code Quality   | Naming, readability, DRY, clean code                | Equal  |
| Architecture   | Project structure, separation of concerns, patterns | Equal  |
| Type Safety    | Proper TypeScript typing, avoiding `any`, generics  | Equal  |
| Error Handling | Edge cases, input validation, graceful failures     | Equal  |
| Testing        | Coverage, test quality, strategy                    | Equal  |
| Git Practices  | Commit history, branch strategy                     | Equal  |
| Documentation  | README, comments, API docs                          | Equal  |
| Best Practices | Security, performance, accessibility                | Equal  |

Each scored 1–5. Overall score is the average. Pass/fail is determined by difficulty-specific thresholds (3.0 / 3.5 / 4.0).

### 6.3 AI Response Format

```json
{
  "scores": {
    "codeQuality": 4,
    "architecture": 3,
    "typeSafety": 4,
    "errorHandling": 3,
    "testing": 2,
    "gitPractices": 3,
    "documentation": 4,
    "bestPractices": 3
  },
  "overallScore": 3.3,
  "pass": false,
  "summary": "Solid fundamentals with clean TypeScript usage, but testing coverage is notably weak...",
  "strengths": [
    "Clean component architecture with proper separation of concerns",
    "Consistent TypeScript usage with minimal type assertions",
    "Well-structured README with clear setup instructions"
  ],
  "improvements": [
    "Add unit tests — only 1 test file found",
    "Error handling missing in API routes",
    "No input validation on form submissions"
  ],
  "detailedFeedback": "The candidate demonstrates strong fundamentals in..."
}
```

### 6.4 GitHub API Integration

| Operation          | Endpoint                                                | Rate Limit              | Notes                               |
| ------------------ | ------------------------------------------------------- | ----------------------- | ----------------------------------- |
| Fetch repo tree    | `GET /repos/:owner/:repo/git/trees/:branch?recursive=1` | 5000/hr (authenticated) | Tries `main` then `master` branch   |
| Fetch file content | `GET /repos/:owner/:repo/contents/:path`                | 5000/hr (authenticated) | Base64 encoded; decoded server-side |

**File filtering rules:**

- **Include:** `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.json`, `.md`, `.yaml`, `.yml`, `.css`, `.html`, `.prisma`, `.sql`, `.env.example`, `.gitignore`
- **Exclude:** `node_modules`, `.next`, `dist`, `build`, `.git`, `package-lock`, `yarn.lock`, `pnpm-lock`, images, fonts
- **Limits:** Max 40 files, max 10,000 chars per file (truncated beyond)

---

## 7. Frontend Architecture

### 7.1 Routing Structure (Next.js App Router)

```
src/app/
├── layout.tsx                     # Root layout (fonts, providers)
├── page.tsx                       # Public landing page
├── globals.css                    # Tailwind base + CSS variables
│
├── (auth)/                        # Auth route group (no layout wrapper)
│   ├── login/page.tsx             # Credentials login form
│   └── register/page.tsx          # Candidate registration form
│
├── (candidate)/                   # Candidate route group
│   ├── layout.tsx                 # Sidebar: Dashboard, Profile
│   ├── dashboard/page.tsx         # Assessment catalog + submissions
│   ├── profile/page.tsx           # Edit personal info + skills
│   └── assessments/[id]/page.tsx  # Assessment detail + instructions
│
├── (admin)/                       # Admin route group
│   └── admin/
│       ├── layout.tsx             # Sidebar: Overview, Candidates, Assessments, Talent Pool
│       ├── page.tsx               # Dashboard stats + recent activity
│       ├── candidates/
│       │   ├── page.tsx           # Pipeline table with status filters
│       │   └── [id]/page.tsx      # Submission detail + AI review results
│       ├── assessments/
│       │   ├── page.tsx           # Assessment list + activate/deactivate
│       │   └── new/page.tsx       # Create assessment form
│       └── talent-pool/page.tsx   # Searchable candidate pool
│
└── api/
    ├── auth/[...nextauth]/route.ts  # NextAuth handler
    └── trpc/[trpc]/route.ts         # tRPC fetch handler
```

### 7.2 Client-Server Boundary

| Component Type                    | Used For              | Data Fetching                       |
| --------------------------------- | --------------------- | ----------------------------------- |
| Server Component                  | Root layout, metadata | Direct Prisma (future optimization) |
| Client Component (`"use client"`) | All interactive pages | tRPC React Query hooks              |

All current pages are client components because they require interactivity (forms, mutations, session state). Server components can be introduced later for static content sections.

### 7.3 State Management

| State Type             | Managed By                       | Scope                              |
| ---------------------- | -------------------------------- | ---------------------------------- |
| Server state (DB data) | React Query (via tRPC)           | Per-query cache with 5s stale time |
| Auth state             | NextAuth `useSession()`          | Global via SessionProvider         |
| Form state             | React `useState`                 | Component-local                    |
| URL state              | Next.js `useParams`, `useRouter` | Route-level                        |

No global state library needed. React Query's cache serves as the de facto global store for server data. Mutations automatically invalidate relevant queries via `utils.*.invalidate()`.

### 7.4 Component Architecture

```
Providers (SessionProvider + TRPCProvider + Toaster)
└── Route Group Layout (Sidebar + Navigation)
    └── Page Component
        ├── Data fetching (trpc.*.useQuery)
        ├── Mutations (trpc.*.useMutation + toast feedback)
        ├── Local form state (useState)
        └── UI (Tailwind + native HTML elements)
```

No separate component library beyond shadcn primitives. Pages are self-contained with inline markup. Extract shared components only when genuine duplication emerges.

---

## 8. Key User Flows

### 8.1 Candidate Registration & Assessment Flow

```
1. Candidate visits /register
2. Fills form: name, email, password, GitHub username (optional)
3. tRPC auth.register → bcrypt hash → create User (role: CANDIDATE)
4. Auto sign-in via NextAuth → redirect to /dashboard
5. Dashboard shows available assessments (assessment.listActive)
6. Candidate clicks "Apply" → assessment.apply mutation
   → Creates Submission (status: ASSIGNED, deadline calculated)
7. Candidate forks GitHub template repo externally
8. Pastes fork URL → assessment.submitFork mutation
   → Status moves to SUBMITTED
9. Candidate waits for review (can view status on dashboard)
10. After review: sees score, pass/fail, summary, strengths/improvements
```

### 8.2 Admin Review Flow

```
1. Admin logs in → /admin overview dashboard
2. Navigates to /admin/candidates → sees pipeline table
3. Filters by status: "SUBMITTED"
4. Clicks "AI Review" on a submission
5. review.runReview mutation executes:
   a. Status → UNDER_REVIEW
   b. GitHub API: fetch repo tree → fetch file contents
   c. Build prompt with assessment rubric + candidate code
   d. Anthropic API: Claude analyzes code
   e. Parse JSON response → create Review record
   f. Status → PASSED or REVIEWED based on score vs threshold
6. Admin views detailed results: scores, strengths, improvements
7. Can re-run review or manually override status
```

### 8.3 Talent Pool Resourcing Flow

```
1. Client requests: "I need 2 React developers for 3 months"
2. Admin navigates to /admin/talent-pool
3. Filters: skills=["React"], availability="AVAILABLE", passedAssessment=true
4. Reviews candidate profiles, assessment scores, GitHub links
5. Selects candidates → updates availability to "ENGAGED"
6. Candidates are now marked as engaged across the system
7. When project ends → admin sets availability back to "AVAILABLE"
```

---

## 9. Project Structure

```
codeks-hr/
├── prisma/
│   ├── schema.prisma              # Database schema (single source of truth)
│   └── seed.ts                    # Admin user + sample assessments
│
├── src/
│   ├── app/                       # Next.js App Router pages (see 7.1)
│   │
│   ├── components/
│   │   └── providers.tsx          # SessionProvider + TRPCProvider + Toaster
│   │
│   ├── lib/
│   │   └── utils.ts               # cn(), formatDate(), status colors, score colors
│   │
│   ├── server/
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config (credentials + JWT callbacks)
│   │   └── api/
│   │       ├── trpc.ts            # Context, middleware, procedure types
│   │       ├── root.ts            # Root router (merges all sub-routers)
│   │       └── routers/
│   │           ├── auth.ts        # Registration, profile management
│   │           ├── assessment.ts  # CRUD, applications, submissions
│   │           ├── review.ts      # GitHub fetch + Claude AI review
│   │           └── talentPool.ts  # Search, filter, availability, stats
│   │
│   ├── trpc/
│   │   └── react.tsx              # tRPC React client + QueryClient setup
│   │
│   └── middleware.ts              # NextAuth route protection
│
├── .env.example                   # Required environment variables
├── package.json                   # Dependencies + scripts
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind + shadcn theme
├── next.config.js                 # Next.js config
└── components.json                # shadcn/ui config
```

---

## 10. Environment & Configuration

### 10.1 Required Environment Variables

| Variable            | Source                                        | Purpose                                             |
| ------------------- | --------------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`      | Supabase Dashboard → Settings → Database      | Pooled PostgreSQL connection (PgBouncer, port 6543) |
| `DIRECT_URL`        | Supabase Dashboard → Settings → Database      | Direct PostgreSQL connection (port 5432)            |
| `NEXTAUTH_SECRET`   | `openssl rand -base64 32`                     | JWT signing key                                     |
| `NEXTAUTH_URL`      | Your domain                                   | Callback URL base (e.g., `http://localhost:3000`)   |
| `ANTHROPIC_API_KEY` | console.anthropic.com                         | Claude API access for code reviews                  |
| `GITHUB_TOKEN`      | GitHub → Settings → Developer settings → PATs | Authenticated GitHub API access (5000 req/hr)       |

### 10.2 NPM Scripts

| Script        | Command                                              | Purpose                         |
| ------------- | ---------------------------------------------------- | ------------------------------- |
| `dev`         | `next dev`                                           | Local development server        |
| `build`       | `next build`                                         | Production build                |
| `db:generate` | `prisma generate`                                    | Regenerate Prisma client        |
| `db:push`     | `prisma db push`                                     | Push schema to database         |
| `db:seed`     | `tsx prisma/seed.ts`                                 | Seed admin + sample data        |
| `db:studio`   | `prisma studio`                                      | Visual database browser         |
| `db:reset`    | `prisma db push --force-reset && tsx prisma/seed.ts` | Nuke and reseed                 |
| `postinstall` | `prisma generate`                                    | Auto-generate client on install |

---

## 11. Deployment Architecture

### 11.1 Vercel Deployment

```
GitHub Push → Vercel Build Pipeline
                    │
                    ├── npm install (triggers postinstall → prisma generate)
                    ├── next build (compiles pages + API routes)
                    └── Deploy to Edge Network
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              Static Assets  SSR Pages  API Routes
              (Global CDN)  (Serverless) (Serverless)
                                          │
                                          ▼
                                    Supabase PostgreSQL
                                    (eu-central-1)
```

### 11.2 Infrastructure Decisions

| Decision   | Choice                      | Alternative Considered | Rationale                                                                      |
| ---------- | --------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| Hosting    | Vercel                      | AWS/Railway            | Zero-config Next.js deployment, auto-scaling, preview deploys                  |
| Database   | Supabase                    | PlanetScale, Neon      | Free tier generous, built-in PgBouncer, dashboard, EU region                   |
| AI         | Anthropic Claude (Sonnet)   | GPT-4o, Gemini         | Strong code analysis, structured output reliability, Codeks internal expertise |
| CDN        | Vercel Edge (included)      | CloudFront             | Integrated, no extra config                                                    |
| Monitoring | Vercel Analytics (built-in) | DataDog, Sentry        | Sufficient for MVP; add Sentry for error tracking in Phase 2                   |

### 11.3 Scaling Considerations

| Bottleneck         | Current Limit                         | Mitigation                                                        |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------- |
| Supabase free tier | 500MB DB, 2GB bandwidth               | Sufficient for 1000+ candidates; upgrade to Pro ($25/mo) at scale |
| Vercel free tier   | 100GB bandwidth, 10s function timeout | AI review may need Pro for 60s timeout                            |
| Anthropic API      | Rate limited per tier                 | Queue reviews if hitting limits; batch processing in Phase 2      |
| GitHub API         | 5000 req/hr (authenticated)           | Sufficient for ~100 reviews/hour; cache repo contents if needed   |

---

## 12. Security Architecture

### 12.1 Threat Model (MVP Scope)

| Threat              | Mitigation                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| SQL injection       | Prisma parameterized queries (never raw SQL)                               |
| XSS                 | React auto-escapes output; no `dangerouslySetInnerHTML`                    |
| CSRF                | NextAuth CSRF token on all auth operations                                 |
| Brute force login   | bcrypt slow hashing (12 rounds); add rate limiting in Phase 2              |
| Unauthorized access | Three-layer guard: middleware → layout redirect → tRPC procedure           |
| Data exposure       | Candidates can only read their own submissions/reviews (enforced in query) |
| Password leaks      | bcrypt one-way hash; passwords never returned in API responses             |
| API abuse           | Zod input validation on every procedure; type-safe at compile time         |

### 12.2 Data Access Rules

| Data               | Admin         | Candidate (own) | Candidate (others) | Public        |
| ------------------ | ------------- | --------------- | ------------------ | ------------- |
| All user profiles  | ✅ Read        | ✅ Read/Write    | ❌                  | ❌             |
| All submissions    | ✅ Read/Write  | ✅ Read own      | ❌                  | ❌             |
| All reviews        | ✅ Read        | ✅ Read own      | ❌                  | ❌             |
| Assessment catalog | ✅ Full CRUD   | ✅ Read active   | ✅ Read active      | ✅ Read active |
| Talent pool        | ✅ Full access | ❌               | ❌                  | ❌             |
| Availability mgmt  | ✅ Write       | ❌               | ❌                  | ❌             |

---

## 13. Development Workflow

### 13.1 Setup Sequence

```bash
# 1. Clone and install
git clone <repo> codeks-hr && cd codeks-hr
npm install

# 2. Install UI components
npx shadcn@latest init -y
npx shadcn@latest add button card input label table badge dialog \
  select textarea tabs separator avatar dropdown-menu sheet toast sonner -y

# 3. Configure environment
cp .env.example .env
# Fill in Supabase, NextAuth, Anthropic, GitHub credentials

# 4. Initialize database
npx prisma db push
npm run db:seed

# 5. Start development
npm run dev
```

### 13.2 Development Conventions

| Convention     | Standard                                         |
| -------------- | ------------------------------------------------ |
| Language       | TypeScript strict mode throughout                |
| Formatting     | Prettier (default config)                        |
| Imports        | Absolute paths via `@/*` alias                   |
| API patterns   | tRPC procedures with Zod validation              |
| State          | React Query for server state, useState for local |
| Styling        | Tailwind utility classes, no CSS modules         |
| Components     | Colocate with page until reused 3+ times         |
| Error handling | tRPC error codes + toast notifications           |
| Git            | Conventional commits, PR-based workflow          |

---

## 14. Future Roadmap

### Phase 2: Notifications & Automation

- Email notifications via Resend (application received, review complete, status change)
- GitHub webhook integration to auto-detect fork creation and push events
- Automated status transition: detect fork → IN_PROGRESS, detect push → SUBMITTED
- Rate limiting on auth endpoints (upstash/ratelimit)
- Error monitoring with Sentry

### Phase 3: Enhanced Evaluation

- Configurable scoring rubrics per assessment (admin-defined weights and categories)
- Candidate comparison view (side-by-side score breakdown)
- Bulk review trigger (review all submitted candidates for an assessment)
- Assessment templates library (clone existing assessments)
- Multi-language support for assessments (Python, Go, Rust tracks)

### Phase 4: Advanced Platform

- Multi-stage assessment pipelines (screening → technical → system design)
- Live coding environment (embedded Monaco editor with test runner)
- Candidate portal with real-time status tracking
- Client-facing talent catalog (filtered view for client partners)
- Export talent pool to CSV/PDF for client presentations
- Interview scheduling integration (Cal.com)
- Team collaboration (multiple admin reviewers, consensus scoring)

### Phase 5: Scale & Intelligence

- Analytics dashboard (conversion rates, time-to-hire, assessment difficulty calibration)
- AI-powered candidate matching (skills + assessment results → client requirements)
- Assessment difficulty auto-calibration based on pass rates
- Candidate skill graph and growth tracking over multiple assessments
- API for external ATS integration

---

*This document serves as the definitive technical reference for building and maintaining the Talentflow platform. All architectural decisions are optimized for a small team (1-3 developers) building an MVP that can scale to thousands of candidates without re-architecture.*