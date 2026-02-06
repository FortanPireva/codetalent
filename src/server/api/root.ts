import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { assessmentRouter } from "@/server/api/routers/assessment";
import { reviewRouter } from "@/server/api/routers/review";
import { talentPoolRouter } from "@/server/api/routers/talentPool";
import { onboardingRouter } from "@/server/api/routers/onboarding";
import { clientRouter } from "@/server/api/routers/client";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  assessment: assessmentRouter,
  review: reviewRouter,
  talentPool: talentPoolRouter,
  onboarding: onboardingRouter,
  clients: clientRouter,
});

export type AppRouter = typeof appRouter;
