import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Re-export all Prisma enums and types
export {
  PrismaClient,
  Role,
  Availability,
  Difficulty,
  SubmissionStatus,
  CandidateStatus,
  ClientOnboardingStatus,
  CompanySize,
  ClientStatus,
  JobStatus,
  ExperienceLevel,
  EmploymentType,
  WorkArrangement,
  JobUrgency,
  ApplicationStatus,
  SubscriptionTier,
  SubscriptionStatus,
  BillingInterval,
} from "@prisma/client";

export type { Job, User, Client, Assessment, Submission, Review, JobApplication, ClientSubscription } from "@prisma/client";
