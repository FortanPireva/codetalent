# Client Portal Feature Specification

## Overview

This document details the client-facing features for Talentflow, enabling companies to manage jobs, discover candidates, track applications through a Kanban pipeline, and communicate via in-app messaging.

---

## 1. Client Dashboard (`/client`)

### 1.1 Overview Stats

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Talentflow                                           [Avatar] TechCorp ▼│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Welcome back, Sarah                                                    │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │    3     │  │   12     │  │    5     │  │    2     │  │    1     │ │
│  │ Active   │  │ New      │  │ In       │  │ Offers   │  │ Hired    │ │
│  │ Jobs     │  │ Applic.  │  │ Interview│  │ Pending  │  │ This Mo. │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                                         │
│  ┌─────────────────────────────────┐  ┌────────────────────────────────┐│
│  │ Recent Applications             │  │ Upcoming Interviews            ││
│  │ ─────────────────────────────── │  │ ────────────────────────────── ││
│  │ Jane D. → Senior React Dev      │  │ Tomorrow 10:00                 ││
│  │ Applied 2 hours ago      [View] │  │ John S. - Technical Round      ││
│  │                                 │  │ [Join Meet] [Reschedule]       ││
│  │ Mark T. → Full-Stack Engineer   │  │                                ││
│  │ Applied 5 hours ago      [View] │  │ Wed 14:00                      ││
│  │                                 │  │ Lisa M. - Culture Fit          ││
│  │ [View all applications →]       │  │ [Join Meet] [Reschedule]       ││
│  └─────────────────────────────────┘  └────────────────────────────────┘│
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┤
│  │ Messages (3 unread)                                                  │
│  │ ───────────────────────────────────────────────────────────────────  │
│  │ Jane Doe: "Thanks for the update! I'm available..."  2h ago  [→]   │
│  │ System: "New application for Senior React Dev"       5h ago  [→]   │
│  │ Mark Torres: "Could we reschedule to Thursday?"      1d ago  [→]   │
│  └──────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Quick Actions

- **Post New Job** — Opens job creation form
- **Find Candidates** — Goes to candidate search
- **View Pipeline** — Goes to Kanban board
- **Messages** — Opens messaging inbox

---

## 2. Job Management (`/client/jobs`)

### 2.1 Jobs List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Jobs                                            [+ Post New Job]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [All] [Open (3)] [Draft (1)] [Paused] [Filled] [Closed]               │
│                                                                         │
│  🔍 Search jobs...                    Sort: [Newest first ▼]            │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Senior Full-Stack Engineer                              🟢 OPEN   │ │
│  │ Remote · €80-100k · Full-time                                     │ │
│  │                                                                   │ │
│  │ React, Node.js, TypeScript, PostgreSQL, AWS                       │ │
│  │                                                                   │ │
│  │ 📊 28 views · 12 applications · 3 in interview                    │ │
│  │ Posted 5 days ago · Closes in 25 days                             │ │
│  │                                                                   │ │
│  │ [View Applications]  [Edit]  [Pause]  [Share]                     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ DevOps Engineer                                         🟢 OPEN   │ │
│  │ Berlin (Hybrid) · €70-90k · Full-time                             │ │
│  │                                                                   │ │
│  │ AWS, Terraform, Kubernetes, Docker, CI/CD                         │ │
│  │                                                                   │ │
│  │ 📊 45 views · 8 applications · 1 in interview                     │ │
│  │ Posted 2 weeks ago · Closes in 18 days                            │ │
│  │                                                                   │ │
│  │ [View Applications]  [Edit]  [Pause]  [Share]                     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Job Creation Form

**Step 1: Basic Info**
```
Job Title *                    [Senior Full-Stack Engineer        ]
Role Type *                    [Full-Stack              ▼]
Experience Level *             [Senior (5-8 years)      ▼]
Employment Type *              [Full-time ▼]  [Contract ▼]  [Freelance ▼]

Summary (shown in listings) *
┌─────────────────────────────────────────────────────────────────────────┐
│ Join our team to build the next generation of fintech infrastructure.  │
│ You'll work on high-scale systems processing millions of transactions. │
└─────────────────────────────────────────────────────────────────────────┘
```

