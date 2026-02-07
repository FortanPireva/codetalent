import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes require ADMIN role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Block clients from accessing candidate/admin routes
    if (token?.role === "CLIENT") {
      if (!pathname.startsWith("/client")) {
        return NextResponse.redirect(new URL("/client/dashboard", req.url));
      }

      const clientStatus = token.clientStatus;
      const isClientOnboarding = pathname.startsWith("/client/onboarding");
      const isClientPending = pathname.startsWith("/client/pending");
      const isClientRejected = pathname.startsWith("/client/rejected");

      if (clientStatus === "APPROVED") {
        if (isClientOnboarding || isClientPending || isClientRejected) {
          return NextResponse.redirect(new URL("/client/dashboard", req.url));
        }
      } else if (clientStatus === "PENDING_REVIEW") {
        if (!isClientPending) {
          return NextResponse.redirect(new URL("/client/pending", req.url));
        }
      } else if (clientStatus === "REJECTED") {
        if (!isClientRejected) {
          return NextResponse.redirect(new URL("/client/rejected", req.url));
        }
      } else {
        // ONBOARDING or missing/unknown status
        if (!isClientOnboarding) {
          return NextResponse.redirect(new URL("/client/onboarding", req.url));
        }
      }

      return NextResponse.next();
    }

    // Candidate status-based routing — only APPROVED candidates can access the dashboard
    if (token?.role === "CANDIDATE") {
      const status = token.candidateStatus;
      const isOnboarding = pathname.startsWith("/onboarding");
      const isPending = pathname.startsWith("/pending");
      const isRejected = pathname.startsWith("/rejected");

      if (status === "APPROVED") {
        // Approved candidates should not see onboarding/pending/rejected pages
        if (isOnboarding || isPending || isRejected) {
          return NextResponse.redirect(new URL("/jobs", req.url));
        }
      } else if (status === "PENDING_REVIEW") {
        if (!isPending) {
          return NextResponse.redirect(new URL("/pending", req.url));
        }
      } else if (status === "REJECTED") {
        if (!isRejected) {
          return NextResponse.redirect(new URL("/rejected", req.url));
        }
      } else {
        // ONBOARDING or missing/unknown status — always redirect to onboarding
        if (!isOnboarding) {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/assessments/:path*",
    "/jobs/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/pending/:path*",
    "/rejected/:path*",
    "/client/:path*",
  ],
};
