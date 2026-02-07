import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { CompanySize, ClientStatus } from "@prisma/client";

export const clientRouter = createTRPCRouter({
  // Admin: List clients with filters
  list: adminProcedure
    .input(
      z.object({
        status: z.nativeEnum(ClientStatus).optional(),
        size: z.nativeEnum(CompanySize).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.client.findMany({
        where: {
          status: input.status,
          size: input.size,
          ...(input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { contactName: { contains: input.search, mode: "insensitive" } },
                  { contactEmail: { contains: input.search, mode: "insensitive" } },
                  { industry: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, clientStatus: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Admin: Get client by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.client.findUnique({
        where: { id: input.id },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return client;
    }),

  // Admin: Create client
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
        description: z.string().min(10),
        industry: z.string().min(2),
        size: z.nativeEnum(CompanySize),
        location: z.string().min(2),
        contactName: z.string().min(2),
        contactEmail: z.string().email(),
        website: z.string().url().or(z.literal("")).optional(),
        logo: z.string().url().or(z.literal("")).optional(),
        techStack: z.array(z.string()).default([]),
        status: z.nativeEnum(ClientStatus).default("LEAD"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.client.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Client with this slug already exists",
        });
      }

      return ctx.db.client.create({
        data: {
          ...input,
          website: input.website || null,
          logo: input.logo || null,
        },
      });
    }),

  // Admin: Update client
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().min(10).optional(),
        industry: z.string().min(2).optional(),
        size: z.nativeEnum(CompanySize).optional(),
        location: z.string().min(2).optional(),
        contactName: z.string().min(2).optional(),
        contactEmail: z.string().email().optional(),
        website: z.string().url().or(z.literal("")).optional(),
        logo: z.string().url().or(z.literal("")).optional(),
        techStack: z.array(z.string()).optional(),
        status: z.nativeEnum(ClientStatus).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.db.client.update({
        where: { id },
        data: {
          ...data,
          website: data.website === "" ? null : data.website,
          logo: data.logo === "" ? null : data.logo,
        },
      });
    }),

  // Admin: Delete client
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.client.delete({
        where: { id: input.id },
      });
    }),

  // Admin: Client stats
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalClients, activeClients, leads] = await Promise.all([
      ctx.db.client.count(),
      ctx.db.client.count({ where: { status: "ACTIVE" } }),
      ctx.db.client.count({ where: { status: "LEAD" } }),
    ]);

    return { totalClients, activeClients, leads };
  }),

  // Admin: Count pending client verifications
  pendingClientCount: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.count({
      where: { role: "CLIENT", clientStatus: "PENDING_REVIEW" },
    });
  }),

  // Admin: List pending client verifications
  listPendingClientVerification: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.client.findMany({
        where: {
          user: {
            clientStatus: "PENDING_REVIEW",
            ...(input.search
              ? {
                  OR: [
                    { name: { contains: input.search, mode: "insensitive" } },
                    { email: { contains: input.search, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          ...(input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { contactName: { contains: input.search, mode: "insensitive" } },
                  { contactEmail: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, clientStatus: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Admin: Approve client
  approveClient: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { role: true, clientStatus: true, client: true },
      });

      if (!user || user.role !== "CLIENT") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client user not found" });
      }

      if (user.clientStatus !== "PENDING_REVIEW") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is not pending review" });
      }

      const [updatedUser] = await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: input.userId },
          data: { clientStatus: "APPROVED" },
          select: { id: true, name: true, clientStatus: true },
        }),
        ...(user.client
          ? [
              ctx.db.client.update({
                where: { id: user.client.id },
                data: { status: "ACTIVE" },
              }),
            ]
          : []),
      ]);

      return updatedUser;
    }),

  // Admin: Reject client
  rejectClient: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { role: true, clientStatus: true },
      });

      if (!user || user.role !== "CLIENT") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client user not found" });
      }

      if (user.clientStatus !== "PENDING_REVIEW") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is not pending review" });
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          clientStatus: "REJECTED",
          clientRejectionReason: input.reason || null,
        },
        select: { id: true, name: true, clientStatus: true },
      });
    }),
});
