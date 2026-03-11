# Codeks — Technical Implementation Plan

> **Stack**: React 19 · Next.js 15 (App Router) · tRPC v11 · Prisma v6 · PostgreSQL 15 (Supabase) · NextAuth v4 · Tailwind CSS · shadcn/ui · Anthropic Claude API · GitHub REST API v3
>
> **Scope**: Pivot from HR automation to developer freelance marketplace — web platform, mobile app, payment infrastructure, and onboarding flows.

---

## Overview

| Phase | Focus | Timeline |
|-------|-------|----------|
| **Phase 1** | Web App — Core Marketplace | Weeks 1–4 |
| **Phase 2** | Payments & Subscriptions | Weeks 3–6 |
| **Phase 3** | Developer Verified Badge | Weeks 5–7 |
| **Phase 4** | Contract Layer | Weeks 6–9 |
| **Phase 5** | Mobile App | Weeks 7–12 |
| **Phase 6** | Onboarding Overhaul | Weeks 3–5 |

---

## Phase 1 — Web App: Core Marketplace

### 1.1 Database Schema Changes

Run `prisma migrate dev` after applying the following:

**New models** (see `schema-additions.prisma`):
- `ClientSubscription` — tier, billing interval, job post limits, status
- `SubscriptionInvoice` — payment history per subscription
- `DevVerificationBadge` — assessment badge, AI score snapshot, expiry
- `Contract` — typed (CODEKS_MANAGED | INDEPENDENT), full lifecycle status machine
- `ContractMilestone` — value, due date, approval state
- `ContractFeeTransaction` — fee collection records for managed contracts

**Relation additions to existing models:**

```prisma
// User model
verificationBadge  DevVerificationBadge?
contracts          Contract[]  @relation("CandidateContracts")

// Client model
subscription       ClientSubscription?
contracts          Contract[]

// Submission model
badge              DevVerificationBadge?

// Job model
contracts          Contract[]
```

**Seed updates** — add one client per tier (Starter, Growth, Scale) and 5 verified devs to `prisma/seed.ts` for local development.

---

### 1.2 New tRPC Routers

#### `subscription` router — `src/server/api/routers/subscription.ts`

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `getStatus` | query | `approvedProcedure` (client) | Returns current subscription + limits |
| `getPlans` | query | `publicProcedure` | Returns all plan definitions with pricing |
| `createCheckout` | mutation | `approvedProcedure` (client) | Creates Stripe checkout session |
| `cancelSubscription` | mutation | `approvedProcedure` (client) | Sets cancellation at period end |
| `getInvoices` | query | `approvedProcedure` (client) | Returns invoice history |
| `adminOverride` | mutation | `adminProcedure` | Manually set tier/status (for early free trials) |

#### `badge` router — `src/server/api/routers/badge.ts`

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `getMyBadge` | query | `protectedProcedure` | Returns badge + score for current dev |
| `triggerAssessment` | mutation | `approvedProcedure` (candidate) | Starts AI review → creates badge record |
| `createCheckout` | mutation | `approvedProcedure` (candidate) | Stripe checkout for Verified Dev subscription |
| `getBadgeByUser` | query | `publicProcedure` | Public-facing badge info for talent profiles |

#### `contract` router — `src/server/api/routers/contract.ts`

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `create` | mutation | `approvedProcedure` | Client creates contract tied to job + candidate |
| `getById` | query | `protectedProcedure` | Returns contract with milestones |
| `sign` | mutation | `protectedProcedure` | Records signature timestamp for calling party |
| `listByClient` | query | `approvedProcedure` (client) | All contracts for a company |
| `listByCandidate` | query | `approvedProcedure` (candidate) | All contracts for a dev |
| `addMilestone` | mutation | `approvedProcedure` | Adds milestone to draft/active contract |
| `updateMilestone` | mutation | `protectedProcedure` | Submit / approve / dispute milestone |
| `raiseDispute` | mutation | `protectedProcedure` | Flags contract for admin review |
| `adminResolveDispute` | mutation | `adminProcedure` | Marks dispute resolved with notes |

