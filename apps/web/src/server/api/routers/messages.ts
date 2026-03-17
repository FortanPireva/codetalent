import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { connectMongo } from "@/server/mongodb";
import { Thread, Message } from "@/server/mongodb/models";
import type { IThread, IMessage } from "@/server/mongodb/models";
import type { Session } from "next-auth";
import type { PrismaClient } from "@codetalent/db";
import mongoose, { type Types } from "mongoose";

// ── Helpers ──────────────────────────────────────────────────────────

async function resolveClientId(db: PrismaClient, userId: string): Promise<string | null> {
  const client = await db.client.findFirst({
    where: { userId },
    select: { id: true },
  });
  return client?.id ?? null;
}

async function assertThreadAccess(
  thread: IThread,
  session: Session,
  db: PrismaClient,
): Promise<"CANDIDATE" | "CLIENT"> {
  if (session.user.role === "CANDIDATE" && thread.candidateId === session.user.id) {
    return "CANDIDATE";
  }
  if (session.user.role === "CLIENT") {
    const clientId = await resolveClientId(db, session.user.id);
    if (clientId && thread.clientId === clientId) return "CLIENT";
  }
  throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant of this thread" });
}

function serializeMessage(msg: IMessage & { _id: Types.ObjectId }) {
  return {
    id: msg._id.toString(),
    threadId: msg.threadId.toString(),
    senderId: msg.senderId,
    senderRole: msg.senderRole,
    body: msg.body,
    readAt: msg.readAt,
    sentAt: msg.sentAt,
  };
}

// ── Router ───────────────────────────────────────────────────────────