**Step 2: Requirements**
```
Required Skills * (select or type)
┌─────────────────────────────────────────────────────────────────────────┐
│ [TypeScript ×] [React ×] [Node.js ×] [PostgreSQL ×] [+ Add skill]      │
└─────────────────────────────────────────────────────────────────────────┘

Nice-to-Have Skills
┌─────────────────────────────────────────────────────────────────────────┐
│ [GraphQL ×] [Redis ×] [Kubernetes ×] [+ Add skill]                     │
└─────────────────────────────────────────────────────────────────────────┘

Frameworks & Tools
┌─────────────────────────────────────────────────────────────────────────┐
│ Frameworks: [Next.js ×] [NestJS ×]                                     │
│ Databases:  [PostgreSQL ×] [Redis ×]                                   │
│ Cloud:      [AWS ×]                                                    │
│ Tools:      [Docker ×] [GitHub Actions ×]                              │
└─────────────────────────────────────────────────────────────────────────┘

Years of Experience
  Minimum: [5  ] years    Maximum: [   ] years (leave blank for no max)

Domain Experience (optional)
  [FinTech              ▼]
```

**Step 3: Work Setup**
```
Work Arrangement *
  ○ On-site       ○ Hybrid       ● Remote (Local)       ○ Remote (Global)

Location (if not fully remote)
  [                    ]
  
Timezone Requirements
  [CET ± 3 hours       ]  ☑ Flexible on meeting times

Relocation
  ☐ Relocation assistance available
  
Visa Sponsorship  
  ☐ Can sponsor work visa
```

**Step 4: Compensation**
```
☑ Show salary on job listing (recommended - 40% more applications)

Salary Range *
  [80,000] to [100,000] [EUR ▼] per [Year ▼]

Equity
  ☐ Equity offered    Range: [          ]

Bonus
  [10-15% annual performance bonus                    ]

Benefits (select all that apply)
  ☑ Health insurance    ☑ Remote work stipend    ☑ Learning budget
  ☑ Flexible hours      ☐ Gym membership         ☑ Equipment provided
  ☐ Unlimited PTO       ☑ 25+ days PTO           ☐ Parental leave
```

**Step 5: Description**
```
Full Job Description * (Markdown supported)
┌─────────────────────────────────────────────────────────────────────────┐
│ ## About the Role                                                      │
│                                                                        │
│ We're looking for a Senior Full-Stack Engineer to join our core        │
│ platform team. You'll be responsible for...                            │
│                                                                        │
│ ## What You'll Do                                                      │
│                                                                        │
│ - Design and implement new features across the stack                   │
│ - Mentor junior engineers and lead code reviews                        │
│ - Collaborate with product and design on technical decisions           │
│                                                                        │
│ ## Requirements                                                        │
│                                                                        │
│ - 5+ years of experience with TypeScript and React                     │
│ - Strong background in Node.js and SQL databases                       │
│ - Experience with cloud infrastructure (AWS preferred)                 │
└─────────────────────────────────────────────────────────────────────────┘

Interview Process (helps candidates prepare)
┌─────────────────────────────────────────────────────────────────────────┐
│ Stage 1: [Intro Call (30 min)                    ] [+ Add stage]       │
│ Stage 2: [Technical Interview (60 min)           ]                     │
│ Stage 3: [System Design (60 min)                 ]                     │
│ Stage 4: [Culture Fit / Meet the Team (45 min)   ]                     │
└─────────────────────────────────────────────────────────────────────────┘

Typical timeline: [2-3 weeks        ]
```

**Step 6: Settings**
```
Hiring Details
  Positions to fill: [1  ]
  Urgency: [Medium - Standard timeline ▼]

Application Deadline
  ○ No deadline    ● Closes on [2026-03-15]

Start Date
  [Flexible / ASAP           ]

                              [Save as Draft]  [Preview]  [Publish Job →]
```

### 2.3 Job Detail View

Shows full job with stats, application pipeline preview, and actions.

---

## 3. Find Candidates (`/client/candidates`)