---

### 1.3 Job Post Limit Enforcement

In the `job` router's `create` procedure, add a guard:

```typescript
// src/server/api/routers/job.ts — create procedure
const sub = await ctx.db.clientSubscription.findUnique({
  where: { clientId: ctx.session.user.clientId },
});

if (!sub || sub.status !== "ACTIVE") {
  throw new TRPCError({ code: "FORBIDDEN", message: "Active subscription required." });
}

if (sub.activeJobPostLimit !== -1) {
  const activeCount = await ctx.db.job.count({
    where: { clientId: ctx.session.user.clientId, status: "OPEN" },
  });
  if (activeCount >= sub.activeJobPostLimit) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Job post limit reached for your plan." });
  }
}
```

---

### 1.4 New Pages (Web)

| Route | File | Description |
|-------|------|-------------|
| `/pricing` | `app/(marketing)/pricing/page.tsx` | Pricing page (use `PricingPage.jsx` artifact) |
| `/client/billing` | `app/(client)/client/billing/page.tsx` | Subscription status, invoices, upgrade |
| `/client/contracts` | `app/(client)/client/contracts/page.tsx` | Contract list + create |
| `/client/contracts/[id]` | `app/(client)/client/contracts/[id]/page.tsx` | Contract detail + milestones |
| `/dashboard/badge` | `app/(candidate)/dashboard/badge/page.tsx` | Badge status, trigger assessment, upgrade |
| `/dashboard/contracts` | `app/(candidate)/dashboard/contracts/page.tsx` | Dev-side contract list |
| `/dashboard/contracts/[id]` | `app/(candidate)/dashboard/contracts/[id]/page.tsx` | Milestone tracking, sign, dispute |
| `/admin/subscriptions` | `app/(admin)/admin/subscriptions/page.tsx` | Admin subscription overview + overrides |
| `/admin/contracts` | `app/(admin)/admin/contracts/page.tsx` | Dispute queue + resolution |

---

### 1.5 Talent Pool Updates

Add badge signal to talent pool cards and search:

```typescript
// talentPool router — list procedure
// Include badge join
include: {
  verificationBadge: {
    where: { status: "ACTIVE" },
    select: { aiScore: true, assessmentPassedAt: true },
  },
}
```

In the UI (`TalentPoolCard` component), render a `⬡ Verified` badge chip when `verificationBadge` is present. Sort verified devs above unverified by default.

---

## Phase 2 — Payments & Subscriptions

### 2.1 Payment Provider: Stripe

**Why Stripe**: PCI compliance handled, webhook infrastructure, hosted billing portal, and Stripe Tax for global compliance — critical for a remote-first global platform.

#### Install

```bash
npm install stripe @stripe/stripe-js
```

#### Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CLIENT_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_CLIENT_STARTER_ANNUAL_PRICE_ID=price_...
STRIPE_CLIENT_GROWTH_MONTHLY_PRICE_ID=price_...
STRIPE_CLIENT_GROWTH_ANNUAL_PRICE_ID=price_...
STRIPE_CLIENT_SCALE_MONTHLY_PRICE_ID=price_...
STRIPE_CLIENT_SCALE_ANNUAL_PRICE_ID=price_...
STRIPE_DEV_BADGE_MONTHLY_PRICE_ID=price_...
STRIPE_DEV_BADGE_ANNUAL_PRICE_ID=price_...
```

#### Stripe Products to Create (Stripe Dashboard or CLI)

| Product | Prices |
|---------|--------|
| Codeks Starter | $79/mo · $699/yr |
| Codeks Growth | $199/mo · $1,799/yr |
| Codeks Scale | $499/mo · $4,499/yr |
| Dev Verified Badge | $19/mo · $149/yr |

---

### 2.2 Checkout Flow

**File**: `src/server/api/routers/subscription.ts` — `createCheckout` procedure

```typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create or retrieve Stripe customer
let customerId = existingSub?.externalCustomerId;
if (!customerId) {
  const customer = await stripe.customers.create({
    email: ctx.session.user.email,
    metadata: { clientId: ctx.session.user.clientId },
  });
  customerId = customer.id;
}

