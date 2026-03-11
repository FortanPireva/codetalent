import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, approvedProcedure, clientProcedure } from "@/server/api/trpc";
import { ApplicationStatus } from "@prisma/client";
import { db } from "@/server/db";

export const applicationRouter = createTRPCRouter({
  apply: approvedProcedure
    .input(
      z.object({
        jobId: z.string(),
        coverLetter: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.$transaction(async (tx) => {
        const job = await tx.job.findUnique({
          where: { id: input.jobId },
          select: { id: true, status: true },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }
        if (job.status !== "OPEN") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This job is no longer accepting applications",
          });
        }

        const existing = await tx.jobApplication.findUnique({
          where: { userId_jobId: { userId, jobId: input.jobId } },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already applied to this job",
          });
        }

        const application = await tx.jobApplication.create({
          data: {
            userId,
            jobId: input.jobId,
            coverLetter: input.coverLetter,
          },
        });

        await tx.job.update({
          where: { id: input.jobId },
          data: { applicationCount: { increment: 1 } },
        });

        return application;
      });
    }),

  hasApplied: approvedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.jobApplication.findUnique({
        where: {
          userId_jobId: {
            userId: ctx.session.user.id,
            jobId: input.jobId,
          },
        },
        select: { id: true, status: true, appliedAt: true },
      });
      return application;
    }),

  myApplications: approvedProcedure.query(async ({ ctx }) => {
    return ctx.db.jobApplication.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        job: {
          include: {
            client: {
              select: { name: true, location: true },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });
  }),

  withdraw: approvedProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.$transaction(async (tx) => {
        const application = await tx.jobApplication.findUnique({
          where: { id: input.applicationId },
          select: { id: true, userId: true, jobId: true, status: true },
        });

        if (!application) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found",
          });
        }
        if (application.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not your application",
          });
        }
        if (application.status !== "APPLIED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only applications with APPLIED status can be withdrawn",
          });
        }

        await tx.jobApplication.delete({
          where: { id: input.applicationId },
        });

        await tx.job.update({
          where: { id: application.jobId },
          data: { applicationCount: { decrement: 1 } },
        });

        return { success: true };
      });
    }),

  // ── Client procedures ──────────────────────────────────────────────

  clientOverview: clientProcedure.query(async ({ ctx }) => {
    const client = await db.client.findFirst({
      where: { userId: ctx.session.user.id },
      select: { id: true },
    });
    if (!client) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Client profile not found" });
    }

    // Get all jobs for this client that have applications
    const clientJobs = await ctx.db.job.findMany({
      where: { clientId: client.id },
      select: { id: true, title: true, status: true, applicationCount: true },
    });
    const jobIds = clientJobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return {
        statusCounts: {} as Record<string, number>,
        totalApplications: 0,
        jobs: [],
      };
    }

    // Global counts by status
    const globalCounts = await ctx.db.jobApplication.groupBy({
      by: ["status"],
      where: { jobId: { in: jobIds } },
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {};
    let totalApplications = 0;
    for (const g of globalCounts) {
      statusCounts[g.status] = g._count.id;
      totalApplications += g._count.id;
    }

    // Per-job breakdown by status
    const perJobCounts = await ctx.db.jobApplication.groupBy({
      by: ["jobId", "status"],
      where: { jobId: { in: jobIds } },
      _count: { id: true },
    });

    const jobMap = new Map<string, Record<string, number>>();
    for (const g of perJobCounts) {
      if (!jobMap.has(g.jobId)) jobMap.set(g.jobId, {});
      jobMap.get(g.jobId)![g.status] = g._count.id;
    }

    const jobs = clientJobs
      .filter((j) => j.applicationCount > 0 || jobMap.has(j.id))
      .map((j) => ({
        id: j.id,
        title: j.title,
        status: j.status,
        applicationCount: j.applicationCount,
        statusBreakdown: jobMap.get(j.id) ?? {},
      }));

    return { statusCounts, totalApplications, jobs };
  }),

  inviteForInterview: clientProcedure
    .input(
      z.object({
        candidateId: z.string(),
        jobId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = await db.client.findFirst({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client profile not found" });
      }

      return ctx.db.$transaction(async (tx) => {
        const job = await tx.job.findUnique({
          where: { id: input.jobId },
          select: { id: true, clientId: true, status: true },
        });

        if (!job || job.clientId !== client.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }
        if (job.status !== "OPEN") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This job is no longer accepting applications",
          });
        }

        const existing = await tx.jobApplication.findUnique({
          where: { userId_jobId: { userId: input.candidateId, jobId: input.jobId } },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This candidate already has an application for this job",
          });
        }

        const application = await tx.jobApplication.create({
          data: {
            userId: input.candidateId,
            jobId: input.jobId,
            status: "INTERVIEW",
          },
        });

        await tx.job.update({
          where: { id: input.jobId },
          data: { applicationCount: { increment: 1 } },
        });

        return application;
      });
    }),

  listForJob: clientProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await db.client.findFirst({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        select: { id: true, clientId: true },
      });
      if (!job || job.clientId !== client.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const applications = await ctx.db.jobApplication.findMany({
        where: { jobId: input.jobId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              bio: true,
              skills: true,
              location: true,
              availability: true,
              githubUrl: true,
              linkedinUrl: true,
              resumeUrl: true,
              profilePicture: true,
              createdAt: true,
              submissions: {
                where: { review: { passed: true } },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      return applications.map((app) => ({
        ...app,
        user: {
          ...app.user,
          passedCount: app.user.submissions.length,
          submissions: undefined,
        },
      }));
    }),

  updateStatus: clientProcedure
    .input(
      z.object({
        applicationId: z.string(),
        status: z.nativeEnum(ApplicationStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = await db.client.findFirst({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client profile not found" });
      }

      const application = await ctx.db.jobApplication.findUnique({
        where: { id: input.applicationId },
        include: {
          job: { select: { id: true, clientId: true } },
        },
      });
      if (!application || application.job.clientId !== client.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      const previousStatus = application.status;

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.jobApplication.update({
          where: { id: input.applicationId },
          data: { status: input.status },
        });

        // Manage filledCount when transitioning to/from HIRED
        if (input.status === "HIRED" && previousStatus !== "HIRED") {
          await tx.job.update({
            where: { id: application.job.id },
            data: { filledCount: { increment: 1 } },
          });
        } else if (previousStatus === "HIRED" && input.status !== "HIRED") {
          await tx.job.update({
            where: { id: application.job.id },
            data: { filledCount: { decrement: 1 } },
          });
        }

        return updated;
      });
    }),
});
