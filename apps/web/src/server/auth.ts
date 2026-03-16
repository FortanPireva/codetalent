import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { Role, CandidateStatus, ClientOnboardingStatus } from "@codetalent/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      candidateStatus: CandidateStatus;
      clientStatus: ClientOnboardingStatus;
      hasActiveSubscription: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    candidateStatus: CandidateStatus;
    clientStatus: ClientOnboardingStatus;
    hasActiveSubscription: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    candidateStatus: CandidateStatus;
    clientStatus: ClientOnboardingStatus;
    hasActiveSubscription: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error("This account uses social login. Please sign in with Google or Apple.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Check subscription status for CLIENT users
        let hasActiveSubscription = false;
        if (user.role === "CLIENT") {
          const client = await db.client.findUnique({
            where: { userId: user.id },
            include: { subscription: true },
          });
          if (client?.subscription) {
            hasActiveSubscription =
              client.subscription.status === "ACTIVE" &&
              client.subscription.currentPeriodEnd > new Date();
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateStatus: user.candidateStatus,
          clientStatus: user.clientStatus,
          hasActiveSubscription,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        // Find or create user, link googleId
        let dbUser = await db.user.findUnique({ where: { email } });

        if (dbUser) {
          // Link Google account if not already linked
          if (!dbUser.googleId && account.providerAccountId) {
            await db.user.update({
              where: { id: dbUser.id },
              data: { googleId: account.providerAccountId },
            });
          }
        } else {
          // Create new user
          dbUser = await db.user.create({
            data: {
              email,
              name: user.name ?? email.split("@")[0],
              googleId: account.providerAccountId,
              role: "CANDIDATE",
              candidateStatus: "ONBOARDING",
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // After Google sign-in, load user from DB
      if (account?.provider === "google") {
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
          include: { client: { include: { subscription: true } } },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.candidateStatus = dbUser.candidateStatus;
          token.clientStatus = dbUser.clientStatus;
          token.hasActiveSubscription = dbUser.client?.subscription
            ? dbUser.client.subscription.status === "ACTIVE" &&
              dbUser.client.subscription.currentPeriodEnd > new Date()
            : false;
        }
      } else if (user) {
        token.id = user.id;
        token.role = user.role;
        token.candidateStatus = user.candidateStatus;
        token.clientStatus = user.clientStatus;
        token.hasActiveSubscription = user.hasActiveSubscription;
      }

      // Refresh from DB on explicit update OR for CLIENT users who don't have a subscription yet
      const shouldRefresh =
        trigger === "update" ||
        (token.role === "CLIENT" && !token.hasActiveSubscription);

      if (shouldRefresh) {
        const freshUser = await db.user.findUnique({
          where: { id: token.id },
          select: {
            candidateStatus: true,
            clientStatus: true,
            client: {
              include: { subscription: true },
            },
          },
        });
        if (freshUser) {
          token.candidateStatus = freshUser.candidateStatus;
          token.clientStatus = freshUser.clientStatus;
          if (freshUser.client?.subscription) {
            token.hasActiveSubscription =
              freshUser.client.subscription.status === "ACTIVE" &&
              freshUser.client.subscription.currentPeriodEnd > new Date();
          } else {
            token.hasActiveSubscription = false;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.candidateStatus = token.candidateStatus;
        session.user.clientStatus = token.clientStatus;
        session.user.hasActiveSubscription = token.hasActiveSubscription;
      }
      return session;
    },
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const auth = () => getServerSession(authOptions);
