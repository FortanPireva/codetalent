# Talentflow Platform — Product Roadmap
## From Assessment Tool to Talent Marketplace

**Version:** 2.0  
**Date:** February 2026  
**Status:** Strategic Planning

---

## Executive Summary

Talentflow is evolving from an internal assessment and talent pool tool into a **two-sided talent marketplace** that connects verified engineers with client companies seeking to hire. This roadmap outlines the phased expansion from the current MVP to a full-featured matching platform.

### Current State (MVP)
- ✅ Candidate registration + onboarding profile flow
- ✅ GitHub-based technical assessments with AI code review
- ✅ Internal talent pool with search/filter for admin resourcing
- ✅ Candidate availability management

### Target State (Marketplace)
- Clients can post jobs and requirements
- AI-powered matching between verified candidates and open roles
- Candidates can browse opportunities and express interest
- Automated introductions and placement tracking
- Revenue attribution per successful placement

---

## Strategic Vision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CODEKS TALENT MARKETPLACE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SUPPLY SIDE                         DEMAND SIDE                           │
│   (Candidates)                        (Clients)                             │
│                                                                             │
│   ┌─────────────┐                     ┌─────────────┐                       │
│   │  Register   │                     │  Register   │                       │
│   │  + Profile  │                     │  Company    │                       │
│   └──────┬──────┘                     └──────┬──────┘                       │
│          ▼                                   ▼                              │
│   ┌─────────────┐                     ┌─────────────┐                       │
│   │  Complete   │                     │  Post Jobs  │                       │
│   │ Assessment  │                     │  + Require- │                       │
│   │             │                     │    ments    │                       │
│   └──────┬──────┘                     └──────┬──────┘                       │
│          ▼                                   ▼                              │
│   ┌─────────────┐                     ┌─────────────┐                       │
│   │  VERIFIED   │◄────────────────────│   MATCHING  │                       │
│   │  TALENT     │     AI-Powered      │   ENGINE    │                       │
│   │  POOL       │────────────────────►│             │                       │
│   └──────┬──────┘                     └──────┬──────┘                       │
│          ▼                                   ▼                              │
│   ┌─────────────┐                     ┌─────────────┐                       │
│   │  Browse     │                     │  Review     │                       │
│   │  Jobs +     │                     │  Matched    │                       │
│   │  Express    │                     │  Candidates │                       │
│   │  Interest   │                     │             │                       │
│   └──────┬──────┘                     └──────┬──────┘                       │
│          │                                   │                              │
│          └───────────────┬───────────────────┘                              │
│                          ▼                                                  │
│                   ┌─────────────┐                                           │
│                   │ INTRODUCTION│                                           │
│                   │ + PLACEMENT │                                           │
│                   └─────────────┘                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phased Roadmap Overview

| Phase | Name                         | Duration  | Focus                                 | Key Outcome                          |
| ----- | ---------------------------- | --------- | ------------------------------------- | ------------------------------------ |
| **1** | Client & Jobs Foundation     | 2-3 weeks | Data model + admin tooling            | Clients and jobs exist in system     |
| **2** | Basic Matching               | 2 weeks   | Skill-based matching engine           | Admin can match candidates to jobs   |
| **3** | Candidate Job Discovery      | 2 weeks   | Job board + interest expression       | Candidates engage with opportunities |
| **4** | Client Self-Service Portal   | 3-4 weeks | Client dashboard + candidate browsing | Clients can operate independently    |
| **5** | AI-Powered Matching          | 2-3 weeks | Intelligent recommendations           | Automated match suggestions          |
| **6** | Placement & Revenue Tracking | 2 weeks   | End-to-end pipeline                   | Measure business outcomes            |
| **7** | Scale & Growth               | Ongoing   | Public visibility + network effects   | Flywheel growth                      |

---

## Phase 1: Client & Jobs Foundation

**Goal:** Establish the data model and admin tooling for the demand side of the marketplace.

### 1.1 New Entities

#### Client (Company)

