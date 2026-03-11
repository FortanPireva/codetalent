# Talentflow Platform — Frontend Pages Reference

**Styling:** Tailwind CSS + shadcn/ui (utility-first CSS with accessible component primitives)
**Framework:** React 19 + Next.js 15 (App Router), all pages are client components (`"use client"`)

---

## Target Users

| Role          | Description                       | Key Actions                                                                                |
| ------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| **Admin**     | Codeks hiring managers / founders | Create assessments, trigger AI reviews, manage talent pool, resource candidates to clients |
| **Candidate** | Intern/junior/mid engineers       | Register, complete profile, take assessments, submit GitHub forks, view review feedback    |

---

## Route Structure

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
```

---

## Route Protection

| Route Pattern         | Auth Required | Role Required |
| --------------------- | ------------- | ------------- |
| `/`                   | No            | —             |
| `/login`, `/register` | No            | —             |
| `/dashboard/*`        | Yes           | CANDIDATE     |
| `/profile/*`          | Yes           | CANDIDATE     |
| `/assessments/*`      | Yes           | CANDIDATE     |
| `/admin/*`            | Yes           | ADMIN         |

---

## Page-by-Page Specification

### Public Pages

#### `/` — Landing Page
- Public-facing page introducing the Talentflow platform
- Call-to-action buttons for Login and Register
- Overview of the assessment process for candidates

#### `/login` — Login Page
- Credentials login form: email + password
- Link to registration page
- On success: redirect to `/dashboard` (candidate) or `/admin` (admin)

#### `/register` — Registration Page
- Form fields: name, email, password, GitHub username (optional)
- Creates a candidate account (role: CANDIDATE)
- Auto sign-in on success, redirect to `/dashboard`

---

### Candidate Pages (Sidebar: Dashboard, Profile)

#### `/dashboard` — Candidate Dashboard
- Shows available assessments from the public catalog (active assessments)
- Shows the candidate's own submissions with current status
- Each assessment card displays: title, description, difficulty badge (INTERN/JUNIOR/MID), category, tags
- "Apply" button on assessments the candidate hasn't applied to yet
- For active submissions: shows status (ASSIGNED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → PASSED/REJECTED)
- For submitted/reviewed submissions: shows fork URL, submission date
- For reviewed submissions: shows overall score, pass/fail, summary, strengths, and improvements

#### `/profile` — Candidate Profile
- Edit personal information: name, GitHub username, phone, location, bio
- Manage skills (string array, used for talent pool filtering)
- External links: resume URL, LinkedIn URL, portfolio URL
- Availability status display (set by admin, read-only for candidate)

#### `/assessments/[id]` — Assessment Detail
- Full assessment information: title, description, instructions (markdown-style)
- GitHub template repository link
- Requirements list (evaluation criteria)
- Time limit (if set), difficulty level
- Category and tags
- If candidate has a submission: show current status and fork URL input
- "Submit Fork" action: input for GitHub fork URL, submits the candidate's work

---

### Admin Pages (Sidebar: Overview, Candidates, Assessments, Talent Pool)

#### `/admin` — Admin Dashboard
- Overview statistics: total candidates, total submissions, reviews completed
- Recent activity feed
- Quick links to pipeline, assessments, and talent pool

#### `/admin/candidates` — Candidate Pipeline
- Table of all submissions across all assessments
- Filterable by status: ASSIGNED, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, REVIEWED, PASSED, REJECTED
- Filterable by assessment
- Columns: candidate name, assessment title, status badge, submission date, overall score (if reviewed)
- "AI Review" action button on submissions with status SUBMITTED
- Click row to navigate to submission detail

#### `/admin/candidates/[id]` — Submission Detail
- Full candidate information: name, email, GitHub username, profile details
- Submission details: forked repo URL, status, deadline, submitted date
- AI review results (if reviewed):
  - Overall score (1.0–5.0) with pass/fail indicator
  - 8-category score breakdown: Code Quality, Architecture, Type Safety, Error Handling, Testing, Git Practices, Documentation, Best Practices (each 1–5)
  - Summary (2-3 sentence AI assessment)
  - Strengths (top 3 positive observations)
  - Improvements (top 3 areas for growth)
- Actions: trigger AI review, re-run review, manually override status

#### `/admin/assessments` — Assessment Management
- List of all assessments (active and inactive)
- Toggle active/inactive status per assessment
- Assessment details: title, slug, difficulty, category, tags, time limit
- Link to create new assessment
- Delete assessment action

#### `/admin/assessments/new` — Create Assessment
- Form fields:
  - Title, slug (URL-safe identifier)
  - Description (brief summary)
  - Instructions (full markdown-style instructions for candidates)
  - GitHub template repository (format: `org/repo-name`)
  - Requirements (array of evaluation criteria strings)
  - Time limit (hours, optional)
  - Difficulty (INTERN / JUNIOR / MID)
  - Category (e.g., Full-Stack, AI Engineering)
  - Tags (filterable tech tags array)
  - Active toggle

#### `/admin/talent-pool` — Talent Pool
- Searchable, filterable list of candidates who have passed assessments
- Filters:
  - Text search (name, email)
  - Skills filter (multi-select from candidate skill arrays)
  - Availability filter: AVAILABLE / ENGAGED / UNAVAILABLE
  - Has passed assessment toggle
- Candidate cards/rows showing: name, skills, availability status, assessment scores, GitHub link
- Action: update candidate availability (AVAILABLE / ENGAGED / UNAVAILABLE)
- Pool metrics: total candidates, availability breakdown, top skills

---

## Status Pipeline Display

Submissions progress through these statuses, displayed as colored badges:

```
ASSIGNED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → REVIEWED
                                                       │
                                                  ┌────┴────┐
                                                  ▼         ▼
                                               PASSED   REJECTED
```

| Status         | Display Context                                    |
| -------------- | -------------------------------------------------- |
| `ASSIGNED`     | Assessment assigned, timer starts if timeLimit set |
| `IN_PROGRESS`  | Candidate has forked and started working           |
| `SUBMITTED`    | Code ready for review                              |
| `UNDER_REVIEW` | GitHub fetch + AI analysis in progress             |
| `REVIEWED`     | Did not meet passing criteria                      |
| `PASSED`       | Candidate enters talent pool                       |
| `REJECTED`     | Disqualified by admin                              |

**Pass thresholds by difficulty:**

| Difficulty | Minimum Overall Score |
| ---------- | --------------------- |
| INTERN     | 3.0 / 5.0             |
| JUNIOR     | 3.5 / 5.0             |
| MID        | 4.0 / 5.0             |

---

## AI Review Display (shown in submission detail)

When a review exists, display:

- **Overall Score:** 1.0–5.0 (float)
- **Pass/Fail:** boolean, based on difficulty threshold
- **Score Breakdown (8 categories, each 1–5):**
  - Code Quality — Naming, readability, DRY, clean code
  - Architecture — Project structure, separation of concerns, patterns
  - Type Safety — Proper TypeScript typing, avoiding `any`, generics
  - Error Handling — Edge cases, input validation, graceful failures
  - Testing — Coverage, test quality, strategy
  - Git Practices — Commit history, branch strategy
  - Documentation — README, comments, API docs
  - Best Practices — Security, performance, accessibility
- **Summary:** 2-3 sentence AI assessment
- **Strengths:** Top 3 positive observations (string array)
- **Improvements:** Top 3 areas for growth (string array)

---

## Data Displayed Per Entity

### User (Profile Fields)
- name, email, GitHub username, phone, location, bio
- skills (string array)
- availability (AVAILABLE / ENGAGED / UNAVAILABLE)
- resumeUrl, linkedinUrl, portfolioUrl

### Assessment (Catalog/Detail Fields)
- title, slug, description, instructions
- githubTemplateRepo (format: `org/repo-name`)
- requirements (array of evaluation criteria)
- timeLimit (hours or no limit), difficulty (INTERN/JUNIOR/MID)
- category, tags (string array)
- isActive (boolean)

### Submission (Pipeline/Detail Fields)
- candidateId, assessmentId
- forkedRepoUrl (GitHub fork URL)
- status (pipeline stage)
- deadline, submittedAt

---

## UI Component Library

shadcn/ui components used: button, card, input, label, table, badge, dialog, select, textarea, tabs, separator, avatar, dropdown-menu, sheet, toast (sonner)

---

## User Flows

### Candidate Flow
1. Visit `/register` → fill form → auto sign-in → redirect to `/dashboard`
2. Browse available assessments on dashboard
3. Click "Apply" on an assessment → submission created (status: ASSIGNED)
4. Fork the GitHub template repo externally
5. Paste fork URL on assessment detail page → status moves to SUBMITTED
6. Wait for admin review → view score, pass/fail, feedback on dashboard

### Admin Flow
1. Log in → redirect to `/admin` dashboard
2. Navigate to `/admin/candidates` → see pipeline table
3. Filter by "SUBMITTED" status
4. Click "AI Review" on a submission → AI analyzes code → results stored
5. View detailed scores, strengths, improvements on submission detail page
6. Navigate to `/admin/talent-pool` → search/filter passed candidates
7. Update candidate availability for client resourcing

### Talent Pool Resourcing Flow
1. Admin navigates to `/admin/talent-pool`
2. Filters by skills, availability (AVAILABLE), passed assessment
3. Reviews candidate profiles and scores
4. Updates selected candidates' availability to ENGAGED
5. When project ends → sets availability back to AVAILABLE
