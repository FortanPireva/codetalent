import { NextResponse } from "next/server";
import { findNewJobMatches } from "@/server/services/jobMatcher";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await findNewJobMatches();
    return NextResponse.json({
      ok: true,
      matchesFound: result.matchesFound,
      notificationsSent: result.notificationsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job-matches error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
