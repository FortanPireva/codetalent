import { db } from "@/server/db";
import { sendBulkNotifications } from "./notifications";

export async function findNewJobMatches() {
  const now = new Date();
  const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Query OPEN jobs published in last 25 hours
  const recentJobs = await db.job.findMany({
    where: {
      status: "OPEN",
      publishedAt: { gte: twentyFiveHoursAgo },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      requiredSkills: true,
      preferredSkills: true,
      publishedAt: true,
      client: { select: { name: true } },
    },
  });

  if (recentJobs.length === 0) {
    return { matchesFound: 0, notificationsSent: 0 };
  }

  // 2. Query APPROVED candidates with non-empty skills
  const candidates = await db.user.findMany({
    where: {
      role: "CANDIDATE",
      candidateStatus: "APPROVED",
      skills: { isEmpty: false },
    },
    select: {
      id: true,
      skills: true,
      isVerified: true,
    },
  });

  if (candidates.length === 0) {
    return { matchesFound: 0, notificationsSent: 0 };
  }

  // 3. Get existing match logs to deduplicate
  const jobIds = recentJobs.map((j) => j.id);
  const candidateIds = candidates.map((c) => c.id);

  const existingMatches = await db.jobMatchLog.findMany({
    where: {
      jobId: { in: jobIds },
      userId: { in: candidateIds },
    },
    select: { userId: true, jobId: true },
  });

  const matchedSet = new Set(
    existingMatches.map((m) => `${m.userId}:${m.jobId}`)
  );

  // 4. Match candidates to jobs
  const newMatches: { userId: string; jobId: string; jobTitle: string; companyName: string }[] = [];

  for (const job of recentJobs) {
    const jobSkills = [...job.requiredSkills, ...job.preferredSkills].map((s) =>
      s.toLowerCase()
    );

    if (jobSkills.length === 0) continue;

    // Verified early access: jobs < 24h old only go to verified users
    const isEarlyAccess = job.publishedAt! > twentyFourHoursAgo;

    for (const candidate of candidates) {
      if (matchedSet.has(`${candidate.id}:${job.id}`)) continue;

      // Early access gate
      if (isEarlyAccess && !candidate.isVerified) continue;

      // Check skill overlap
      const candidateSkills = candidate.skills.map((s) => s.toLowerCase());
      const hasOverlap = candidateSkills.some((s) => jobSkills.includes(s));

      if (hasOverlap) {
        newMatches.push({
          userId: candidate.id,
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.client.name,
        });
        matchedSet.add(`${candidate.id}:${job.id}`);
      }
    }
  }

  if (newMatches.length === 0) {
    return { matchesFound: 0, notificationsSent: 0 };
  }

  // 5. Create JobMatchLog entries
  await db.jobMatchLog.createMany({
    data: newMatches.map((m) => ({
      userId: m.userId,
      jobId: m.jobId,
    })),
    skipDuplicates: true,
  });

  // 6. Send notifications
  const result = await sendBulkNotifications(
    newMatches.map((m) => ({
      userId: m.userId,
      type: "JOB_MATCH" as const,
      title: "New Job Match",
      body: `${m.jobTitle} at ${m.companyName} matches your skills`,
      data: { jobId: m.jobId },
    }))
  );

  return {
    matchesFound: newMatches.length,
    notificationsSent: result.pushed,
  };
}
