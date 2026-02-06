import { initTRPC, TRPCError } from "@trpc/server";
import { type Session, getServerSession } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/server/db";
import { authOptions } from "@/server/auth";

interface CreateContextOptions {
  session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions);

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

// Public procedure - no auth required
export const publicProcedure = t.procedure;

// Auth middleware
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Protected procedure - requires valid JWT (any logged-in user)
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Admin middleware
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Admin procedure - requires JWT + role === "ADMIN"
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);

// Approved candidate middleware - admins always pass; candidates must be APPROVED
const enforceApprovedCandidate = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role === "ADMIN") {
    return next({
      ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
  }
  const user = await db.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { candidateStatus: true },
  });
  if (!user || user.candidateStatus !== "APPROVED") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account must be approved to access this resource",
    });
  }
  return next({
    ctx: { session: { ...ctx.session, user: ctx.session.user } },
  });
});

// Approved procedure - requires approved candidate or admin
export const approvedProcedure = t.procedure.use(enforceApprovedCandidate);
