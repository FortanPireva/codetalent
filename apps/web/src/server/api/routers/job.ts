import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, clientProcedure, adminProcedure, approvedProcedure } from "@/server/api/trpc";
import { ExperienceLevel, EmploymentType, WorkArrangement, JobUrgency, JobStatus } from "@codetalent/db";
import { db } from "@/server/db";

const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  DRAFT: ["OPEN"],
  OPEN: ["PAUSED", "FILLED", "CLOSED"],
  PAUSED: ["OPEN", "CLOSED"],
  FILLED: ["OPEN", "CLOSED"],
  CLOSED: [],
  EXPIRED: [],
};

async function getClientForUser(prisma: typeof db, userId: string) {
  const client = await prisma.client.findFirst({
    where: { userId },
    select: { id: true, name: true },
  });
  if (!client) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Client profile not found",
    });
  }
  return client;
}

export const jobRouter = createTRPCRouter({
  list: clientProcedure
    .input(
      z.object({
        status: z.nativeEnum(JobStatus).optional(),
        search: z.string().optional(),
        sort: z.enum(["newest", "oldest", "title"]).default("newest"),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const client = await getClientForUser(ctx.db, ctx.session.user.id);
      const { status, search, sort, limit } = input ?? {};

      const where = {
        clientId: client.id,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { summary: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const orderBy =
        sort === "oldest"
          ? { createdAt: "asc" as const }
          : sort === "title"
            ? { title: "asc" as const }
            : { createdAt: "desc" as const };

      return ctx.db.job.findMany({
        where,
        orderBy,
        take: limit,
      });
    }),

  getById: clientProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await getClientForUser(ctx.db, ctx.session.user.id);

      const job = await ctx.db.job.findUnique({
        where: { id: input.id },
        include: { client: { select: { name: true, slug: true } } },
      });

      if (!job || job.clientId !== client.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  create: clientProcedure
    .input(
      z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        summary: z.string().max(300).optional(),
        description: z.string().optional(),
        responsibilities: z.string().optional(),
        requirements: z.string().optional(),
        niceToHave: z.string().optional(),
        roleType: z.string().optional(),
        experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
        yearsMin: z.number().int().min(0).optional(),
        yearsMax: z.number().int().min(0).optional(),
        requiredSkills: z.array(z.string()).default([]),
        preferredSkills: z.array(z.string()).default([]),
        techStack: z.array(z.string()).default([]),
        frameworks: z.array(z.string()).default([]),
        databases: z.array(z.string()).default([]),
        cloud: z.array(z.string()).default([]),
        tools: z.array(z.string()).default([]),
        employmentType: z.nativeEnum(EmploymentType).optional(),
        workArrangement: z.nativeEnum(WorkArrangement).optional(),
        location: z.string().optional(),
        timezone: z.string().optional(),
        relocation: z.boolean().default(false),
        visaSponsorship: z.boolean().default(false),
        showSalary: z.boolean().default(true),
        salaryMin: z.number().int().min(0).optional(),
        salaryMax: z.number().int().min(0).optional(),
        salaryCurrency: z.string().default("USD"),
        salaryPeriod: z.string().default("YEARLY"),
        equity: z.boolean().default(false),
        equityRange: z.string().optional(),
        bonus: z.string().optional(),
        benefits: z.array(z.string()).default([]),
        interviewStages: z.array(z.string()).default([]),
        interviewLength: z.string().optional(),
        urgency: z.nativeEnum(JobUrgency).default("MEDIUM"),
        headcount: z.number().int().min(1).default(1),
        startsAt: z.string().optional(),
        closesAt: z.string().optional(),
        tags: z.array(z.string()).default([]),
        publish: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = await getClientForUser(ctx.db, ctx.session.user.id);

      // Generate slug
      let slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const existing = await ctx.db.job.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const { publish, startsAt, closesAt, ...rest } = input;

      return ctx.db.job.create({
        data: {
          ...rest,
          slug,
          clientId: client.id,
          status: publish ? "OPEN" : "DRAFT",
          publishedAt: publish ? new Date() : null,
          startsAt: startsAt ? new Date(startsAt) : null,
          closesAt: closesAt ? new Date(closesAt) : null,
        },
      });
    }),

  update: clientProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        summary: z.string().max(300).optional(),
        description: z.string().optional(),
        responsibilities: z.string().optional(),
        requirements: z.string().optional(),
        niceToHave: z.string().optional(),
        roleType: z.string().optional(),
        experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
        yearsMin: z.number().int().min(0).optional(),
        yearsMax: z.number().int().min(0).optional(),
        requiredSkills: z.array(z.string()).optional(),
        preferredSkills: z.array(z.string()).optional(),
        techStack: z.array(z.string()).optional(),
        frameworks: z.array(z.string()).optional(),
        databases: z.array(z.string()).optional(),
        cloud: z.array(z.string()).optional(),
        tools: z.array(z.string()).optional(),
        employmentType: z.nativeEnum(EmploymentType).optional(),
        workArrangement: z.nativeEnum(WorkArrangement).optional(),
        location: z.string().optional(),
        timezone: z.string().optional(),
        relocation: z.boolean().optional(),
        visaSponsorship: z.boolean().optional(),
        showSalary: z.boolean().optional(),
        salaryMin: z.number().int().min(0).optional(),
        salaryMax: z.number().int().min(0).optional(),
        salaryCurrency: z.string().optional(),
        salaryPeriod: z.string().optional(),
        equity: z.boolean().optional(),
        equityRange: z.string().optional(),
        bonus: z.string().optional(),
        benefits: z.array(z.string()).optional(),
        interviewStages: z.array(z.string()).optional(),
        interviewLength: z.string().optional(),
        urgency: z.nativeEnum(JobUrgency).optional(),
        headcount: z.number().int().min(1).optional(),
        startsAt: z.string().nullable().optional(),
        closesAt: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = await getClientForUser(ctx.db, ctx.session.user.id);

      const job = await ctx.db.job.findUnique({ where: { id: input.id } });
      if (!job || job.clientId !== client.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (["FILLED", "CLOSED", "EXPIRED"].includes(job.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit a job that is filled, closed, or expired",
        });
      }

      const { id, startsAt, closesAt, ...rest } = input;

      return ctx.db.job.update({
        where: { id },
        data: {
          ...rest,
          ...(startsAt !== undefined
            ? { startsAt: startsAt ? new Date(startsAt) : null }
            : {}),
          ...(closesAt !== undefined
            ? { closesAt: closesAt ? new Date(closesAt) : null }
            : {}),
        },
      });
    }),

  updateStatus: clientProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(JobStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = await getClientForUser(ctx.db, ctx.session.user.id);

      const job = await ctx.db.job.findUnique({ where: { id: input.id } });
      if (!job || job.clientId !== client.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const allowed = ALLOWED_TRANSITIONS[job.status];
      if (!allowed?.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition from ${job.status} to ${input.status}`,
        });
      }

      return ctx.db.job.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.status === "OPEN" && !job.publishedAt
            ? { publishedAt: new Date() }
            : {}),
        },
      });
    }),

  delete: clientProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await getClientForUser(ctx.db, ctx.session.user.id);

      const job = await ctx.db.job.findUnique({ where: { id: input.id } });
      if (!job || job.clientId !== client.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (job.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft jobs can be deleted",
        });
      }

      return ctx.db.job.delete({ where: { id: input.id } });
    }),

  getStats: clientProcedure.query(async ({ ctx }) => {
    const client = await getClientForUser(ctx.db, ctx.session.user.id);

    const jobs = await ctx.db.job.groupBy({
      by: ["status"],
      where: { clientId: client.id },
      _count: { id: true },
    });

    const counts = jobs.reduce(
      (acc, g) => {
        acc[g.status] = g._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalJobs: Object.values(counts).reduce((a, b) => a + b, 0),
      openJobs: counts.OPEN ?? 0,
      draftJobs: counts.DRAFT ?? 0,
      pausedJobs: counts.PAUSED ?? 0,
      filledJobs: counts.FILLED ?? 0,
      closedJobs: counts.CLOSED ?? 0,
    };
  }),

  // ── Admin procedures ──────────────────────────────────────────────

  adminList: adminProcedure
    .input(
      z.object({
        status: z.nativeEnum(JobStatus).optional(),
        clientId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { status, clientId, search, limit } = input ?? {};

      const where = {
        ...(status ? { status } : {}),
        ...(clientId ? { clientId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { summary: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      return ctx.db.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { client: { select: { id: true, name: true, slug: true } } },
      });
    }),

  adminGetById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.id },
        include: { client: { select: { id: true, name: true, slug: true } } },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        summary: z.string().max(300).optional(),
        description: z.string().optional(),
        responsibilities: z.string().optional(),
        requirements: z.string().optional(),
        niceToHave: z.string().optional(),
        roleType: z.string().optional(),
        experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
        yearsMin: z.number().int().min(0).optional(),
        yearsMax: z.number().int().min(0).optional(),
        requiredSkills: z.array(z.string()).optional(),
        preferredSkills: z.array(z.string()).optional(),
        techStack: z.array(z.string()).optional(),
        frameworks: z.array(z.string()).optional(),
        databases: z.array(z.string()).optional(),
        cloud: z.array(z.string()).optional(),
        tools: z.array(z.string()).optional(),
        employmentType: z.nativeEnum(EmploymentType).optional(),
        workArrangement: z.nativeEnum(WorkArrangement).optional(),
        location: z.string().optional(),
        timezone: z.string().optional(),
        relocation: z.boolean().optional(),
        visaSponsorship: z.boolean().optional(),
        showSalary: z.boolean().optional(),
        salaryMin: z.number().int().min(0).optional(),
        salaryMax: z.number().int().min(0).optional(),
        salaryCurrency: z.string().optional(),
        salaryPeriod: z.string().optional(),
        equity: z.boolean().optional(),
        equityRange: z.string().optional(),
        bonus: z.string().optional(),
        benefits: z.array(z.string()).optional(),
        interviewStages: z.array(z.string()).optional(),
        interviewLength: z.string().optional(),
        urgency: z.nativeEnum(JobUrgency).optional(),
        headcount: z.number().int().min(1).optional(),
        status: z.nativeEnum(JobStatus).optional(),
        startsAt: z.string().nullable().optional(),
        closesAt: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({ where: { id: input.id } });
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const { id, startsAt, closesAt, status, ...rest } = input;

      return ctx.db.job.update({
        where: { id },
        data: {
          ...rest,
          ...(status !== undefined ? { status } : {}),
          ...(status === "OPEN" && !job.publishedAt
            ? { publishedAt: new Date() }
            : {}),
          ...(startsAt !== undefined
            ? { startsAt: startsAt ? new Date(startsAt) : null }
            : {}),
          ...(closesAt !== undefined
            ? { closesAt: closesAt ? new Date(closesAt) : null }
            : {}),
        },
      });
    }),

  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(JobStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({ where: { id: input.id } });
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const allowed = ALLOWED_TRANSITIONS[job.status];
      if (!allowed?.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition from ${job.status} to ${input.status}`,
        });
      }

      return ctx.db.job.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.status === "OPEN" && !job.publishedAt
            ? { publishedAt: new Date() }
            : {}),
        },
      });
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({ where: { id: input.id } });
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.job.delete({ where: { id: input.id } });
    }),

  adminStats: adminProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.db.job.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const counts = jobs.reduce(
      (acc, g) => {
        acc[g.status] = g._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalJobs: Object.values(counts).reduce((a, b) => a + b, 0),
      openJobs: counts.OPEN ?? 0,
      draftJobs: counts.DRAFT ?? 0,
      pausedJobs: counts.PAUSED ?? 0,
      filledJobs: counts.FILLED ?? 0,
      closedJobs: counts.CLOSED ?? 0,
    };
  }),

  // ── Public procedures (no auth required) ──────────────────────────

  publicList: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        roleType: z.string().optional(),
        experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
        workArrangement: z.nativeEnum(WorkArrangement).optional(),
        employmentType: z.nativeEnum(EmploymentType).optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { search, roleType, experienceLevel, workArrangement, employmentType, limit } = input ?? {};

      const where = {
        status: "OPEN" as const,
        ...(roleType ? { roleType } : {}),
        ...(experienceLevel ? { experienceLevel } : {}),
        ...(workArrangement ? { workArrangement } : {}),
        ...(employmentType ? { employmentType } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { summary: { contains: search, mode: "insensitive" as const } },
                { requiredSkills: { hasSome: [search] } },
              ],
            }
          : {}),
      };

      return ctx.db.job.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        include: { client: { select: { name: true, slug: true, logo: true, location: true } } },
      });
    }),

  publicGetById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.id, status: "OPEN" },
        include: { client: { select: { name: true, slug: true, logo: true, location: true, industry: true, size: true, description: true, website: true, techStack: true } } },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      await ctx.db.job.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      return job;
    }),

  // ── Candidate procedures (approved candidates only) ───────────────

  candidateList: approvedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        roleType: z.string().optional(),
        experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
        workArrangement: z.nativeEnum(WorkArrangement).optional(),
        employmentType: z.nativeEnum(EmploymentType).optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { search, roleType, experienceLevel, workArrangement, employmentType, limit } = input ?? {};

      const where = {
        status: "OPEN" as const,
        ...(roleType ? { roleType } : {}),
        ...(experienceLevel ? { experienceLevel } : {}),
        ...(workArrangement ? { workArrangement } : {}),
        ...(employmentType ? { employmentType } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { summary: { contains: search, mode: "insensitive" as const } },
                { requiredSkills: { hasSome: [search] } },
              ],
            }
          : {}),
      };

      return ctx.db.job.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        include: { client: { select: { name: true, slug: true, logo: true, location: true } } },
      });
    }),

  candidateGetById: approvedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.id, status: "OPEN" },
        include: { client: { select: { name: true, slug: true, logo: true, location: true, industry: true, size: true, description: true, website: true, techStack: true } } },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      // Increment view count
      await ctx.db.job.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      return job;
    }),
});