const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${process.env.NEXTAUTH_URL}/client/billing?success=true`,
  cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
  metadata: { clientId: ctx.session.user.clientId, tier, billingInterval },
  allow_promotion_codes: true,
  tax_id_collection: { enabled: true },
});

return { url: session.url };
```

---

### 2.3 Stripe Webhook Handler

**File**: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/server/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Webhook signature failed", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
  }

  return new Response("ok");
}
```

**`handleCheckoutCompleted`** — upsert `ClientSubscription` or `DevVerificationBadge` based on metadata, set status to `ACTIVE`, write `externalCustomerId` and `externalSubId`.

**`handleInvoicePaid`** — extend `currentPeriodEnd`, create `SubscriptionInvoice` record.

**`handleSubscriptionDeleted`** — set `status: CANCELLED`, clear badge or block job posts.

---

### 2.4 Contract Platform Fee Collection

For `CODEKS_MANAGED` contracts, collect the platform fee when a milestone is approved:

```typescript
// contract router — updateMilestone (status: APPROVED)
if (contract.type === "CODEKS_MANAGED" && input.status === "APPROVED") {
  const feePct = contract.platformFeePct ?? 0.06;
  const feeAmount = Math.round(milestone.valueCents * feePct);

  // In production: trigger Stripe Transfer or invoice here
  await ctx.db.contractFeeTransaction.create({
    data: {
      contractId: contract.id,
      amountCents: feeAmount,
      feePct,
      paidAt: new Date(),
      notes: `Milestone "${milestone.title}" approved`,
    },
  });
}
```

> **Note**: Full Stripe Connect (to pay devs through Codeks) is a Phase 2+ extension. For Phase 1, the platform fee is invoiced separately or deducted manually — keep overhead low.

---

### 2.5 Billing Portal

Allow clients to manage their subscription (cancel, upgrade, download invoices) via Stripe's hosted portal:

```typescript
// subscription router — createPortalSession procedure
const session = await stripe.billingPortal.sessions.create({
  customer: sub.externalCustomerId,
  return_url: `${process.env.NEXTAUTH_URL}/client/billing`,
});
return { url: session.url };
```

Render a "Manage Billing" button in `/client/billing` that calls this procedure and redirects.

---

## Phase 3 — Developer Verified Badge

### 3.1 Assessment → Badge Flow

The existing AI review pipeline is the core of this feature. Extend it:

```
Dev pays for badge subscription (Stripe)
  → Stripe webhook sets DevVerificationBadge.status = PENDING
  → Dev selects an assessment from the dashboard
  → Dev submits fork URL (existing submission flow)
  → Admin or auto-trigger runs AI review (existing review pipeline)
  → On review.passed === true:
      → DevVerificationBadge.status = ACTIVE
      → DevVerificationBadge.aiScore = review.overallScore
      → DevVerificationBadge.assessmentPassedAt = now()
  → On review.passed === false:
      → Badge stays PENDING, dev can retry (one free retry per billing cycle)
```

### 3.2 Badge Expiry

Badges are tied to an active subscription. On `customer.subscription.deleted` webhook:

```typescript
await db.devVerificationBadge.updateMany({
  where: { userId, status: "ACTIVE" },
  data: { status: "EXPIRED", expiresAt: new Date() },
});
```

### 3.3 Job Alert Lead Time

In the job alert notification system (or email queue), filter recipients by badge status:

```typescript
// Send job alert emails
const verifiedDevs = await db.user.findMany({
  where: {
    role: "CANDIDATE",
    verificationBadge: { status: "ACTIVE" },
    // match skills, availability, etc.
  },
});

// Send immediately to verified devs
await sendJobAlertEmails(verifiedDevs, job);

