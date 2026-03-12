# Database Query Optimization & Pagination Changes

## Overview

Optimized the database layer for scale by adding composite indexes, narrowing over-fetched selects, and implementing cursor-based pagination on unbounded list queries.

---

## Phase 1: Composite Indexes

**File:** `packages/db/prisma/schema.prisma`

Added 9 composite indexes to support existing multi-column WHERE clauses:

| Model | Index | Supports |
|-------|-------|----------|
| User | `[role, candidateStatus]` | talentPool.list, clientList base filter |
| User | `[role, candidateStatus, availability]` | clientList with availability IN filter |
| User | `[role, clientStatus]` | Client verification queries |
| Submission | `[userId, createdAt]` | mySubmissions ordered by createdAt |
| Submission | `[status, createdAt]` | listSubmissions filtered by status |
| Job | `[status, publishedAt]` | Candidate job board (status=OPEN) |
| Job | `[clientId, status]` | Client job.list filtered by clientId + status |
| JobApplication | `[jobId, status]` | clientOverview groupBy, listForJob |
| JobApplication | `[userId, appliedAt]` | myApplications ordered by appliedAt |

**Deploy:** `pnpm db:generate && pnpm db:push`

---

## Phase 2: Narrowed Over-fetched Selects

**File:** `apps/web/src/server/api/routers/talentPool.ts` — `clientList` procedure

Changed submissions from `include` (fetches all fields) to `select` (fetches only `review.averageScore` and `review.passed`). The return mapping only uses `submissions.length`, `review.passed`, and `review.averageScore`, so the extra fields were wasted bandwidth.

> **Note:** `mySubmissions` in `assessment.ts` was NOT narrowed because the mobile profile screen (`apps/mobile/app/(app)/profile/index.tsx`) uses all 8 review category scores.

---

## Phase 3: Cursor-Based Pagination (Backend)

Added `cursor` (string, optional) and `limit` (1-100, default 20) inputs to 3 unbounded list queries. All now return `{ items: T[], nextCursor: string | undefined }`.

| Procedure | File |
|-----------|------|
| `talentPool.list` | `apps/web/src/server/api/routers/talentPool.ts` |
| `talentPool.clientList` | `apps/web/src/server/api/routers/talentPool.ts` |
| `assessment.listSubmissions` | `apps/web/src/server/api/routers/assessment.ts` |

**Additional fix:** Updated `apps/web/src/app/(admin)/admin/page.tsx` to unwrap `.items` from the new `listSubmissions` response shape (admin dashboard used `submissions?.slice()` directly).

---

## Phase 4: Frontend Infinite Query + Load More

Replaced `useQuery` with `useInfiniteQuery` and added "Load More" buttons on 3 pages:

| Page | File |
|------|------|
| Admin Talent Pool | `apps/web/src/app/(admin)/admin/talent-pool/page.tsx` |
| Client Talent Discovery | `apps/web/src/app/(client)/client/talent/page.tsx` |
| Admin Candidates Pipeline | `apps/web/src/app/(admin)/admin/candidates/page.tsx` |

Each page:
- Uses `useInfiniteQuery` with `getNextPageParam: (lastPage) => lastPage.nextCursor`
- Flattens pages via `data?.pages.flatMap((p) => p.items)`
- Shows a "Load More" button when `hasNextPage` is true
- Disables the button while `isFetchingNextPage` is true
- Resets to page 1 automatically when filters change (React Query default behavior)

---

## Files Modified (Summary)

| File | Changes |
|------|---------|
| `packages/db/prisma/schema.prisma` | +9 composite indexes |
| `apps/web/src/server/api/routers/talentPool.ts` | Pagination on `list` + `clientList`, narrowed `clientList` selects |
| `apps/web/src/server/api/routers/assessment.ts` | Pagination on `listSubmissions` |
| `apps/web/src/app/(admin)/admin/page.tsx` | Unwrap `.items` from paginated response |
| `apps/web/src/app/(admin)/admin/talent-pool/page.tsx` | `useInfiniteQuery` + Load More |
| `apps/web/src/app/(client)/client/talent/page.tsx` | `useInfiniteQuery` + Load More |
| `apps/web/src/app/(admin)/admin/candidates/page.tsx` | `useInfiniteQuery` + Load More |
