import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  registerPushToken: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        platform: z.enum(["ios", "android"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pushToken.upsert({
        where: { token: input.token },
        create: {
          token: input.token,
          platform: input.platform,
          userId: ctx.session.user.id,
        },
        update: {
          platform: input.platform,
          userId: ctx.session.user.id,
        },
      });
    }),

  removePushToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.pushToken.deleteMany({
        where: {
          token: input.token,
          userId: ctx.session.user.id,
        },
      });
      return { success: true };
    }),

  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    let prefs = await ctx.db.notificationPreference.findUnique({
      where: { userId },
    });
    if (!prefs) {
      prefs = await ctx.db.notificationPreference.create({
        data: { userId },
      });
    }
    return prefs;
  }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        assessmentResults: z.boolean().optional(),
        newJobMatches: z.boolean().optional(),
        applicationUpdates: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notificationPreference.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          ...input,
        },
        update: input,
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.notification.findMany({
        where: { userId: ctx.session.user.id },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { sentAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next!.id;
      }

      return { items, nextCursor };
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.updateMany({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { read: true },
      });
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.notification.updateMany({
      where: { userId: ctx.session.user.id, read: false },
      data: { read: true },
    });
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.count({
      where: { userId: ctx.session.user.id, read: false },
    });
  }),

  toggleVerified: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isVerified: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { isVerified: input.isVerified },
        select: { id: true, isVerified: true },
      });
    }),
});