// Queue free devs for 24h later
await scheduleJobAlertEmails(freeDevs, job, { delayHours: 24 });
```

Use a simple queue (e.g., `pg-boss` on your existing Postgres, or `Upstash QStash`) for the delayed send.

---

## Phase 4 — Contract Layer

### 4.1 Contract Templates

Store Codeks contract templates as server-side Markdown/MDX strings (no external storage needed at launch). Generate a PDF for signing using `@react-pdf/renderer` or `puppeteer`.

**File**: `src/lib/contracts/templates/standard.ts`

```typescript
export function buildContractTemplate(data: {
  clientName: string;
  devName: string;
  jobTitle: string;
  totalValue: number;
  startDate: string;
  endDate?: string;
  milestones: { title: string; value: number; dueDate: string }[];
}): string {
  return `
# Codeks Independent Contractor Agreement

**Client**: ${data.clientName}
**Contractor**: ${data.devName}
**Project**: ${data.jobTitle}
**Total Value**: $${(data.totalValue / 100).toFixed(2)} USD
**Start Date**: ${data.startDate}
${data.endDate ? `**End Date**: ${data.endDate}` : ""}

## Milestones
${data.milestones.map((m, i) =>
  `${i + 1}. ${m.title} — $${(m.value / 100).toFixed(2)} due ${m.dueDate}`
).join("\n")}

## Platform Fee
This contract is managed by Codeks. A platform fee of ${/* feePct */6}% applies to
the total contract value, deducted from milestone payments upon client approval.

## Terms
[Standard NDA, IP assignment, payment terms clauses here]
  `.trim();
}
```

### 4.2 Signing Flow

Simple timestamp-based signing (no DocuSign at launch):

1. Both parties see the contract via `/contracts/[id]`
2. A "Sign Contract" button calls `contract.sign` mutation
3. Mutation records `clientSignedAt` or `candidateSignedAt` depending on caller's role
4. When both timestamps are present → `contract.status = ACTIVE`
5. Email both parties a PDF copy (generated server-side)

### 4.3 Dispute Flow

```
Dev or Client clicks "Flag Dispute" on a milestone
  → ContractMilestone.status = DISPUTED
  → Contract.disputeRaisedAt = now()
  → Admin receives notification
  → Admin reviews via /admin/contracts
  → Admin sets disputeResolvedAt + disputeNotes
  → Milestone manually set to APPROVED or back to IN_PROGRESS
```

No automated arbitration at launch — keeps ops overhead near zero.

---

## Phase 5 — Mobile App

### 5.1 Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **React Native (Expo SDK 51+)** | Shared TypeScript codebase, OTA updates, fast build pipeline |
| API | **tRPC** (same routers, shared types) | Zero duplication — mobile calls the same procedures as web |
| Auth | **Expo SecureStore** + NextAuth JWT | Store JWT from NextAuth in SecureStore, pass as Bearer token |
| Navigation | **Expo Router** (file-based) | Mirrors Next.js App Router patterns |
| UI | **NativeWind** (Tailwind for RN) | Consistent utility-first styling |
| Push Notifications | **Expo Notifications** + **Expo Push Service** | Handles APNs + FCM, no own server needed |
| State | **TanStack Query** (React Query) | Same as web — cache, refetch, optimistic updates |

---

### 5.2 Shared tRPC Client

**File**: `src/trpc/client.ts` (shared between web and mobile)

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { getToken } from "./token"; // SecureStore on mobile, cookie on web

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
      headers: async () => {
        const token = await getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

---

### 5.3 App Structure (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx          # Credential login → stores JWT in SecureStore
│   └── register.tsx       # Candidate registration
├── (tabs)/
│   ├── _layout.tsx        # Bottom tab navigator
│   ├── index.tsx          # Home: active contracts + latest matched jobs
│   ├── jobs.tsx           # Job board with filters
│   ├── contracts.tsx      # Contract list
│   └── profile.tsx        # Dev profile, badge status, settings
├── jobs/
│   └── [id].tsx           # Job detail + apply button
├── contracts/
│   └── [id].tsx           # Contract detail, milestones, sign
└── badge/
    └── index.tsx          # Badge status, trigger assessment, subscribe
```

