import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { ReportReason, ReportContentType } from "@codetalent/db";
import { sendReportNotificationEmail } from "@/server/email";

export const moderationRouter = createTRPCRouter({
  reportUser: protectedProcedure
    .input(
      z.object({
        reportedUserId: z.string(),
        reason: z.nativeEnum(ReportReason),
        description: z.string().max(1000).optional(),
        contentType: z.nativeEnum(ReportContentType),
        contentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reporterId = ctx.session.user.id;

      if (reporterId === input.reportedUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot report yourself",
        });
      }

      const report = await ctx.db.report.create({
        data: {
          reporterId,
          reportedUserId: input.reportedUserId,
          reason: input.reason,
          description: input.description,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      });

      // Send notification email to admin (best-effort)
      try {
        const [reporter, reported] = await Promise.all([
          ctx.db.user.findUnique({ where: { id: reporterId }, select: { name: true, email: true } }),
          ctx.db.user.findUnique({ where: { id: input.reportedUserId }, select: { name: true, email: true } }),
        ]);
        await sendReportNotificationEmail(
          reporter?.name ?? reporter?.email ?? "Unknown",
          reported?.name ?? reported?.email ?? "Unknown",
          input.reason,
          input.description,
        );
      } catch {
        // Don't fail the report if email fails
      }

      return { id: report.id };
    }),

  blockUser: protectedProcedure
    .input(z.object({ blockedUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (userId === input.blockedUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot block yourself",
        });
      }

      await ctx.db.blockedUser.upsert({
        where: {
          userId_blockedUserId: {
            userId,
            blockedUserId: input.blockedUserId,
          },
        },
        create: {
          userId,
          blockedUserId: input.blockedUserId,
        },
        update: {},
      });

      return { success: true };
    }),

  unblockUser: protectedProcedure
    .input(z.object({ blockedUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.blockedUser.deleteMany({
        where: {
          userId: ctx.session.user.id,
          blockedUserId: input.blockedUserId,
        },
      });

      return { success: true };
    }),

  getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    const blocks = await ctx.db.blockedUser.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        blockedUser: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return blocks.map((b) => ({
      id: b.blockedUser.id,
      name: b.blockedUser.name,
      profilePicture: b.blockedUser.profilePicture,
      blockedAt: b.createdAt,
    }));
  }),
});
