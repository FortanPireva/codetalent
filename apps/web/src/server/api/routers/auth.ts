import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { Availability } from "@codetalent/db";
import { sendPasswordResetEmail } from "@/server/email";

export const authRouter = createTRPCRouter({
  // Mobile login - returns JWT for Bearer auth
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Check subscription status for CLIENT users
      let hasActiveSubscription = false;
      if (user.role === "CLIENT") {
        const client = await ctx.db.client.findUnique({
          where: { userId: user.id },
          include: { subscription: true },
        });
        if (client?.subscription) {
          hasActiveSubscription =
            client.subscription.status === "ACTIVE" &&
            client.subscription.currentPeriodEnd > new Date();
        }
      }

      const token = await encode({
        token: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateStatus: user.candidateStatus,
          clientStatus: user.clientStatus,
          hasActiveSubscription,
        },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateStatus: user.candidateStatus,
          clientStatus: user.clientStatus,
          hasActiveSubscription,
        },
      };
    }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(2, "Name must be at least 2 characters"),
        role: z.enum(["CANDIDATE", "CLIENT"]).default("CANDIDATE"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          candidateStatus: true,
          clientStatus: true,
        },
      });

      const token = await encode({
        token: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateStatus: user.candidateStatus,
          clientStatus: user.clientStatus,
          hasActiveSubscription: false,
        },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 30 * 24 * 60 * 60,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateStatus: user.candidateStatus,
          clientStatus: user.clientStatus,
          hasActiveSubscription: false,
        },
      };
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      // Always return success to prevent user enumeration
      if (!user) {
        return { message: "If an account exists, a reset email has been sent." };
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      await sendPasswordResetEmail(user.email, rawToken);

      return { message: "If an account exists, a reset email has been sent." };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hashedToken = crypto
        .createHash("sha256")
        .update(input.token)
        .digest("hex");

      const user = await ctx.db.user.findFirst({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset link",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });

      return { message: "Password reset successfully" };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        availability: true,
        bio: true,
        skills: true,
        githubUrl: true,
        linkedinUrl: true,
        resumeUrl: true,
        profilePicture: true,
        phone: true,
        location: true,
        hourlyRate: true,
        monthlyRate: true,
        rateCurrency: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const passedAssessmentCount = await ctx.db.submission.count({
      where: {
        userId: ctx.session.user.id,
        status: "PASSED",
      },
    });

    return { ...user, passedAssessmentCount };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        bio: z.string().max(500).optional(),
        skills: z.array(z.string()).optional(),
        githubUrl: z.string().url().optional().or(z.literal("")),
        linkedinUrl: z.string().url().optional().or(z.literal("")),
        resumeUrl: z.string().url().optional().or(z.literal("")),
        profilePicture: z.string().url().optional().or(z.literal("")),
        phone: z.string().optional(),
        location: z.string().optional(),
        availability: z.nativeEnum(Availability).optional(),
        hourlyRate: z.number().min(0).max(10000).optional().nullable(),
        monthlyRate: z.number().min(0).max(10000).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...input,
          githubUrl: input.githubUrl || null,
          linkedinUrl: input.linkedinUrl || null,
          resumeUrl: input.resumeUrl || null,
          profilePicture: input.profilePicture || null,
          ...(input.hourlyRate !== undefined ? { hourlyRate: input.hourlyRate } : {}),
          ...(input.monthlyRate !== undefined ? { monthlyRate: input.monthlyRate } : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          availability: true,
          bio: true,
          skills: true,
          githubUrl: true,
          linkedinUrl: true,
          resumeUrl: true,
          profilePicture: true,
          phone: true,
          location: true,
          hourlyRate: true,
          monthlyRate: true,
          rateCurrency: true,
        },
      });

      return user;
    }),

  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});
