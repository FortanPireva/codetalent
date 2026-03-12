import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { SubmissionStatus, Difficulty } from "@codetalent/db";
import { sendNotification } from "@/server/services/notifications";

const PASS_THRESHOLDS: Record<Difficulty, number> = {
  INTERN: 3.0,
  JUNIOR: 3.5,
  MID: 4.0,
};

const SCORING_CATEGORIES = [
  "codeQuality",
  "architecture",
  "typeSafety",
  "errorHandling",
  "testing",
  "gitPractices",
  "documentation",
  "bestPractices",
] as const;

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
  url?: string;
}

interface GitHubFile {
  path: string;
  content: string;
}

interface ReviewResult {
  codeQuality: number;
  architecture: number;
  typeSafety: number;
  errorHandling: number;
  testing: number;
  gitPractices: number;
  documentation: number;
  bestPractices: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

async function fetchGitHubRepoFiles(repoUrl: string): Promise<GitHubFile[]> {
  // Extract owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, "");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Codeks-HR",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Get default branch
  const repoResponse = await fetch(
    `https://api.github.com/repos/${owner}/${cleanRepo}`,
    { headers }
  );

  if (!repoResponse.ok) {
    throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`);
  }

  const repoData = await repoResponse.json();
  const defaultBranch = repoData.default_branch || "main";

  // Get tree
  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${defaultBranch}?recursive=1`,
    { headers }
  );

  if (!treeResponse.ok) {
    throw new Error(`Failed to fetch tree: ${treeResponse.statusText}`);
  }

  const treeData = await treeResponse.json();

  // Filter files (exclude node_modules, dist, .git, etc.)
  const excludePatterns = [
    /^node_modules\//,
    /^dist\//,
    /^build\//,
    /^\.git\//,
    /^\.next\//,
    /^coverage\//,
    /\.lock$/,
    /^package-lock\.json$/,
    /^yarn\.lock$/,
    /^pnpm-lock\.yaml$/,
    /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
  ];

  const codeExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".css",
    ".scss",
    ".html",
    ".yml",
    ".yaml",
  ];

  const files: GitHubTreeItem[] = treeData.tree
    .filter((item: GitHubTreeItem) => {
      if (item.type !== "blob") return false;
      if (item.size && item.size > 10 * 1024) return false; // Max 10KB
      if (excludePatterns.some((pattern) => pattern.test(item.path)))
        return false;
      if (!codeExtensions.some((ext) => item.path.endsWith(ext))) return false;
      return true;
    })
    .slice(0, 40); // Max 40 files

  // Fetch file contents
  const fileContents: GitHubFile[] = await Promise.all(
    files.map(async (file) => {
      const contentResponse = await fetch(
        `https://api.github.com/repos/${owner}/${cleanRepo}/contents/${file.path}`,
        { headers }
      );

      if (!contentResponse.ok) {
        return { path: file.path, content: "[Content unavailable]" };
      }

      const contentData = await contentResponse.json();
      const content = Buffer.from(contentData.content, "base64").toString(
        "utf-8"
      );

      return { path: file.path, content };
    })
  );

  return fileContents;
}

function buildReviewPrompt(
  files: GitHubFile[],
  assessment: { title: string; description: string; difficulty: string }
): string {
  const filesSection = files
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");

  return `You are a senior software engineer reviewing a coding assessment submission.

## Assessment Details
- **Title**: ${assessment.title}
- **Description**: ${assessment.description}
- **Difficulty Level**: ${assessment.difficulty}

## Code Files
${filesSection}

## Evaluation Criteria
Score each category from 1-5 (1=poor, 2=below average, 3=average, 4=good, 5=excellent):

1. **codeQuality**: Code readability, naming conventions, formatting
2. **architecture**: Project structure, separation of concerns, modularity
3. **typeSafety**: TypeScript usage, proper typing, avoiding 'any'
4. **errorHandling**: Error handling, edge cases, validation
5. **testing**: Test coverage, test quality (if applicable)
6. **gitPractices**: Commit history, branching (evaluate based on code organization)
7. **documentation**: Comments, README, inline documentation
8. **bestPractices**: Following framework conventions, security, performance

## Response Format
Return ONLY a valid JSON object (no markdown, no explanation outside JSON):
{
  "codeQuality": <number 1-5>,
  "architecture": <number 1-5>,
  "typeSafety": <number 1-5>,
  "errorHandling": <number 1-5>,
  "testing": <number 1-5>,
  "gitPractices": <number 1-5>,
  "documentation": <number 1-5>,
  "bestPractices": <number 1-5>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}`;
}

