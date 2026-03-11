import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Availability } from "@codetalent/db";

export const onboardingRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        candidateStatus: true,
        rejectionReason: true,
        name: true,
        bio: true,
        phone: true,
        location: true,
        githubUrl: true,
        linkedinUrl: true,
        resumeUrl: true,
        profilePicture: true,
        skills: true,
        availability: true,
        hourlyRate: true,
        monthlyRate: true,
        rateCurrency: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  submit: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        bio: z.string().min(10, "Bio must be at least 10 characters").max(500),
        phone: z.string().min(1, "Phone is required"),
        location: z.string().min(1, "Location is required"),
        githubUrl: z.string().url("Must be a valid URL"),
        linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        profilePicture: z.string().url().optional().or(z.literal("")),
        skills: z.array(z.string()).min(1, "At least one skill is required"),
        availability: z.nativeEnum(Availability),
        hourlyRate: z.number().positive().optional(),
        monthlyRate: z.number().positive().optional(),
        rateCurrency: z.string().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { candidateStatus: true, role: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.candidateStatus !== "ONBOARDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Onboarding has already been completed",
        });
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          bio: input.bio,
          phone: input.phone,
          location: input.location,
          githubUrl: input.githubUrl,
          linkedinUrl: input.linkedinUrl || null,
          resumeUrl: input.resumeUrl || null,
          profilePicture: input.profilePicture || null,
          skills: input.skills,
          availability: input.availability,
          hourlyRate: input.hourlyRate ?? null,
          monthlyRate: input.monthlyRate ?? null,
          rateCurrency: input.rateCurrency ?? "USD",
          candidateStatus: "PENDING_REVIEW",
        },
        select: {
          id: true,
          candidateStatus: true,
        },
      });
    }),
});