| Field          | Type            | Purpose                            |
| -------------- | --------------- | ---------------------------------- |
| `id`           | cuid            | Primary key                        |
| `name`         | String          | Company name                       |
| `slug`         | String (unique) | URL identifier                     |
| `logo`         | String?         | Logo URL                           |
| `website`      | String?         | Company website                    |
| `description`  | Text            | About the company                  |
| `industry`     | String          | Sector (FinTech, HealthTech, etc.) |
| `size`         | Enum            | STARTUP / SMB / ENTERPRISE         |
| `location`     | String          | HQ location                        |
| `techStack`    | String[]        | Technologies they use              |
| `contactName`  | String          | Primary contact                    |
| `contactEmail` | String          | Contact email                      |
| `status`       | Enum            | LEAD / ACTIVE / CHURNED            |
| `notes`        | Text?           | Internal admin notes               |

#### Job

| Field          | Type            | Purpose                                      |
| -------------- | --------------- | -------------------------------------------- |
| `id`           | cuid            | Primary key                                  |
| `clientId`     | FK → Client     | Parent company                               |
| `title`        | String          | Role title                                   |
| `slug`         | String (unique) | URL identifier                               |
| `description`  | Text            | Full job description                         |
| `requirements` | Text            | Must-have qualifications                     |
| `niceToHave`   | Text?           | Preferred qualifications                     |
| `skills`       | String[]        | Required skills (for matching)               |
| `experience`   | Enum            | INTERN / JUNIOR / MID / SENIOR               |
| `type`         | Enum            | FULL_TIME / PART_TIME / CONTRACT / FREELANCE |
| `remote`       | Enum            | ONSITE / HYBRID / REMOTE                     |
| `location`     | String?         | If not fully remote                          |
| `salaryMin`    | Int?            | Budget range                                 |
| `salaryMax`    | Int?            | Budget range                                 |
| `currency`     | String          | EUR / USD / etc.                             |
| `urgency`      | Enum            | LOW / MEDIUM / HIGH / CRITICAL               |
| `status`       | Enum            | DRAFT / OPEN / PAUSED / FILLED / CLOSED      |
| `startsAt`     | DateTime?       | Desired start date                           |
| `closesAt`     | DateTime?       | Application deadline                         |
| `headcount`    | Int             | Number of positions                          |
| `filledCount`  | Int             | Positions filled so far                      |

### 1.2 Admin Features

- **Client Management** (`/admin/clients`)
  - List all clients with status filters
  - Create/edit client profiles
  - View client's job history
  - Track client relationship status

- **Job Management** (`/admin/jobs`)
  - List all jobs with status/urgency filters
  - Create/edit job postings
  - Link jobs to clients
  - Toggle job status (open/paused/filled)

- **Dashboard Updates**
  - New stats: Active clients, Open jobs, Pending matches
  - Recent jobs widget
  - Client pipeline funnel

### 1.3 Deliverables

- [ ] Prisma schema: Client + Job entities with relations
- [ ] tRPC routers: `client` + `job` with full CRUD
- [ ] Admin UI: Client list, client detail, job list, job form
- [ ] Seed data: 5 sample clients + 10 sample jobs
- [ ] Dashboard widgets for new entities

---

## Phase 2: Basic Matching

**Goal:** Enable admins to manually match candidates to jobs based on skills and requirements.

### 2.1 New Entity: Match

| Field               | Type      | Purpose                                                             |
| ------------------- | --------- | ------------------------------------------------------------------- |
| `id`                | cuid      | Primary key                                                         |
| `candidateId`       | FK → User | Matched candidate                                                   |
| `jobId`             | FK → Job  | Matched job                                                         |
| `score`             | Float     | Match score (0-100)                                                 |
| `matchedBy`         | Enum      | MANUAL / AUTO / AI                                                  |
| `status`            | Enum      | SUGGESTED / REVIEWED / SHORTLISTED / INTRODUCED / PLACED / REJECTED |
| `adminNotes`        | Text?     | Internal notes                                                      |
| `candidateInterest` | Boolean?  | Candidate expressed interest                                        |
| `clientInterest`    | Boolean?  | Client wants to proceed                                             |
| `introducedAt`      | DateTime? | When intro was made                                                 |
| `placedAt`          | DateTime? | When placement confirmed                                            |
| `rejectionReason`   | String?   | If rejected, why                                                    |

