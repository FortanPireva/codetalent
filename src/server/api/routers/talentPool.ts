import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { Availability, SubmissionStatus } from "@prisma/client";

export const talentPoolRouter = createTRPCRouter({
  // Admin: List filtered candidates (talent pool)
  list: adminProcedure
    .input(
      z.object({
        availability: z.nativeEnum(Availability).optional(),
        skills: z.array(z.string()).optional(),
        search: z.string().optional(),
        passedOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const candidates = await ctx.db.user.findMany({
        where: {
          role: "CANDIDATE",
          availability: input.availability,
          ...(input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { email: { contains: input.search, mode: "insensitive" } },
                  { location: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(input.skills && input.skills.length > 0
            ? { skills: { hasSome: input.skills } }
            : {}),
          ...(input.passedOnly
            ? {
                submissions: {
                  some: {
                    status: SubmissionStatus.PASSED,
                  },
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

      return candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        availability: candidate.availability,
        skills: candidate.skills,
        location: candidate.location,
        githubUrl: candidate.githubUrl,
        linkedinUrl: candidate.linkedinUrl,
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
    ]);

    return {
      totalCandidates,
      activelyLooking,
      openToOffers,
      passedAssessments,
      pendingReviews,
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
        createdAt: candidate.createdAt,
        submissions: candidate.submissions,
      };
    }),
});