### 3.1 Candidate Search & Filters

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Find Candidates                                    [Save Search]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────┐                                  │
│  │ FILTERS                          │                                  │
│  │                                  │                                  │
│  │ Skills                           │                                  │
│  │ [React, TypeScript...      🔍]   │                                  │
│  │ ☑ React      ☑ TypeScript        │                                  │
│  │ ☑ Node.js    ☐ Python            │                                  │
│  │ ☐ AWS        ☐ Docker            │                                  │
│  │ [Show more...]                   │                                  │
│  │                                  │                                  │
│  │ Experience Level                 │                                  │
│  │ ☐ Intern     ☐ Junior            │                                  │
│  │ ☑ Mid        ☑ Senior            │                                  │
│  │ ☐ Staff      ☐ Lead              │                                  │
│  │                                  │                                  │
│  │ Availability                     │                                  │
│  │ ☑ Available now                  │                                  │
│  │ ☐ Include engaged                │                                  │
│  │                                  │                                  │
│  │ Assessment Status                │                                  │
│  │ ☑ Passed assessment              │                                  │
│  │ ☐ Any status                     │                                  │
│  │                                  │                                  │
│  │ Work Preference                  │                                  │
│  │ ☑ Remote     ☐ Hybrid            │                                  │
│  │ ☐ On-site                        │                                  │
│  │                                  │                                  │
│  │ Location / Timezone              │                                  │
│  │ [Europe                    ▼]    │                                  │
│  │                                  │                                  │
│  │ Salary Expectation               │                                  │
│  │ [    ] - [100,000] EUR/year      │                                  │
│  │                                  │                                  │
│  │ [Clear all]  [Apply Filters]     │                                  │
│  └──────────────────────────────────┘                                  │
│                                                                         │
│  Showing 24 candidates                     Sort: [Best Match ▼]        │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ┌────┐                                                            │ │
│  │ │ JD │  Jane Doe                           🟢 Available           │ │
│  │ └────┘  Senior Full-Stack Engineer · Pristina, Kosovo             │ │
│  │         5 years experience · Remote preferred                     │ │
│  │                                                                   │ │
│  │  Skills: React • TypeScript • Node.js • PostgreSQL • AWS          │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ ✅ Passed: Full-Stack Assessment (4.2/5)                     │ │ │
│  │  │    Code Quality: 4 | Architecture: 5 | Testing: 3            │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                   │ │
│  │  [View Profile]  [Request Introduction]  [💬 Message]  [Save]     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ┌────┐                                                            │ │
│  │ │ MT │  Mark Torres                        🟢 Available           │ │
│  │ └────┘  Full-Stack Developer · Berlin, Germany                    │ │
│  │         3 years experience · Hybrid or Remote                     │ │
│  │                                                                   │ │
│  │  Skills: TypeScript • React • Next.js • NestJS • PostgreSQL       │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ ✅ Passed: Full-Stack Assessment (3.8/5)                     │ │ │
│  │  │    Code Quality: 4 | Architecture: 4 | Testing: 3            │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                   │ │
│  │  [View Profile]  [Request Introduction]  [💬 Message]  [Save]     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Candidate Profile View (Pre-Introduction)

Before introduction, clients see:
- ✅ Name and photo
- ✅ Skills and experience level
- ✅ Location and work preferences
- ✅ Assessment scores and feedback summary
- ✅ Bio / summary
- ❌ Email (hidden)
- ❌ Phone (hidden)
- ❌ Full resume (hidden)
- ❌ GitHub username (hidden until intro)

### 3.3 Request Introduction Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Request Introduction                                             [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  You're requesting an introduction to:                                 │
│                                                                         │
│  ┌────┐  Jane Doe                                                      │
│  │ JD │  Senior Full-Stack Engineer                                    │
│  └────┘  Match score: 87%                                              │
│                                                                         │
│  Which job is this for? *                                              │
│  [Senior Full-Stack Engineer (Open)               ▼]                   │
│                                                                         │
│  Add a personal note (recommended)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Hi Jane! Your profile caught our attention - especially your    │   │
│  │ experience with TypeScript and React. We'd love to chat about   │   │
│  │ our Senior Full-Stack role...                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  What happens next:                                                    │
│  1. Jane will be notified of your interest                             │
│  2. If she's interested, you'll be connected via messaging             │
│  3. You'll have access to her full profile and contact details         │
│                                                                         │
│                                    [Cancel]  [Send Introduction Request]│
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 AI Match Suggestions

