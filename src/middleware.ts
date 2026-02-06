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

    // Candidate status-based routing — only APPROVED candidates can access the dashboard
    if (token?.role === "CANDIDATE") {
      const status = token.candidateStatus;
      const isOnboarding = pathname.startsWith("/onboarding");
      const isPending = pathname.startsWith("/pending");
      const isRejected = pathname.startsWith("/rejected");

      if (status === "APPROVED") {
        // Approved candidates should not see onboarding/pending/rejected pages
        if (isOnboarding || isPending || isRejected) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
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
    "/admin/:path*",
    "/onboarding/:path*",
    "/pending/:path*",
    "/rejected/:path*",
  ],
};