export const reviewRouter = createTRPCRouter({
  // Admin: Run AI review pipeline
  runReview: adminProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findUnique({
        where: { id: input.submissionId },
        include: {
          assessment: true,
          review: true,
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      if (!submission.forkUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fork URL submitted",
        });
      }

      if (submission.review) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Review already exists for this submission",
        });
      }

      // Update status to UNDER_REVIEW
      await ctx.db.submission.update({
        where: { id: input.submissionId },
        data: { status: SubmissionStatus.UNDER_REVIEW },
      });

      try {
        // Fetch GitHub repo files
        const files = await fetchGitHubRepoFiles(submission.forkUrl);

        if (files.length === 0) {
          throw new Error("No code files found in repository");
        }

        // Build prompt
        const prompt = buildReviewPrompt(files, {
          title: submission.assessment.title,
          description: submission.assessment.description,
          difficulty: submission.assessment.difficulty,
        });

        // Call Claude API
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        // Parse response
        const responseText =
          message.content[0].type === "text" ? message.content[0].text : "";

        // Extract JSON from response (handle potential markdown wrapping)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Failed to parse AI response as JSON");
        }

        const reviewResult: ReviewResult = JSON.parse(jsonMatch[0]);

        // Validate scores
        for (const category of SCORING_CATEGORIES) {
          const score = reviewResult[category];
          if (typeof score !== "number" || score < 1 || score > 5) {
            throw new Error(`Invalid score for ${category}: ${score}`);
          }
        }

        // Calculate average
        const averageScore =
          SCORING_CATEGORIES.reduce(
            (sum, cat) => sum + reviewResult[cat],
            0
          ) / SCORING_CATEGORIES.length;

        // Determine pass/fail based on difficulty threshold
        const threshold = PASS_THRESHOLDS[submission.assessment.difficulty];
        const passed = averageScore >= threshold;

        // Create review record
        const review = await ctx.db.review.create({
          data: {
            submissionId: input.submissionId,
            codeQuality: reviewResult.codeQuality,
            architecture: reviewResult.architecture,
            typeSafety: reviewResult.typeSafety,
            errorHandling: reviewResult.errorHandling,
            testing: reviewResult.testing,
            gitPractices: reviewResult.gitPractices,
            documentation: reviewResult.documentation,
            bestPractices: reviewResult.bestPractices,
            averageScore,
            passed,
            summary: reviewResult.summary,
            strengths: reviewResult.strengths,
            improvements: reviewResult.improvements,
          },
        });

        // Update submission status
        const finalStatus = passed ? SubmissionStatus.PASSED : SubmissionStatus.REJECTED;
        await ctx.db.submission.update({
          where: { id: input.submissionId },
          data: { status: finalStatus },
        });

        // Send assessment result notification (fire-and-forget)
        sendNotification({
          userId: submission.userId,
          type: "ASSESSMENT_RESULT",
          title: "Assessment Review Complete",
          body: `Your ${submission.assessment.title} assessment has been reviewed — ${passed ? "Passed" : "Not passed"}`,
          data: {
            submissionId: input.submissionId,
            assessmentId: submission.assessmentId,
            passed,
            averageScore,
          },
        }).catch((err) => console.error("Failed to send assessment result notification:", err));

        return review;
      } catch (error) {
        // Revert status on error
        await ctx.db.submission.update({
          where: { id: input.submissionId },
          data: { status: SubmissionStatus.SUBMITTED },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to run review",
        });
      }
    }),

  // Protected: Get review by submission (candidates can only see their own)
  getBySubmission: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findUnique({
        where: { id: input.submissionId },
        include: { review: true },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      // Check if user is admin or owns the submission
      if (
        ctx.session.user.role !== "ADMIN" &&
        submission.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own reviews",
        });
      }

      return submission.review;
    }),
});