When viewing a job, clients see AI-suggested candidates:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎯 AI-Suggested Matches for "Senior Full-Stack Engineer"              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ 🥇 92% Match                                                      │ │
│  │                                                                   │ │
│  │ Jane Doe · Senior Full-Stack Engineer                             │ │
│  │                                                                   │ │
│  │ Why this match:                                                   │ │
│  │ • Has 5/5 required skills (React, TS, Node, PostgreSQL, AWS)      │ │
│  │ • Scored 4.2/5 on Full-Stack Assessment                          │ │
│  │ • 5 years experience matches Senior level requirement             │ │
│  │ • Available immediately, prefers remote work                      │ │
│  │ • Salary expectation (€85k) within budget                         │ │
│  │                                                                   │ │
│  │ [View Profile]  [Request Introduction]                            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Application Pipeline — Kanban Board (`/client/pipeline`)

### 4.1 Kanban View

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Application Pipeline                    Job: [All Jobs ▼]  [⚙ Customize Stages]  [📊 Analytics]       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ NEW (12)    │ │ SCREENING   │ │ SHORTLISTED │ │ INTERVIEWING│ │ OFFER (2)   │ │ HIRED (1)   │       │
│  │             │ │ (5)         │ │ (8)         │ │ (4)         │ │             │ │             │       │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤       │
│  │┌───────────┐│ │┌───────────┐│ │┌───────────┐│ │┌───────────┐│ │┌───────────┐│ │┌───────────┐│       │
│  ││ Jane D.   ││ ││ Alex K.   ││ ││ Sarah M.  ││ ││ Tom H.    ││ ││ Lisa P.   ││ ││ Mike R.   ││       │
│  ││ ──────────││ ││ ──────────││ ││ ──────────││ ││ ──────────││ ││ ──────────││ ││ ──────────││       │
│  ││ Sr React  ││ ││ Full-Stack││ ││ DevOps    ││ ││ Sr React  ││ ││ Full-Stack││ ││ DevOps    ││       │
│  ││ ⭐ 4.2    ││ ││ ⭐ 3.8    ││ ││ ⭐ 4.5    ││ ││ ⭐ 4.0    ││ ││ ⭐ 4.3    ││ ││ ⭐ 4.1    ││       │
│  ││ 2h ago    ││ ││ 1d ago    ││ ││ 3d ago    ││ ││ Interview ││ ││ Offer sent││ ││ Starts    ││       │
│  ││           ││ ││           ││ ││           ││ ││ Tomorrow  ││ ││ €95k      ││ ││ Mar 1     ││       │
│  ││ [···]     ││ ││ [···]     ││ ││ [···]     ││ ││ [···]     ││ ││ [···]     ││ ││ [···]     ││       │
│  │└───────────┘│ │└───────────┘│ │└───────────┘│ │└───────────┘│ │└───────────┘│ │└───────────┘│       │
│  │┌───────────┐│ │┌───────────┐│ │┌───────────┐│ │┌───────────┐│ │┌───────────┐│ │             │       │
│  ││ Mark T.   ││ ││ Emma L.   ││ ││ John B.   ││ ││ Amy W.    ││ ││ Chris D.  ││ │             │       │
│  ││ ──────────││ ││ ──────────││ ││ ──────────││ ││ ──────────││ ││ ──────────││ │             │       │
│  ││ Full-Stack││ ││ Sr React  ││ ││ Sr React  ││ ││ DevOps    ││ ││ Sr React  ││ │             │       │
│  ││ ⭐ 3.9    ││ ││ ⭐ 4.1    ││ ││ ⭐ 3.7    ││ ││ ⭐ 4.2    ││ ││ ⭐ 3.9    ││ │             │       │
│  ││ 5h ago    ││ ││ 2d ago    ││ ││ 5d ago    ││ ││ System    ││ ││ Awaiting  ││ │             │       │
│  ││           ││ ││           ││ ││           ││ ││ Design Wed││ ││ Response  ││ │             │       │
│  ││ [···]     ││ ││ [···]     ││ ││ [···]     ││ ││ [···]     ││ ││ [···]     ││ │             │       │
│  │└───────────┘│ │└───────────┘│ │└───────────┘│ │└───────────┘│ │└───────────┘│ │             │       │
│  │             │ │             │ │             │ │             │ │             │ │             │       │
│  │ [+ More]    │ │ [+ More]    │ │ [+ More]    │ │ [+ More]    │ │             │ │             │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                                                                         │
│  ─── REJECTED (15) ─────────────────────────────────────────────────────────── [Show/Hide]             │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Kanban Card Interactions