### 2.2 Matching Algorithm v1 (Rule-Based)

```
Score Calculation:

1. SKILL MATCH (40 points max)
   - Each matching skill: +8 points
   - Max 5 skills counted
   
2. EXPERIENCE LEVEL (25 points max)
   - Exact match: +25 points
   - One level below: +15 points
   - One level above: +10 points (overqualified penalty)
   
3. AVAILABILITY (20 points max)
   - AVAILABLE: +20 points
   - ENGAGED: +0 points (skip)
   - UNAVAILABLE: -100 (exclude)
   
4. ASSESSMENT PERFORMANCE (15 points max)
   - Passed assessment in matching category: +15 points
   - Passed any assessment: +8 points
   - No passed assessments: +0 points
   
TOTAL: 0-100 scale
THRESHOLD: Suggest matches scoring ≥60
```

### 2.3 Admin Matching Interface

- **Job Detail View** (`/admin/jobs/[id]`)
  - "Find Matches" button triggers matching algorithm
  - Shows ranked list of candidates with scores
  - Breakdown: skill match %, experience fit, assessment results
  - Actions: Shortlist, Reject, View candidate profile

- **Match Pipeline** (`/admin/matches`)
  - Kanban or table view of all matches
  - Columns: Suggested → Reviewed → Shortlisted → Introduced → Placed
  - Filter by job, client, candidate, status
  - Bulk actions: Move to stage, reject, export

### 2.4 Deliverables

- [ ] Prisma schema: Match entity
- [ ] Matching algorithm service (rule-based scoring)
- [ ] tRPC router: `match` with find, create, update, list
- [ ] Job detail page with match suggestions
- [ ] Match pipeline UI with status management

---

## Phase 3: Candidate Job Discovery

**Goal:** Let verified candidates browse opportunities and express interest.

### 3.1 Candidate Job Board

- **Jobs Page** (`/jobs`)
  - List of open jobs (status: OPEN)
  - Filters: skills, experience level, remote/onsite, location
  - Search by title/company/description
  - Only visible to candidates who passed ≥1 assessment

- **Job Detail** (`/jobs/[slug]`)
  - Full job description
  - Company info (name, logo, industry, size)
  - Required skills (highlighted if candidate has them)
  - "I'm Interested" button

### 3.2 Interest Expression

When candidate clicks "I'm Interested":
1. Creates Match record if not exists (status: SUGGESTED, candidateInterest: true)
2. Updates existing Match to set candidateInterest: true
3. Notifies admin (in-app + optional email)
4. Shows confirmation to candidate

### 3.3 Candidate Dashboard Updates

- **New Section: "Opportunities"**
  - Jobs matched to their profile (score ≥ 60)
  - Jobs they've expressed interest in
  - Status of each (Pending, Under Review, Shortlisted, etc.)

- **Profile Visibility Controls**
  - Toggle: "Show my profile to clients" (default: true for AVAILABLE)
  - Select which skills to highlight
  - Choose preferred job types (full-time, contract, etc.)

### 3.4 Deliverables

- [ ] Jobs listing page with filters/search
- [ ] Job detail page with interest button
- [ ] Match creation on interest expression
- [ ] Candidate dashboard opportunities section
- [ ] Profile visibility settings
- [ ] Access control: only verified candidates see jobs

---

## Phase 4: Client Self-Service Portal

**Goal:** Allow clients to manage their own jobs and browse candidates without admin intervention.

### 4.1 Client Authentication

- **Client Registration** (`/clients/register`)
  - Company name, website, industry
  - Contact person details
  - Password-based auth (separate from candidate auth)
  - Admin approval required before full access

- **Client Role**
  - New role enum: `ADMIN | CANDIDATE | CLIENT`
  - Separate dashboard route group: `/(client)/`
  - Middleware protection for client routes

### 4.2 Client Dashboard

- **Overview** (`/client`)
  - Active jobs count
  - Pending matches awaiting review
  - Recent candidate submissions
  - Quick actions: Post job, View candidates

- **Jobs Management** (`/client/jobs`)
  - List their own jobs
  - Create/edit job postings
  - View applications and matches per job
  - Pause/close jobs