---

### 5.4 Push Notifications

**Registration** — store push token on login:

```typescript
// app/(tabs)/index.tsx — on mount
import * as Notifications from "expo-notifications";

const token = (await Notifications.getExpoPushTokenAsync()).data;
await trpc.auth.updatePushToken.mutate({ token });
```

Add `pushToken String?` to the `User` model in Prisma.

**Sending notifications** — extend the job alert service:

```typescript
// src/server/notifications/jobAlert.ts
import { Expo } from "expo-server-sdk";
const expo = new Expo();

export async function sendPushJobAlert(pushTokens: string[], job: Job) {
  const messages = pushTokens
    .filter(Expo.isExpoPushToken)
    .map((to) => ({
      to,
      title: "New job match 🔔",
      body: `${job.title} at ${job.client.name}`,
      data: { jobId: job.id },
    }));

  await expo.sendPushNotificationsAsync(messages);
}
```

**Alert lead time** — verified devs receive push + email immediately; free devs receive push + email after 24h delay (same queue logic as Phase 3).

---

### 5.5 Mobile-Only Features

| Feature | Implementation |
|---------|---------------|
| Job bookmarks | Local AsyncStorage + `job.bookmark` mutation |
| Swipe to apply | `react-native-gesture-handler` swipe right on job card |
| Contract signing | In-app signature pad (`react-native-signature-canvas`) → base64 stored on `Contract` |
| Availability toggle | Quick toggle on home screen → calls `auth.updateProfile` |
| Offline job cache | TanStack Query `staleTime: Infinity` + `gcTime` for offline browsing |

---

### 5.6 App Store Deployment

```
Phase 5a (Week 7–9):   Internal TestFlight + Android Internal Testing
Phase 5b (Week 10–11): Beta — invite first 50 devs
Phase 5c (Week 12):    Public release — iOS App Store + Google Play
```

**Expo EAS Build config** (`eas.json`):

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "...", "appleTeamId": "..." },
      "android": { "serviceAccountKeyPath": "./google-service-account.json" }
    }
  }
}
```

---

## Phase 6 — Onboarding Overhaul

### 6.1 Candidate Onboarding (Updated)

Add a **badge upsell step** as the final onboarding screen (after profile completion):

```
Step 1: Resume + personal info         (existing)
Step 2: Professional links + skills    (existing)
Step 3: GitHub connection              (new — required for badge eligibility)
Step 4: Availability & rate            (existing, add hourly/monthly rate field)
Step 5: Badge upsell                   (new)
  → Show what Verified badge means
  → CTA: "Get verified now" (→ badge checkout) or "Skip for now"
```

**New fields on `User` model:**

```prisma
hourlyRateCents  Int?     // dev's asking rate per hour
monthlyRateCents Int?     // dev's asking rate per month
currency         String   @default("USD")
githubConnected  Boolean  @default(false)
pushToken        String?
```

---

### 6.2 Client Onboarding (Updated)

Add a **subscription gate** as the final client onboarding step:

```
Step 1: Company info + logo            (existing)
Step 2: Industry + tech stack          (existing)
Step 3: Plan selection                 (new — mandatory before PENDING_REVIEW)
  → Show pricing tiers
  → CTA: "Start with 3 months free" (admin grants trial) or "Choose a plan"
  → On plan selection → Stripe Checkout
  → On success → status advances to PENDING_REVIEW