**Drag & Drop:** Move cards between columns to change status
**Click Card:** Opens candidate detail slideout
**Quick Actions (···):**
- View Profile
- Send Message
- Schedule Interview
- Add Note
- Reject with Reason

### 4.3 Candidate Slideout (from Kanban)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Pipeline                                               [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────┐  Jane Doe                                                  │
│  │        │  Senior Full-Stack Engineer                                │
│  │  [JD]  │  Pristina, Kosovo · Remote                                 │
│  │        │  jane.doe@email.com · +383 49 XXX XXX                       │
│  └────────┘  github.com/janedoe · linkedin.com/in/janedoe              │
│                                                                         │
│  [💬 Message]  [📅 Schedule Interview]  [Move to: Shortlisted ▼]       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┤
│  │ [Profile] [Assessment] [Application] [Activity] [Notes]             │
│  ├─────────────────────────────────────────────────────────────────────┤
│  │                                                                     │
│  │ ASSESSMENT RESULTS                                                  │
│  │ ──────────────────────────────────────────────────────────────────  │
│  │ Full-Stack Engineering Assessment                                   │
│  │ Completed: Jan 15, 2026                                             │
│  │                                                                     │
│  │ Overall Score: 4.2 / 5.0  ✅ PASSED                                 │
│  │                                                                     │
│  │ Code Quality     ████████░░ 4/5                                     │
│  │ Architecture     ██████████ 5/5                                     │
│  │ Type Safety      ████████░░ 4/5                                     │
│  │ Error Handling   ██████░░░░ 3/5                                     │
│  │ Testing          ██████░░░░ 3/5                                     │
│  │ Git Practices    ████████░░ 4/5                                     │
│  │ Documentation    ██████████ 5/5                                     │
│  │ Best Practices   ████████░░ 4/5                                     │
│  │                                                                     │
│  │ Strengths:                                                          │
│  │ • Excellent project architecture with clear separation of concerns  │
│  │ • Comprehensive documentation with detailed README                  │
│  │ • Clean, readable code with consistent naming conventions           │
│  │                                                                     │
│  │ Areas for Growth:                                                   │
│  │ • Test coverage could be improved (60% → aim for 80%)              │
│  │ • Some edge cases in error handling not covered                     │
│  │                                                                     │
│  │ [View Full Assessment →]  [View Submitted Code →]                   │
│  │                                                                     │
│  └─────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Activity Timeline

```
│ ACTIVITY                                                               │
│ ──────────────────────────────────────────────────────────────────────  │
│                                                                         │
│ ○ Today                                                                │
│ │                                                                      │
│ ├─ 10:30 AM  Technical interview completed                            │
│ │            Interviewer: John Smith                                   │
│ │            Rating: ⭐⭐⭐⭐ (4/5)                                      │
│ │            "Strong technical skills, good communication..."          │
│ │            [View full feedback]                                      │
│ │                                                                      │
│ ├─ 9:00 AM   Joined technical interview (Google Meet)                 │
│ │                                                                      │
│ ○ Yesterday                                                            │
│ │                                                                      │
│ ├─ 3:45 PM   Moved to "Interviewing"                                  │
│ │            by Sarah (TechCorp)                                       │
│ │                                                                      │
│ ├─ 2:00 PM   Interview scheduled                                      │
│ │            Technical Round - Feb 4, 10:00 AM                         │
│ │                                                                      │
│ ├─ 11:30 AM  Message sent                                             │
│ │            "Hi Jane, we'd like to schedule..."                       │
│ │                                                                      │
│ ○ Feb 1                                                                │
│ │                                                                      │
│ ├─ 4:20 PM   Moved to "Shortlisted"                                   │
│ │            by Sarah (TechCorp)                                       │
│ │            Note: "Great assessment scores, fits our stack"           │
│ │                                                                      │
│ ├─ 9:15 AM   Application received                                     │
│ │            Source: Platform                                          │
│ │            Match score: 87%                                          │
```

