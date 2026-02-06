import { PrismaClient, Role, Difficulty, Availability, SubmissionStatus, CandidateStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@codeks.hr" },
    update: {},
    create: {
      email: "admin@codeks.hr",
      password: adminPassword,
      name: "Admin User",
      role: Role.ADMIN,
      availability: Availability.NOT_LOOKING,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create sample candidate (approved)
  const candidatePassword = await bcrypt.hash("candidate123", 12);
  const candidate = await prisma.user.upsert({
    where: { email: "candidate@example.com" },
    update: {},
    create: {
      email: "candidate@example.com",
      password: candidatePassword,
      name: "John Doe",
      role: Role.CANDIDATE,
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.ACTIVELY_LOOKING,
      bio: "Full-stack developer passionate about React and Node.js",
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
      githubUrl: "https://github.com/johndoe",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      location: "New York, USA",
    },
  });
  console.log(`✅ Candidate user created: ${candidate.email}`);

  // Create sample pending candidate for testing
  const pendingPassword = await bcrypt.hash("pending123", 12);
  const pendingCandidate = await prisma.user.upsert({
    where: { email: "pending@example.com" },
    update: {},
    create: {
      email: "pending@example.com",
      password: pendingPassword,
      name: "Jane Smith",
      role: Role.CANDIDATE,
      candidateStatus: CandidateStatus.PENDING_REVIEW,
      availability: Availability.OPEN_TO_OFFERS,
      bio: "Backend developer with experience in Python and Go",
      skills: ["Python", "Go", "Docker", "Kubernetes"],
      githubUrl: "https://github.com/janesmith",
      linkedinUrl: "https://linkedin.com/in/janesmith",
      location: "London, UK",
      phone: "+44 7700 900000",
    },
  });
  console.log(`✅ Pending candidate created: ${pendingCandidate.email}`);

  // Create sample assessments
  const assessments = [
    {
      title: "React Todo App",
      slug: "react-todo-app",
      description: "Build a fully functional todo application using React with TypeScript. Implement CRUD operations, local storage persistence, and filtering capabilities.",
      difficulty: Difficulty.INTERN,
      repoUrl: "https://github.com/codeks-hr/react-todo-starter",
      timeLimit: 5,
    },
    {
      title: "REST API with Express",
      slug: "rest-api-express",
      description: "Create a RESTful API for a blog platform using Express.js and TypeScript. Include authentication, input validation, and proper error handling.",
      difficulty: Difficulty.JUNIOR,
      repoUrl: "https://github.com/codeks-hr/express-api-starter",
      timeLimit: 7,
    },
    {
      title: "Full-Stack E-commerce",
      slug: "fullstack-ecommerce",
      description: "Build a complete e-commerce solution with Next.js, including product catalog, cart functionality, checkout flow, and admin dashboard.",
      difficulty: Difficulty.MID,
      repoUrl: "https://github.com/codeks-hr/ecommerce-starter",
      timeLimit: 14,
    },
  ];

  for (const assessment of assessments) {
    const created = await prisma.assessment.upsert({
      where: { slug: assessment.slug },
      update: {},
      create: assessment,
    });
    console.log(`✅ Assessment created: ${created.title}`);
  }

  // Create sample submission for candidate
  const todoAssessment = await prisma.assessment.findUnique({
    where: { slug: "react-todo-app" },
  });

  if (todoAssessment) {
    const submission = await prisma.submission.upsert({
      where: {
        userId_assessmentId: {
          userId: candidate.id,
          assessmentId: todoAssessment.id,
        },
      },
      update: {},
      create: {
        userId: candidate.id,
        assessmentId: todoAssessment.id,
        status: SubmissionStatus.SUBMITTED,
        forkUrl: "https://github.com/johndoe/react-todo-app",
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    });
    console.log(`✅ Sample submission created for ${candidate.email}`);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
