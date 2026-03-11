import { PrismaClient, Role, Difficulty, Availability, SubmissionStatus, CandidateStatus, ClientOnboardingStatus, CompanySize, ClientStatus } from "@prisma/client";
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

  // Create sample client user (approved)
  const clientPassword = await bcrypt.hash("client123", 12);
  const clientUser = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      password: clientPassword,
      name: "Sarah Client",
      role: Role.CLIENT,
      clientStatus: ClientOnboardingStatus.APPROVED,
      phone: "+1 555 123 4567",
    },
  });
  console.log(`✅ Client user created: ${clientUser.email}`);

  // Create linked Client record for client user
  await prisma.client.upsert({
    where: { slug: "client-user-company" },
    update: {},
    create: {
      name: "Client User Company",
      slug: "client-user-company",
      description: "A self-registered company for testing the client onboarding flow.",
      industry: "Technology",
      size: CompanySize.SMB,
      location: "Berlin, Germany",
      techStack: ["TypeScript", "React", "Node.js"],
      contactName: "Sarah Client",
      contactEmail: "client@example.com",
      status: ClientStatus.ACTIVE,
      userId: clientUser.id,
    },
  });
  console.log(`✅ Linked client record created for ${clientUser.email}`);

  // Create sample clients
  const clients = [
    {
      name: "TechCorp Solutions",
      slug: "techcorp-solutions",
      description: "Enterprise software solutions for Fortune 500 companies, specializing in cloud infrastructure and digital transformation.",
      industry: "Technology",
      size: CompanySize.ENTERPRISE,
      location: "San Francisco, CA",
      techStack: ["React", "Node.js", "AWS", "Kubernetes", "PostgreSQL"],
      contactName: "Sarah Johnson",
      contactEmail: "sarah@techcorp.com",
      website: "https://techcorp.com",
      status: ClientStatus.ACTIVE,
      notes: "Long-term partner, hiring 10+ engineers per quarter.",
    },
    {
      name: "StartupHub AI",
      slug: "startuphub-ai",
      description: "AI-powered analytics platform for early-stage startups, providing growth insights and market intelligence.",
      industry: "Artificial Intelligence",
      size: CompanySize.STARTUP,
      location: "Austin, TX",
      techStack: ["Python", "TensorFlow", "React", "FastAPI"],
      contactName: "Mike Chen",
      contactEmail: "mike@startuphub.ai",
      website: "https://startuphub.ai",
      status: ClientStatus.ACTIVE,
      notes: "Fast-growing, needs senior ML engineers.",
    },
    {
      name: "FinanceFlow",
      slug: "financeflow",
      description: "Modern fintech platform providing payment processing and financial management tools for small businesses.",
      industry: "Fintech",
      size: CompanySize.SMB,
      location: "New York, NY",
      techStack: ["TypeScript", "Next.js", "Go", "PostgreSQL", "Redis"],
      contactName: "Emma Davis",
      contactEmail: "emma@financeflow.io",
      website: "https://financeflow.io",
      status: ClientStatus.ACTIVE,
    },
    {
      name: "GreenTech Industries",
      slug: "greentech-industries",
      description: "Sustainable energy solutions and IoT monitoring systems for smart buildings and renewable energy infrastructure.",
      industry: "Clean Energy",
      size: CompanySize.SMB,
      location: "Denver, CO",
      techStack: ["Python", "React", "MQTT", "TimescaleDB"],
      contactName: "James Wilson",
      contactEmail: "james@greentech.com",
      status: ClientStatus.LEAD,
      notes: "Initial meeting scheduled for next week.",
    },
    {
      name: "MediaWorks Digital",
      slug: "mediaworks-digital",
      description: "Digital media agency specializing in content management systems and streaming platform development.",
      industry: "Media & Entertainment",
      size: CompanySize.STARTUP,
      location: "Los Angeles, CA",
      techStack: ["Vue.js", "Node.js", "MongoDB", "FFmpeg"],
      contactName: "Lisa Park",
      contactEmail: "lisa@mediaworks.digital",
      website: "https://mediaworks.digital",
      status: ClientStatus.CHURNED,
      notes: "Paused hiring due to budget cuts. May re-engage Q3.",
    },
  ];

  for (const client of clients) {
    const created = await prisma.client.upsert({
      where: { slug: client.slug },
      update: {},
      create: client,
    });
    console.log(`✅ Client created: ${created.name}`);
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