export const messagesRouter = createTRPCRouter({
  getOrCreateThread: protectedProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await connectMongo();

      const application = await ctx.db.jobApplication.findUnique({
        where: { id: input.applicationId },
        select: {
          id: true,
          userId: true,
          job: { select: { clientId: true } },
        },
      });
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      const candidateId = application.userId;
      const clientId = application.job.clientId;

      // Verify caller is a participant
      const userId = ctx.session.user.id;
      const role = ctx.session.user.role;
      if (role === "CANDIDATE" && candidateId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (role === "CLIENT") {
        const resolvedClientId = await resolveClientId(ctx.db, userId);
        if (resolvedClientId !== clientId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      const thread = await Thread.findOneAndUpdate(
        { applicationId: input.applicationId, candidateId, clientId },
        { $setOnInsert: { applicationId: input.applicationId, candidateId, clientId } },
        { upsert: true, new: true },
      );

      return {
        threadId: thread._id.toString(),
        applicationId: thread.applicationId,
        candidateId: thread.candidateId,
        clientId: thread.clientId,
        lastMessage: thread.lastMessage,
        unreadCount: thread.unreadCount,
        createdAt: thread.createdAt,
      };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        body: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await connectMongo();

      const thread = await Thread.findById(input.threadId);
      if (!thread) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      const senderRole = await assertThreadAccess(thread, ctx.session, ctx.db);

      // Check if either party has blocked the other
      const otherUserId = senderRole === "CANDIDATE"
        ? await (async () => {
            const client = await ctx.db.client.findFirst({
              where: { id: thread.clientId },
              select: { userId: true },
            });
            return client?.userId;
          })()
        : thread.candidateId;

      if (otherUserId) {
        const block = await ctx.db.blockedUser.findFirst({
          where: {
            OR: [
              { userId: ctx.session.user.id, blockedUserId: otherUserId },
              { userId: otherUserId, blockedUserId: ctx.session.user.id },
            ],
          },
        });
        if (block) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot send messages to this user",
          });
        }
      }

      const now = new Date();

      const message = await Message.create({
        threadId: thread._id,
        senderId: ctx.session.user.id,
        senderRole,
        body: input.body,
        sentAt: now,
      });

      // Update thread's lastMessage and increment unread for the other party
      const unreadField =
        senderRole === "CANDIDATE" ? "unreadCount.client" : "unreadCount.candidate";
      await Thread.findByIdAndUpdate(thread._id, {
        $set: {
          lastMessage: {
            body: input.body,
            senderId: ctx.session.user.id,
            senderRole,
            sentAt: now,
          },
        },
        $inc: { [unreadField]: 1 },
      });

      return serializeMessage(message as IMessage & { _id: Types.ObjectId });
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      await connectMongo();

      const thread = await Thread.findById(input.threadId);
      if (!thread) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }
      await assertThreadAccess(thread, ctx.session, ctx.db);

      const filter: Record<string, unknown> = {
        threadId: new mongoose.Types.ObjectId(input.threadId),
      };
      if (input.cursor) {
        filter._id = { $lt: new mongoose.Types.ObjectId(input.cursor) };
      }

      const messages = await Message.find(filter)
        .sort({ sentAt: -1, _id: -1 })
        .limit(input.limit + 1)
        .lean();

      const hasMore = messages.length > input.limit;
      if (hasMore) messages.pop();

      return {
        messages: messages.map((m) =>
          serializeMessage(m as IMessage & { _id: Types.ObjectId }),
        ),
        nextCursor: hasMore
          ? (messages[messages.length - 1]!._id as Types.ObjectId).toString()
          : null,
      };
    }),

  markRead: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await connectMongo();

      const thread = await Thread.findById(input.threadId);
      if (!thread) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }
      const callerRole = await assertThreadAccess(thread, ctx.session, ctx.db);

      // Mark all unread messages from the other party as read
      const otherRole = callerRole === "CANDIDATE" ? "CLIENT" : "CANDIDATE";
      await Message.updateMany(
        { threadId: thread._id, senderRole: otherRole, readAt: null },
        { $set: { readAt: new Date() } },
      );

      // Reset caller's unread count
      const unreadField =
        callerRole === "CANDIDATE" ? "unreadCount.candidate" : "unreadCount.client";
      await Thread.findByIdAndUpdate(thread._id, { $set: { [unreadField]: 0 } });

      return { success: true };
    }),

  getThreadDetail: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      await connectMongo();

      const thread = await Thread.findById(input.threadId).lean();
      if (!thread) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
      }

      await assertThreadAccess(
        thread as IThread,
        ctx.session,
        ctx.db,
      );

      // Fetch candidate info
      const candidate = await ctx.db.user.findUnique({
        where: { id: thread.candidateId },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          location: true,
          skills: true,
          availability: true,
          linkedinUrl: true,
          githubUrl: true,
          bio: true,
        },
      });

      // Fetch job + application info via applicationId
      const application = thread.applicationId
        ? await ctx.db.jobApplication.findUnique({
            where: { id: thread.applicationId },
            select: {
              id: true,
              status: true,
              appliedAt: true,
              job: {
                select: {
                  id: true,
                  title: true,
                  location: true,
                  employmentType: true,
                  workArrangement: true,
                  experienceLevel: true,
                  status: true,
                },
              },
            },
          })
        : null;

      // Resolve other party's userId for report/block
      let otherPartyUserId: string | null = null;
      if (ctx.session.user.role === "CANDIDATE") {
        const client = await ctx.db.client.findFirst({
          where: { id: thread.clientId },
          select: { userId: true },
        });
        otherPartyUserId = client?.userId ?? null;
      } else {
        otherPartyUserId = thread.candidateId;
      }

      return {
        threadId: (thread._id as Types.ObjectId).toString(),
        candidate,
        application,
        otherPartyUserId,
      };
    }),

  listThreads: protectedProcedure.query(async ({ ctx }) => {
    await connectMongo();

    const userId = ctx.session.user.id;
    const role = ctx.session.user.role;

    let filter: Record<string, string>;
    if (role === "CANDIDATE") {
      filter = { candidateId: userId };
    } else if (role === "CLIENT") {
      const clientId = await resolveClientId(ctx.db, userId);
      if (!clientId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }
      filter = { clientId };
    } else {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const allThreads = await Thread.find(filter).sort({ updatedAt: -1 }).lean();

    // Filter out threads where the other participant is blocked
    const blockedRecords = await ctx.db.blockedUser.findMany({
      where: { userId },
      select: { blockedUserId: true },
    });
    const blockedSet = new Set(blockedRecords.map((b) => b.blockedUserId));

    // Also need to resolve client userIds for blocking check
    const clientIdsForBlock = [...new Set(allThreads.map((t) => t.clientId))];
    const clientsForBlock = await ctx.db.client.findMany({
      where: { id: { in: clientIdsForBlock } },
      select: { id: true, userId: true },
    });
    const clientUserIdMap = new Map(
      clientsForBlock.filter((c) => c.userId).map((c) => [c.id, c.userId!]),
    );

    const threads = allThreads.filter((t) => {
      const otherUserId =
        role === "CANDIDATE"
          ? clientUserIdMap.get(t.clientId)
          : t.candidateId;
      return !otherUserId || !blockedSet.has(otherUserId);
    });

    // Enrich with participant names from PostgreSQL
    const candidateIds = [...new Set(threads.map((t) => t.candidateId))];
    const clientIds = [...new Set(threads.map((t) => t.clientId))];

    const [candidates, clients] = await Promise.all([
      ctx.db.user.findMany({
        where: { id: { in: candidateIds } },
        select: { id: true, name: true, profilePicture: true },
      }),
      ctx.db.client.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, name: true, logo: true },
      }),
    ]);

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));
    const clientMap = new Map(clients.map((c) => [c.id, c]));

    return threads.map((thread) => ({
      threadId: (thread._id as Types.ObjectId).toString(),
      applicationId: thread.applicationId,
      candidate: candidateMap.get(thread.candidateId) ?? null,
      client: clientMap.get(thread.clientId) ?? null,
      lastMessage: thread.lastMessage,
      unreadCount:
        role === "CANDIDATE" ? thread.unreadCount.candidate : thread.unreadCount.client,
      updatedAt: thread.updatedAt,
    }));
  }),
});