- **Candidate Browser** (`/client/candidates`)
  - Filtered view of verified, available candidates
  - Candidates who opted into visibility
  - Skills filter, experience filter
  - View anonymized profiles (name visible after intro)
  - "Request Introduction" button

- **Matches & Pipeline** (`/client/matches`)
  - View all matches for their jobs
  - See candidate interest signals
  - Accept/reject shortlisted candidates
  - Track introduced candidates

### 4.3 Introduction Flow

```
1. Client requests introduction (or admin triggers it)
2. Match status → INTRODUCED
3. Candidate receives notification
4. Candidate profile becomes fully visible to client
5. Direct communication enabled (email exchange or in-app messaging)
6. After interview/discussion:
   - Client marks as PLACED or REJECTED
   - Candidate confirms placement
```

### 4.4 Deliverables

- [ ] Client registration + approval workflow
- [ ] Client role + auth separation
- [ ] Client dashboard layout
- [ ] Client job management pages
- [ ] Candidate browser with privacy controls
- [ ] Introduction request flow
- [ ] Placement confirmation flow

---

## Phase 5: AI-Powered Matching

**Goal:** Use AI to provide intelligent match recommendations beyond skill keywords.

### 5.1 Enhanced Matching Signals

| Signal                 | Source                                  | Weight                |
| ---------------------- | --------------------------------------- | --------------------- |
| Skill overlap          | Profile skills vs job skills            | High                  |
| Assessment category    | Assessment type vs job domain           | High                  |
| Code quality score     | AI review scores                        | Medium                |
| Experience level       | Profile vs job requirement              | Medium                |
| Tech stack familiarity | Profile skills vs client techStack      | Medium                |
| Location compatibility | Profile location vs job location/remote | Medium                |
| Availability timing    | Candidate availability vs job urgency   | Low                   |
| Historical success     | Past placements in similar roles        | Low (grows over time) |

### 5.2 AI Match Explanation

For each suggested match, generate a natural language explanation:

```
"Jane is a strong match for this Full-Stack Developer role because:
- She scored 4.2/5 on the Full-Stack assessment, demonstrating solid React and Node.js skills
- Her profile lists 4 of 5 required skills (TypeScript, React, PostgreSQL, AWS)
- She's currently available and based in Kosovo, compatible with the remote EU timezone requirement
- Gap: The role prefers GraphQL experience which she hasn't demonstrated yet"
```

### 5.3 Proactive Matching

- **Auto-match on job creation:** When a new job is posted, automatically find and suggest top 10 candidates
- **Auto-match on assessment pass:** When a candidate passes an assessment, check for matching open jobs
- **Weekly digest:** Email admins with new high-quality matches from the week

### 5.4 Deliverables

- [ ] Enhanced scoring algorithm with weighted signals
- [ ] Claude AI integration for match explanations
- [ ] Auto-matching triggers (job create, assessment pass)
- [ ] Match quality feedback loop (did placement succeed?)
- [ ] Weekly match digest email

---

## Phase 6: Placement & Revenue Tracking

**Goal:** Track the full hiring funnel and attribute revenue to placements.

### 6.1 Placement Entity

| Field            | Type       | Purpose                         |
| ---------------- | ---------- | ------------------------------- |
| `id`             | cuid       | Primary key                     |
| `matchId`        | FK → Match | Source match                    |
| `startDate`      | DateTime   | Employment start                |
| `type`           | Enum       | PERMANENT / CONTRACT            |
| `duration`       | Int?       | Contract duration (months)      |
| `salary`         | Int?       | Annual salary or contract rate  |
| `currency`       | String     | EUR/USD                         |
| `feeType`        | Enum       | PERCENTAGE / FLAT               |
| `feeAmount`      | Decimal    | Fee percentage or flat amount   |
| `invoicedAmount` | Decimal?   | Actual invoiced                 |
| `invoicedAt`     | DateTime?  | When invoiced                   |
| `paidAt`         | DateTime?  | When paid                       |
| `status`         | Enum       | ACTIVE / COMPLETED / TERMINATED |
| `terminatedAt`   | DateTime?  | If ended early                  |
| `notes`          | Text?      | Admin notes                     |

