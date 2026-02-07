import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { CompanySize } from "@prisma/client";

export const clientOnboardingRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        clientStatus: true,
        clientRejectionReason: true,
        name: true,
        phone: true,
        client: true,
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
        phone: z.string().min(1, "Phone is required"),
        companyName: z.string().min(2, "Company name is required"),
        website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        industry: z.string().min(2, "Industry is required"),
        size: z.nativeEnum(CompanySize),
        location: z.string().min(2, "Location is required"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        techStack: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { clientStatus: true, role: true, email: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.role !== "CLIENT") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only client accounts can complete client onboarding",
        });
      }

      if (user.clientStatus !== "ONBOARDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Client onboarding has already been completed",
        });
      }

      // Generate slug from company name
      let slug = input.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Check for slug collision and add suffix if needed
      const existing = await ctx.db.client.findUnique({
        where: { slug },
      });
      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      // Transaction: update user + create client
      const result = await ctx.db.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: ctx.session.user.id },
          data: {
            name: input.name,
            phone: input.phone,
            clientStatus: "PENDING_REVIEW",
          },
          select: { id: true, clientStatus: true },
        });

        await tx.client.create({
          data: {
            name: input.companyName,
            slug,
            website: input.website || null,
            industry: input.industry,
            size: input.size,
            location: input.location,
            description: input.description,
            techStack: input.techStack,
            contactName: input.name,
            contactEmail: user.email,
            userId: ctx.session.user.id,
          },
        });

        return updatedUser;
      });

      return result;
    }),
});