---

## 5. In-App Messaging (`/client/messages`)

### 5.1 Message Inbox

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Messages                                          [+ New Conversation] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🔍 Search conversations...                                            │
│                                                                         │
│  [All] [Unread (3)] [Candidates] [Support]                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │                                                                     │
│  │  ┌─────────────────────────────────────────────────────────────┐   │
│  │  │ 🔵 Jane Doe                                         2h ago   │   │
│  │  │    Re: Senior Full-Stack Engineer                            │   │
│  │  │    "Thanks for the update! I'm available for the..."         │   │
│  │  └─────────────────────────────────────────────────────────────┘   │
│  │                                                                     │
│  │  ┌─────────────────────────────────────────────────────────────┐   │
│  │  │ 🔵 Mark Torres                                      5h ago   │   │
│  │  │    Re: Full-Stack Developer                                  │   │
│  │  │    "Could we reschedule to Thursday instead?"                │   │
│  │  └─────────────────────────────────────────────────────────────┘   │
│  │                                                                     │
│  │  ┌─────────────────────────────────────────────────────────────┐   │
│  │  │    Lisa Park                                        1d ago   │   │
│  │  │    Re: Full-Stack Developer - Offer Discussion               │   │
│  │  │    "That sounds great! I'll review the offer..."             │   │
│  │  └─────────────────────────────────────────────────────────────┘   │
│  │                                                                     │
│  │  ┌─────────────────────────────────────────────────────────────┐   │
│  │  │ 🔵 System Notification                              1d ago   │   │
│  │  │    New application received                                  │   │
│  │  │    "Alex Kim applied for DevOps Engineer"                    │   │
│  │  └─────────────────────────────────────────────────────────────┘   │
│  │                                                                     │
│  └─────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Conversation View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Messages    Jane Doe · Senior Full-Stack Engineer    [View Profile] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │                                                                     │
│  │  ┌───────────────────────────────────────────┐                     │
│  │  │ 🔔 System · Feb 1, 9:15 AM               │                     │
│  │  │ ──────────────────────────────────────── │                     │
│  │  │ Jane Doe was introduced for              │                     │
│  │  │ Senior Full-Stack Engineer               │                     │
│  │  │ Match score: 87%                         │                     │
│  │  └───────────────────────────────────────────┘                     │
│  │                                                                     │
│  │                     ┌───────────────────────────────────────────┐  │
│  │                     │ You · Feb 1, 10:30 AM                    │  │
│  │                     │ ──────────────────────────────────────── │  │
│  │                     │ Hi Jane! Thanks for your interest in     │  │
│  │                     │ the Senior Full-Stack role. Your         │  │
│  │                     │ assessment results were impressive!      │  │
│  │                     │                                          │  │
│  │                     │ Would you be available for a quick       │  │
│  │                     │ intro call this week?                    │  │
│  │                     └───────────────────────────────────────────┘  │
│  │                                                                     │
│  │  ┌───────────────────────────────────────────┐                     │
│  │  │ Jane · Feb 1, 2:15 PM                    │                     │
│  │  │ ──────────────────────────────────────── │                     │
│  │  │ Hi! Thanks so much for reaching out.    │                     │
│  │  │ I'd love to learn more about the role.  │                     │
│  │  │                                          │                     │
│  │  │ I'm available Thursday or Friday        │                     │
│  │  │ afternoon (CET). Would either work?     │                     │
│  │  └───────────────────────────────────────────┘                     │
│  │                                                                     │
│  │                     ┌───────────────────────────────────────────┐  │
│  │                     │ You · Feb 1, 3:00 PM                     │  │
│  │                     │ ──────────────────────────────────────── │  │
│  │                     │ Thursday 2pm CET works perfectly!       │  │
│  │                     │ I'll send a calendar invite.            │  │
│  │                     └───────────────────────────────────────────┘  │
│  │                                                                     │
│  │  ┌───────────────────────────────────────────┐                     │
│  │  │ 🔔 System · Feb 1, 3:05 PM               │                     │
│  │  │ ──────────────────────────────────────── │                     │
│  │  │ 📅 Interview Scheduled                   │                     │
│  │  │ Intro Call · Thu Feb 4, 2:00 PM CET     │                     │
│  │  │ [Add to Calendar] [Reschedule]          │                     │
│  │  └───────────────────────────────────────────┘                     │
│  │                                                                     │
│  │  ┌───────────────────────────────────────────┐                     │
│  │  │ Jane · Today, 10:30 AM                   │                     │
│  │  │ ──────────────────────────────────────── │                     │
│  │  │ Thanks for the update! I'm available    │                     │
│  │  │ for the technical round next week.      │                     │
│  │  │ Tuesday or Wednesday work best for me.  │                     │
│  │  └───────────────────────────────────────────┘                     │
│  │                                                                     │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ Type a message...                                                   │
│  │                                                          [📎] [Send]│
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  [📅 Schedule Interview]  [📄 Send Offer]  [❌ Reject Candidate]       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Quick Actions in Chat

