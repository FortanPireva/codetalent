import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, approvedProcedure } from "@/server/api/trpc";

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
});
