import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure, clientProcedure } from "@/server/api/trpc";
import { Availability, SubmissionStatus, CandidateStatus } from "@codetalent/db";

export const talentPoolRouter = createTRPCRouter({
  // Admin: List filtered candidates (talent pool)
  list: adminProcedure
    .input(
      z.object({
        availability: z.nativeEnum(Availability).optional(),
        skills: z.array(z.string()).optional(),
        search: z.string().optional(),
        passedOnly: z.boolean().default(false),
        minHourlyRate: z.number().min(0).optional(),
        maxHourlyRate: z.number().min(0).optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, ...filters } = input;

      const candidates = await ctx.db.user.findMany({
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where: {
          role: "CANDIDATE",
          candidateStatus: "APPROVED",
          availability: filters.availability,
          ...(filters.search
            ? {
                OR: [
                  { name: { contains: filters.search, mode: "insensitive" as const } },
                  { email: { contains: filters.search, mode: "insensitive" as const } },
                  { location: { contains: filters.search, mode: "insensitive" as const } },
                ],
              }
            : {}),
          ...(filters.skills && filters.skills.length > 0
            ? { skills: { hasSome: filters.skills } }
            : {}),
          ...(filters.passedOnly
            ? {
                submissions: {
                  some: {
                    status: SubmissionStatus.PASSED,
                  },
                },
              }
            : {}),
          ...(filters.minHourlyRate !== undefined || filters.maxHourlyRate !== undefined
            ? {
                hourlyRate: {
                  ...(filters.minHourlyRate !== undefined ? { gte: filters.minHourlyRate } : {}),
                  ...(filters.maxHourlyRate !== undefined ? { lte: filters.maxHourlyRate } : {}),
                },
              }
            : {}),
        },
        include: {
          submissions: {
            include: {
              assessment: {
                select: {
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
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (candidates.length > limit) {
        const nextItem = candidates.pop()!;
        nextCursor = nextItem.id;
      }

      const items = candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        profilePicture: candidate.profilePicture,
        availability: candidate.availability,
        skills: candidate.skills,
        location: candidate.location,
        githubUrl: candidate.githubUrl,
        linkedinUrl: candidate.linkedinUrl,
        hourlyRate: candidate.hourlyRate,
        monthlyRate: candidate.monthlyRate,
        createdAt: candidate.createdAt,
        submissionCount: candidate.submissions.length,
        passedCount: candidate.submissions.filter((s) => s.review?.passed)
          .length,
        averageScore:
          candidate.submissions.filter((s) => s.review).length > 0
            ? candidate.submissions
                .filter((s) => s.review)
                .reduce((sum, s) => sum + (s.review?.averageScore ?? 0), 0) /
              candidate.submissions.filter((s) => s.review).length
            : null,
        latestSubmission: candidate.submissions[0] ?? null,
      }));

      return { items, nextCursor };
    }),

  // Admin: Update candidate availability
  updateAvailability: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        availability: z.nativeEnum(Availability),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.role !== "CANDIDATE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only update availability for candidates",
        });
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: { availability: input.availability },
        select: {
          id: true,
          name: true,
          email: true,
          availability: true,
        },
      });
    }),

  // Admin: Get talent pool stats
  stats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalCandidates,
      activelyLooking,
      openToOffers,
      passedAssessments,
      pendingReviews,
      pendingVerification,
    ] = await Promise.all([
      ctx.db.user.count({ where: { role: "CANDIDATE" } }),
      ctx.db.user.count({
        where: { role: "CANDIDATE", availability: Availability.ACTIVELY_LOOKING },
      }),
      ctx.db.user.count({
        where: { role: "CANDIDATE", availability: Availability.OPEN_TO_OFFERS },
      }),
      ctx.db.submission.count({ where: { status: SubmissionStatus.PASSED } }),
      ctx.db.submission.count({ where: { status: SubmissionStatus.SUBMITTED } }),
      ctx.db.user.count({
        where: { role: "CANDIDATE", candidateStatus: CandidateStatus.PENDING_REVIEW },
      }),
    ]);

    return {
      totalCandidates,
      activelyLooking,
      openToOffers,
      passedAssessments,
      pendingReviews,
      pendingVerification,
    };
  }),

  // Admin: Get full candidate detail
  getCandidate: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const candidate = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          submissions: {
            include: {
              assessment: true,
              review: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!candidate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidate not found",
        });
      }

      if (candidate.role !== "CANDIDATE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not a candidate",
        });
      }

      return {
        id: candidate.id,
        email: candidate.email,
        name: candidate.name,
        availability: candidate.availability,
        bio: candidate.bio,
        skills: candidate.skills,
        githubUrl: candidate.githubUrl,
        linkedinUrl: candidate.linkedinUrl,
        resumeUrl: candidate.resumeUrl,
        phone: candidate.phone,
        location: candidate.location,
        hourlyRate: candidate.hourlyRate,
        monthlyRate: candidate.monthlyRate,
        createdAt: candidate.createdAt,
        submissions: candidate.submissions,
      };
    }),

  // Admin: List candidates pending verification
  listPendingVerification: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: {
          role: "CANDIDATE",
          candidateStatus: "PENDING_REVIEW",
          ...(input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" as const } },
                  { email: { contains: input.search, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          skills: true,
          githubUrl: true,
          linkedinUrl: true,
          phone: true,
          bio: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Admin: Get pending candidate detail
  getPendingCandidate: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const candidate = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!candidate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidate not found",
        });
      }

      if (candidate.role !== "CANDIDATE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not a candidate",
        });
      }

      return {
        id: candidate.id,
        email: candidate.email,
        name: candidate.name,
        bio: candidate.bio,
        phone: candidate.phone,
        location: candidate.location,
        skills: candidate.skills,
        availability: candidate.availability,
        githubUrl: candidate.githubUrl,
        linkedinUrl: candidate.linkedinUrl,
        resumeUrl: candidate.resumeUrl,
        profilePicture: candidate.profilePicture,
        candidateStatus: candidate.candidateStatus,
        isVerified: candidate.isVerified,
        createdAt: candidate.createdAt,
      };
    }),

  // Admin: Approve a candidate
  approveCandidate: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { role: true, candidateStatus: true },
      });

      if (!user || user.role !== "CANDIDATE") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidate not found" });
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          candidateStatus: "APPROVED",
          rejectionReason: null,
        },
        select: { id: true, name: true, candidateStatus: true },
      });
    }),

  // Admin: Reject a candidate
  rejectCandidate: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { role: true, candidateStatus: true },
      });

      if (!user || user.role !== "CANDIDATE") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Candidate not found" });
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          candidateStatus: "REJECTED",
          rejectionReason: input.reason || null,
        },
        select: { id: true, name: true, candidateStatus: true },
      });
    }),

  // ── Client procedures ──────────────────────────────────────────────

  clientGetCandidate: clientProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const candidate = await ctx.db.user.findUnique({
        where: { id: input.id, role: "CANDIDATE", candidateStatus: "APPROVED" },
        include: {
          submissions: {
            include: {
              assessment: {
                select: { title: true, difficulty: true },
              },
              review: {
                select: { averageScore: true, passed: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!candidate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidate not found",
        });
      }

      return {
        id: candidate.id,
        name: candidate.name,
        profilePicture: candidate.profilePicture,
        bio: candidate.bio,
        skills: candidate.skills,
        location: candidate.location,
        availability: candidate.availability,
        githubUrl: candidate.githubUrl,
        linkedinUrl: candidate.linkedinUrl,
        resumeUrl: candidate.resumeUrl,
        hourlyRate: candidate.hourlyRate,
        monthlyRate: candidate.monthlyRate,
        submissions: candidate.submissions,
      };
    }),

  clientList: clientProcedure
    .input(
      z.object({
        search: z.string().optional(),
        skills: z.array(z.string()).optional(),
        passedOnly: z.boolean().default(false),
        minHourlyRate: z.number().min(0).optional(),
        maxHourlyRate: z.number().min(0).optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, ...filters } = input;

      const candidates = await ctx.db.user.findMany({
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where: {
          role: "CANDIDATE",
          candidateStatus: "APPROVED",
          availability: { in: [Availability.ACTIVELY_LOOKING, Availability.OPEN_TO_OFFERS] },
          ...(filters.search
            ? {
                OR: [
                  { name: { contains: filters.search, mode: "insensitive" as const } },
                  { location: { contains: filters.search, mode: "insensitive" as const } },
                ],
              }
            : {}),
          ...(filters.skills && filters.skills.length > 0
            ? { skills: { hasSome: filters.skills } }
            : {}),
          ...(filters.passedOnly
            ? {
                submissions: {
                  some: {
                    status: SubmissionStatus.PASSED,
                  },
                },
              }
            : {}),
          ...(filters.minHourlyRate !== undefined || filters.maxHourlyRate !== undefined
            ? {
                hourlyRate: {
                  ...(filters.minHourlyRate !== undefined ? { gte: filters.minHourlyRate } : {}),
                  ...(filters.maxHourlyRate !== undefined ? { lte: filters.maxHourlyRate } : {}),
                },
              }
            : {}),
        },
        include: {
          submissions: {
            select: {
              review: {
                select: {
                  averageScore: true,
                  passed: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (candidates.length > limit) {
        const nextItem = candidates.pop()!;
        nextCursor = nextItem.id;
      }

      const items = candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        profilePicture: candidate.profilePicture,
        bio: candidate.bio,
        skills: candidate.skills,
        location: candidate.location,
        availability: candidate.availability,
        githubUrl: candidate.githubUrl,
        linkedinUrl: candidate.linkedinUrl,
        hourlyRate: candidate.hourlyRate,
        monthlyRate: candidate.monthlyRate,
        createdAt: candidate.createdAt,
        submissionCount: candidate.submissions.length,
        passedCount: candidate.submissions.filter((s) => s.review?.passed).length,
        averageScore:
          candidate.submissions.filter((s) => s.review).length > 0
            ? candidate.submissions
                .filter((s) => s.review)
                .reduce((sum, s) => sum + (s.review?.averageScore ?? 0), 0) /
              candidate.submissions.filter((s) => s.review).length
            : null,
      }));

      return { items, nextCursor };
    }),
});
