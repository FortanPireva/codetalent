import { initTRPC, TRPCError } from "@trpc/server";
import { type Session, getServerSession } from "next-auth";
import { decode } from "next-auth/jwt";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/server/db";
import { authOptions } from "@/server/auth";
import type { Role, CandidateStatus, ClientOnboardingStatus } from "@codetalent/db";

interface CreateContextOptions {
  session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts?: { headers?: Headers }) => {
  // Try Bearer token first (mobile clients)
  const authHeader = opts?.headers?.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = await decode({
        token,
        secret: process.env.NEXTAUTH_SECRET!,
      });
      if (decoded) {
        const session: Session = {
          user: {
            id: decoded.id as string,
            role: decoded.role as Role,
            candidateStatus: decoded.candidateStatus as CandidateStatus,
            clientStatus: decoded.clientStatus as ClientOnboardingStatus,
            hasActiveSubscription: decoded.hasActiveSubscription as boolean,
            name: decoded.name as string | undefined,
            email: decoded.email as string | undefined,
          },
          expires: new Date(
            (decoded.exp as number) * 1000
          ).toISOString(),
        };
        return createInnerTRPCContext({ session });
      }
    } catch {
      // Invalid token, fall through to cookie auth
    }
  }

  // Fall back to cookie-based session (web clients)
  const session = await getServerSession(authOptions);
  return createInnerTRPCContext({ session });
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

// Client middleware - admins always pass; clients must be APPROVED
const enforceApprovedClient = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role === "ADMIN") {
    return next({
      ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
  }
  if (ctx.session.user.role !== "CLIENT") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Client access required",
    });
  }
  const user = await db.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { clientStatus: true },
  });
  if (!user || user.clientStatus !== "APPROVED") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your company account must be approved to access this resource",
    });
  }
  return next({
    ctx: { session: { ...ctx.session, user: ctx.session.user } },
  });
});

// Client procedure - requires approved client or admin
export const clientProcedure = t.procedure.use(enforceApprovedClient);