```

**Middleware update** — clients without an active subscription redirect to `/client/onboarding/plan` even if they're `APPROVED`:

```typescript
// middleware.ts
if (
  user.role === "CLIENT" &&
  pathname.startsWith("/client") &&
  !pathname.includes("/onboarding") &&
  !pathname.includes("/billing")
) {
  const sub = await getClientSubscriptionStatus(user.clientId);
  if (!sub || sub.status === "EXPIRED" || sub.status === "CANCELLED") {
    return NextResponse.redirect(new URL("/client/billing", req.url));
  }
}
```

---

### 6.3 Email Notifications (New)

Use **Resend** (free tier: 3,000 emails/month) with React Email templates.

```bash
npm install resend @react-email/components
```

**Trigger points:**

| Event | Recipient | Template |
|-------|-----------|----------|
| Candidate approved | Candidate | "You're verified — start applying" |
| Client approved | Client | "Your account is live — post your first job" |
| Badge earned | Dev | "Your Verified Dev badge is active" |
| Badge subscription lapsed | Dev | "Your badge expired — renew to stay visible" |
| New job match | Dev | "New job: [title] at [company]" |
| Contract signed (both parties) | Client + Dev | "Contract active — [project title]" |
| Milestone approved | Dev | "Milestone approved — [title]" |
| Dispute raised | Admin | "Dispute flagged on contract [id]" |
| Subscription renewal | Client | "Payment confirmed — [plan] renewed" |

**File structure:**

```
src/
├── lib/
│   └── email/
│       ├── client.ts          # Resend instance
│       ├── send.ts            # Wrapper with error handling
│       └── templates/
│           ├── CandidateApproved.tsx
│           ├── BadgeEarned.tsx
│           ├── JobAlert.tsx
│           ├── ContractActive.tsx
│           └── MilestoneApproved.tsx
```

---

## Cross-Phase: Environment & Infrastructure

### Environment Variables (complete set)

```env
# App
NEXTAUTH_URL=https://codeks.io
NEXTAUTH_SECRET=...

# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_CLIENT_STARTER_MONTHLY=price_...
STRIPE_CLIENT_STARTER_ANNUAL=price_...
STRIPE_CLIENT_GROWTH_MONTHLY=price_...
STRIPE_CLIENT_GROWTH_ANNUAL=price_...
STRIPE_CLIENT_SCALE_MONTHLY=price_...
STRIPE_CLIENT_SCALE_ANNUAL=price_...
STRIPE_DEV_BADGE_MONTHLY=price_...
STRIPE_DEV_BADGE_ANNUAL=price_...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# GitHub
GITHUB_TOKEN=ghp_...

# Email
RESEND_API_KEY=re_...
RESEND_FROM=noreply@codeks.io

# Mobile (Expo)
EXPO_PUBLIC_API_URL=https://codeks.io
```

---

### Migration Order

```bash
# 1. Apply schema additions
npx prisma migrate dev --name add_monetization_models

# 2. Update seed data
npx prisma db seed

# 3. Create Stripe products + price IDs, paste into .env

# 4. Register Stripe webhook endpoint
#    URL: https://codeks.io/api/webhooks/stripe
#    Events: checkout.session.completed, invoice.payment_succeeded,
#            customer.subscription.updated, customer.subscription.deleted

# 5. Deploy web
vercel deploy --prod

# 6. Mobile — run local first
npx expo start

# 7. EAS build for TestFlight
eas build --platform ios --profile preview
```

---

## Phase Summary

| Phase | Deliverables | Dependencies |
|-------|-------------|--------------|
| 1 — Web Core | Schema, 3 new routers, 8 new pages, talent pool badge signal | Prisma migration |
| 2 — Payments | Stripe integration, checkout, webhooks, billing portal | Stripe account, Phase 1 |
| 3 — Dev Badge | Badge flow, expiry, job alert lead time, push queue | Phase 2 (Stripe sub), Phase 1 (AI review) |
| 4 — Contracts | Template generation, signing, milestones, dispute flow | Phase 1 schema, Phase 2 fee collection |
| 5 — Mobile | Expo app, shared tRPC, push notifications, app store | Phase 1–3 complete, Expo account |
| 6 — Onboarding | Candidate badge upsell, client subscription gate, email system | Phase 2 (Stripe), Resend account |