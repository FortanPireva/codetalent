import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { assessmentRouter } from "@/server/api/routers/assessment";
import { reviewRouter } from "@/server/api/routers/review";
import { talentPoolRouter } from "@/server/api/routers/talentPool";
import { onboardingRouter } from "@/server/api/routers/onboarding";
import { clientRouter } from "@/server/api/routers/client";
import { clientOnboardingRouter } from "@/server/api/routers/clientOnboarding";
import { jobRouter } from "@/server/api/routers/job";
import { applicationRouter } from "@/server/api/routers/application";
import { subscriptionRouter } from "@/server/api/routers/subscription";
import { notificationRouter } from "@/server/api/routers/notification";
import { messagesRouter } from "@/server/api/routers/messages";
import { moderationRouter } from "@/server/api/routers/moderation";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  assessment: assessmentRouter,
  review: reviewRouter,
  talentPool: talentPoolRouter,
  onboarding: onboardingRouter,
  clients: clientRouter,
  clientOnboarding: clientOnboardingRouter,
  job: jobRouter,
  application: applicationRouter,
  subscription: subscriptionRouter,
  notification: notificationRouter,
  messages: messagesRouter,
  moderation: moderationRouter,
});

export type AppRouter = typeof appRouter;