### 6.2 Analytics Dashboard

- **Funnel Metrics**
  - Candidates registered → Assessed → Passed → Matched → Introduced → Placed
  - Conversion rates at each stage
  - Average time in each stage

- **Revenue Metrics**
  - Total placements (monthly/quarterly/annual)
  - Revenue per placement
  - Revenue by client
  - Revenue by job category
  - Pipeline value (potential revenue from active matches)

- **Quality Metrics**
  - Placement success rate (not terminated in first 90 days)
  - Average assessment score of placed candidates
  - Client satisfaction (future: NPS)
  - Time to fill per job

### 6.3 Reporting

- **Client Reports**
  - Placement history with each client
  - Invoice summary
  - Upcoming contract renewals

- **Candidate Reports**
  - Placement history
  - Earnings tracked (if contractor model)

### 6.4 Deliverables

- [ ] Placement entity and tRPC router
- [ ] Placement recording flow (from match → placed)
- [ ] Analytics dashboard with funnel + revenue charts
- [ ] Client-specific reports
- [ ] Export to CSV/PDF

---

## Phase 7: Scale & Growth

**Goal:** Build network effects and public visibility to accelerate marketplace growth.

### 7.1 Public Job Board

- **Public Jobs Page** (`/careers` or subdomain)
  - SEO-optimized job listings
  - No login required to browse
  - "Apply" prompts registration + assessment
  - Meta tags, structured data for Google Jobs

### 7.2 Referral System

- **Candidate Referrals**
  - Unique referral links for candidates
  - Bonus for successful placements from referrals
  - Referral dashboard tracking

- **Client Referrals**
  - Existing clients can refer new clients
  - Discount on first placement fee

### 7.3 Talent Profiles

- **Public Candidate Profiles** (opt-in)
  - Shareable profile URL
  - Skills, assessment badges, availability
  - Contact form (for leads outside platform)

### 7.4 Content & SEO

- **Blog / Resources**
  - Technical content for candidate acquisition
  - Hiring guides for client acquisition
  - SEO for "hire developers in Kosovo", etc.

### 7.5 Integrations

- **ATS Integration**
  - Push candidates to client's ATS (Greenhouse, Lever, etc.)
  - API for enterprise clients

- **Calendar Integration**
  - Schedule interviews directly (Cal.com integration)

- **Slack/Email Notifications**
  - Configurable notifications per user role
  - Digest preferences

### 7.6 Deliverables

- [ ] Public job board with SEO
- [ ] Referral system (candidate + client)
- [ ] Public profile pages (opt-in)
- [ ] Blog infrastructure
- [ ] ATS integration (1-2 popular systems)
- [ ] Calendar scheduling integration

---

## Data Model Evolution

### New Entities Summary

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE DATA MODEL                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  EXISTING (Phase 0)           NEW (Phases 1-6)                          │
│  ─────────────────            ────────────────                          │
│                                                                          │
│  ┌──────────┐                 ┌──────────┐                              │
│  │   USER   │                 │  CLIENT  │                              │
│  │ (Cand/   │                 │(Company) │                              │
│  │  Admin)  │                 └────┬─────┘                              │
│  └────┬─────┘                      │ 1:N                                │
│       │                            ▼                                    │
│       │                      ┌──────────┐                              │
│       │                      │   JOB    │                              │
│       │                      └────┬─────┘                              │
│       │                           │                                     │
│       │          ┌────────────────┼────────────────┐                   │
│       │          │                │                │                   │
│       ▼          ▼                ▼                ▼                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐           │
│  │SUBMISSION│   │  MATCH   │◄──│  MATCH   │──►│PLACEMENT │           │
│  └────┬─────┘   │(Cand-Job)│   │  SCORE   │   │          │           │
│       │         └──────────┘   └──────────┘   └──────────┘           │
│       ▼                                                               │
│  ┌──────────┐                                                         │
│  │  REVIEW  │                                                         │
│  └──────────┘                                                         │
│                                                                          │
│  ┌──────────┐                                                          │
│  │ASSESSMENT│ (unchanged)                                              │
│  └──────────┘                                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Role Expansion

