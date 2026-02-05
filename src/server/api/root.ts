import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { assessmentRouter } from "@/server/api/routers/assessment";
import { reviewRouter } from "@/server/api/routers/review";
import { talentPoolRouter } from "@/server/api/routers/talentPool";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  assessment: assessmentRouter,
  review: reviewRouter,
  talentPool: talentPoolRouter,
});

export type AppRouter = typeof appRouter;
