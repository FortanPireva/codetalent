# Job Alerts & Notifications System — Changes Summary

## New Files Created

### Backend Services
- **`apps/web/src/server/services/notifications.ts`** — Notification service using Expo Server SDK. Exports `sendNotification()` (single) and `sendBulkNotifications()` (batch). Persists notification records, checks user preferences before sending push, chunks Expo push sends per 100.
- **`apps/web/src/server/services/jobMatcher.ts`** — Job matching service. Exports `findNewJobMatches()`. Queries OPEN jobs published in last 25h, matches APPROVED candidates by skill overlap (case-insensitive). Verified users get 24h early access to new job alerts. Deduplicates via `JobMatchLog`.

### tRPC Router
- **`apps/web/src/server/api/routers/notification.ts`** — 9 procedures:
  - `registerPushToken` / `removePushToken` — manage Expo push tokens
  - `getPreferences` / `updatePreferences` — synced notification preferences
  - `list` — paginated notification feed (cursor-based)
  - `markAsRead` / `markAllAsRead` — read state management
  - `unreadCount` — count of unread notifications
  - `toggleVerified` — admin-only verified badge toggle

### Cron Job
- **`apps/web/src/app/api/cron/job-matches/route.ts`** — Hourly Vercel cron endpoint. Authenticates via `CRON_SECRET` Bearer token, calls `findNewJobMatches()`, returns JSON stats.

### Mobile App
- **`apps/mobile/src/hooks/useNotifications.ts`** — Push notification registration hook. Lazy-loads `expo-notifications` to avoid crash in Expo Go. Requests permissions, registers token via tRPC, sets up tap-to-navigate listeners.
- **`apps/mobile/app/(app)/notifications.tsx`** — Notification inbox screen. Infinite scroll list with unread indicators, tap to mark read + navigate, "Mark all read" header button.

---

## Modified Files

### Database Schema
- **`packages/db/prisma/schema.prisma`**
  - Added `NotificationType` enum (`JOB_MATCH`, `APPLICATION_STATUS_CHANGE`, `ASSESSMENT_RESULT`, `CONTRACT_UPDATE`, `MILESTONE_APPROVAL`)
  - Added `isVerified Boolean @default(false)` to `User` model
  - Added 3 new relations on `User`: `pushTokens`, `notificationPreference`, `notifications`
  - Added 4 new models: `PushToken`, `NotificationPreference`, `Notification`, `JobMatchLog`

### DB Package Exports
- **`packages/db/src/index.ts`**
  - Added `NotificationType` to enum exports
  - Added `PushToken`, `NotificationPreference`, `Notification`, `JobMatchLog` to type exports

### tRPC Root Router
- **`apps/web/src/server/api/root.ts`**
  - Imported and registered `notificationRouter`

### Event Triggers
- **`apps/web/src/server/api/routers/application.ts`**
  - `inviteForInterview` — sends "Interview Invitation" notification after creating application
  - `updateStatus` — sends "Application Update" notification after status change
  - Both fire-and-forget (`.catch()` to avoid blocking the response)

- **`apps/web/src/server/api/routers/review.ts`**
  - `runReview` — sends "Assessment Review Complete" notification after AI review with pass/fail result

### Talent Pool (Admin)
- **`apps/web/src/server/api/routers/talentPool.ts`**
  - `getPendingCandidate` return object now includes `isVerified` field

- **`apps/web/src/app/(admin)/admin/verification/[id]/page.tsx`**
  - Added imports: `Switch`, `Label`, `ShieldCheck` icon
  - Added `toggleVerifiedMutation` using `api.notification.toggleVerified`
  - Added "Verified Developer" card in sidebar with toggle switch and description

### Vercel Config
- **`apps/web/vercel.json`**
  - Added `crons` array with hourly `/api/cron/job-matches` schedule

### Mobile App
- **`apps/mobile/app.json`**
  - Added `expo-notifications` to plugins array

- **`apps/mobile/app/_layout.tsx`**
  - Imported `useNotifications` hook
  - Called `useNotifications(isAuthenticated)` in `RootLayoutInner`

- **`apps/mobile/app/(app)/(tabs)/_layout.tsx`**
  - Added bell icon (🔔) with unread count badge in header right
  - Polls `api.notification.unreadCount` every 30 seconds
  - Tapping bell navigates to notifications screen

- **`apps/mobile/app/(app)/(tabs)/settings.tsx`**
  - Notification toggles now sync with backend via `api.notification.getPreferences` / `updatePreferences`
  - AsyncStorage kept as local cache/fallback
  - Server preferences take priority when available

---

## Dependencies Added
- `expo-server-sdk` in `apps/web` (Expo push notification server SDK)
- `expo-notifications` in `apps/mobile` (Expo push notifications client)
- `expo-device` in `apps/mobile` (device detection for push registration)

---

## Environment Variables Required
- `CRON_SECRET` — Bearer token for authenticating the Vercel cron job endpoint
