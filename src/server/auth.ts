import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { Role, CandidateStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      candidateStatus: CandidateStatus;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    candidateStatus: CandidateStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    candidateStatus: CandidateStatus;
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

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateStatus: user.candidateStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.candidateStatus = user.candidateStatus;
      }
      if (trigger === "update") {
        const freshUser = await db.user.findUnique({
          where: { id: token.id },
          select: { candidateStatus: true },
        });
        if (freshUser) {
          token.candidateStatus = freshUser.candidateStatus;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.candidateStatus = token.candidateStatus;
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