- **Schedule Interview** — Opens scheduler modal
- **Send Offer** — Opens offer template with salary fields
- **Reject Candidate** — Opens rejection flow with reason selection

### 5.4 Message Types

| Type            | Description      | Example                         |
| --------------- | ---------------- | ------------------------------- |
| `TEXT`          | Regular message  | "Hi, thanks for applying!"      |
| `SYSTEM`        | Auto-generated   | "Interview scheduled for Feb 4" |
| `FILE`          | Attachment       | Resume, portfolio, take-home    |
| `INTERVIEW_REQ` | Schedule request | Interactive calendar picker     |

---

## 6. Implementation Priority

### Phase 1 (Week 1-2): Foundation
1. Client + Job Prisma models
2. Job CRUD for clients
3. Basic job listing page

### Phase 2 (Week 3-4): Applications
4. Application model + Kanban columns
5. Candidate apply flow (from job board)
6. Basic Kanban board UI
7. Drag-and-drop status changes

### Phase 3 (Week 5-6): Candidate Search
8. Find Candidates page with filters
9. Candidate profile view (privacy controls)
10. Request Introduction flow
11. Match scoring algorithm

### Phase 4 (Week 7-8): Messaging
12. Conversation + Message models
13. Inbox UI
14. Real-time messaging (polling or WebSocket)
15. System messages (auto-generated)
16. File attachments

### Phase 5 (Week 9-10): Polish
17. Interview scheduling
18. Email notifications
19. Activity timeline
20. Analytics dashboard

---

## 7. Technical Considerations

### Real-time Messaging Options

| Approach                | Pros                           | Cons                         | Recommendation                  |
| ----------------------- | ------------------------------ | ---------------------------- | ------------------------------- |
| Polling (5s)            | Simple, works everywhere       | Not instant, server load     | ✅ Start here                    |
| SSE                     | Simple, one-way real-time      | No binary, connection limits | Good for notifications          |
| WebSocket (Pusher/Ably) | True real-time, bi-directional | Added complexity, cost       | Phase 2                         |
| Supabase Realtime       | Free, integrated               | Vendor lock-in               | Consider if already on Supabase |

### Notification Strategy

| Event              | In-App | Email | Frequency          |
| ------------------ | ------ | ----- | ------------------ |
| New application    | ✅      | ✅     | Immediate          |
| New message        | ✅      | ✅     | If unread after 1h |
| Interview reminder | ✅      | ✅     | 24h + 1h before    |
| Status change      | ✅      | ❌     | Immediate          |
| Offer response     | ✅      | ✅     | Immediate          |

### Privacy & Access Control

| Data              | Client Sees | Before Intro | After Intro |
| ----------------- | ----------- | ------------ | ----------- |
| Name              | ✅           | ✅            | ✅           |
| Skills            | ✅           | ✅            | ✅           |
| Assessment scores | ✅           | ✅            | ✅           |
| Email             | ❌           | ❌            | ✅           |
| Phone             | ❌           | ❌            | ✅           |
| GitHub            | ❌           | ❌            | ✅           |
| Resume            | ❌           | ❌            | ✅           |

---

This gives you a complete blueprint for building out the client portal. Want me to scaffold the tRPC routers for any of these features?