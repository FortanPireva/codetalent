import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { Availability } from "@prisma/client";

export const authRouter = createTRPCRouter({
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
        },
      });

      return user;
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
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
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
        },
      });

      return user;
    }),

  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});
