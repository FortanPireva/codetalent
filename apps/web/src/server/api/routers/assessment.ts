import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  approvedProcedure,
} from "@/server/api/trpc";
import { Difficulty, SubmissionStatus } from "@codetalent/db";

export const assessmentRouter = createTRPCRouter({
  // Public: List active assessments for catalog
  listActive: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.assessment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        timeLimit: true,
        _count: {
          select: { submissions: true },
        },
      },
    });
  }),

  // Admin: List all assessments with submission counts
  listAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.assessment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });
  }),

  // Approved: Get assessment by slug
  getBySlug: approvedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const assessment = await ctx.db.assessment.findUnique({
        where: { slug: input.slug },
        include: {
          _count: {
            select: { submissions: true },
          },
        },
      });

      if (!assessment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assessment not found",
        });
      }

      // Check if user has already applied
      const existingSubmission = await ctx.db.submission.findUnique({
        where: {
          userId_assessmentId: {
            userId: ctx.session.user.id,
            assessmentId: assessment.id,
          },
        },
      });

      return {
        ...assessment,
        hasApplied: !!existingSubmission,
        submission: existingSubmission,
      };
    }),

  // Approved: Get assessment by ID
  getById: approvedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const assessment = await ctx.db.assessment.findUnique({
        where: { id: input.id },
      });

      if (!assessment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assessment not found",
        });
      }

      return assessment;
    }),

  // Admin: Create assessment
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3),
        slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
        description: z.string().min(10),
        difficulty: z.nativeEnum(Difficulty),
        repoUrl: z.string().url(),
        timeLimit: z.number().min(1).max(30).default(7),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.assessment.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Assessment with this slug already exists",
        });
      }

      return ctx.db.assessment.create({
        data: input,
      });
    }),

  // Admin: Update assessment
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        difficulty: z.nativeEnum(Difficulty).optional(),
        repoUrl: z.string().url().optional(),
        timeLimit: z.number().min(1).max(30).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.db.assessment.update({
        where: { id },
        data,
      });
    }),

  // Admin: Delete assessment
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.assessment.delete({
        where: { id: input.id },
      });
    }),

  // Approved: Apply to assessment (create submission)
  apply: approvedProcedure
    .input(z.object({ assessmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const assessment = await ctx.db.assessment.findUnique({
        where: { id: input.assessmentId },
      });

      if (!assessment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assessment not found",
        });
      }

      if (!assessment.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Assessment is not active",
        });
      }

      const existing = await ctx.db.submission.findUnique({
        where: {
          userId_assessmentId: {
            userId: ctx.session.user.id,
            assessmentId: input.assessmentId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already applied to this assessment",
        });
      }

      return ctx.db.submission.create({
        data: {
          userId: ctx.session.user.id,
          assessmentId: input.assessmentId,
          status: SubmissionStatus.ASSIGNED,
          startedAt: new Date(),
        },
        include: {
          assessment: true,
        },
      });
    }),

  // Approved: Get user's submissions
  mySubmissions: approvedProcedure.query(async ({ ctx }) => {
    return ctx.db.submission.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            timeLimit: true,
          },
        },
        review: {
          select: {
            averageScore: true,
            passed: true,
            codeQuality: true,
            architecture: true,
            typeSafety: true,
            errorHandling: true,
            testing: true,
            gitPractices: true,
            documentation: true,
            bestPractices: true,
            summary: true,
            strengths: true,
            improvements: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Approved: Submit GitHub fork URL
  submitFork: approvedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        forkUrl: z.string().url().refine((url) => url.includes("github.com"), {
          message: "Must be a valid GitHub URL",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      if (submission.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only submit your own assessments",
        });
      }

      if (
        submission.status !== SubmissionStatus.ASSIGNED &&
        submission.status !== SubmissionStatus.IN_PROGRESS
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This submission has already been submitted",
        });
      }

      return ctx.db.submission.update({
        where: { id: input.submissionId },
        data: {
          forkUrl: input.forkUrl,
          status: SubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
        },
        include: {
          assessment: true,
        },
      });
    }),

  // Admin: List all submissions with filters (pipeline)
  listSubmissions: adminProcedure
    .input(
      z.object({
        status: z.nativeEnum(SubmissionStatus).optional(),
        difficulty: z.nativeEnum(Difficulty).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.submission.findMany({
        where: {
          status: input.status,
          assessment: input.difficulty
            ? { difficulty: input.difficulty }
            : undefined,
          user: input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { email: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assessment: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
          review: {
            select: {
              averageScore: true,
              passed: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Admin: Get single submission with full detail
  getSubmission: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              githubUrl: true,
              linkedinUrl: true,
              skills: true,
            },
          },
          assessment: true,
          review: true,
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      return submission;
    }),

  // Admin: Update submission status (manual override)
  updateSubmissionStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(SubmissionStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.submission.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