```typescript
enum Role {
  ADMIN      // Codeks team - full access
  CANDIDATE  // Job seekers - assessments, jobs, profile
  CLIENT     // Companies - jobs, candidates, placements
}
```

---

## Technical Considerations

### 1. Authentication Separation

| Approach                            | Pros                | Cons                                | Recommendation  |
| ----------------------------------- | ------------------- | ----------------------------------- | --------------- |
| Single User table with role         | Simple, shared auth | Clients share table with candidates | ✅ Start here    |
| Separate Client table with own auth | Clean separation    | Duplicate auth logic                | Later if needed |
| Multi-tenant with organizations     | Enterprise-ready    | Complex for MVP                     | Phase 7+        |

### 2. Privacy & Data Access

| Data                   | Admin  | Candidate      | Client                  |
| ---------------------- | ------ | -------------- | ----------------------- |
| All candidates         | ✅ Full | Own only       | Visible + matched only  |
| Candidate contact info | ✅ Full | Own only       | After introduction only |
| All jobs               | ✅ Full | Open jobs only | Own jobs only           |
| All matches            | ✅ Full | Own matches    | Own job matches         |
| All placements         | ✅ Full | Own only       | Own only                |
| Revenue data           | ✅ Full | ❌              | ❌                       |

### 3. Matching Performance

- **v1 (Phase 2):** On-demand calculation, acceptable for <1000 candidates
- **v2 (Phase 5):** Pre-compute scores nightly, cache in Match table
- **v3 (Scale):** Background job queue (BullMQ), Redis cache, possibly vector embeddings

### 4. Notification System

| Phase     | Implementation                                   |
| --------- | ------------------------------------------------ |
| Phase 2-3 | In-app notifications (simple DB table + polling) |
| Phase 4   | Email notifications via Resend                   |
| Phase 7   | Configurable channels (email, Slack, in-app)     |

---

## Success Metrics

### Phase 1-2 (Foundation)
- [ ] 10+ clients registered
- [ ] 20+ jobs posted
- [ ] First admin-matched placement

### Phase 3-4 (Marketplace)
- [ ] 50+ candidates expressing job interest
- [ ] 5+ clients actively browsing candidates
- [ ] 10+ introductions made
- [ ] 5+ placements

### Phase 5-6 (AI + Revenue)
- [ ] 80% of matches generated by AI
- [ ] €10K+ in tracked placement revenue
- [ ] <7 day average time from match to introduction

### Phase 7 (Scale)
- [ ] 100+ public job applications
- [ ] 20% of candidates from referrals
- [ ] 3+ ATS integrations active

---

## Resource Estimation

| Phase   | Dev Effort    | Calendar Time | Dependencies |
| ------- | ------------- | ------------- | ------------ |
| Phase 1 | 2-3 weeks FTE | 3 weeks       | None         |
| Phase 2 | 2 weeks FTE   | 2 weeks       | Phase 1      |
| Phase 3 | 2 weeks FTE   | 2 weeks       | Phase 2      |
| Phase 4 | 3-4 weeks FTE | 4 weeks       | Phase 3      |
| Phase 5 | 2-3 weeks FTE | 3 weeks       | Phase 4      |
| Phase 6 | 2 weeks FTE   | 2 weeks       | Phase 5      |
| Phase 7 | Ongoing       | Ongoing       | Phase 6      |

**Total to full marketplace (Phase 1-6):** ~14-17 weeks FTE

---

## Immediate Next Steps

### This Week
1. [ ] Finalize Phase 1 scope and entity design
2. [ ] Create Prisma schema for Client + Job
3. [ ] Scaffold admin UI for client/job management

### Next 2 Weeks
4. [ ] Build client CRUD + job CRUD
5. [ ] Add dashboard widgets for new entities
6. [ ] Seed sample clients and jobs
7. [ ] Design matching algorithm v1

### Month 1
8. [ ] Complete Phase 1 + Phase 2
9. [ ] Internal testing with real client data
10. [ ] Begin Phase 3 candidate job board

---

*This roadmap transforms Talentflow from an internal tool into a competitive talent marketplace, creating a sustainable business model around verified technical talent while maintaining the quality bar established by the assessment system.*