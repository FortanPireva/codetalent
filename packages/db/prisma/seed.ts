import "dotenv/config";
import {
  PrismaClient,
  Role,
  Difficulty,
  Availability,
  SubmissionStatus,
  CandidateStatus,
  ClientOnboardingStatus,
  CompanySize,
  ClientStatus,
  SubscriptionTier,
  SubscriptionStatus,
  BillingInterval,
  JobStatus,
  ExperienceLevel,
  EmploymentType,
  WorkArrangement,
  JobUrgency,
  ApplicationStatus,
} from "@prisma/client";
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

  // ──────────────────────────────────────────────
  // Additional candidates with varied profiles
  // ──────────────────────────────────────────────
  const sharedPassword = await bcrypt.hash("password123", 12);

  const candidateProfiles = [
    {
      email: "alice.react@example.com",
      name: "Alice Martinez",
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.ACTIVELY_LOOKING,
      bio: "Senior React developer with 6 years of experience building scalable SPAs and design systems.",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Storybook"],
      githubUrl: "https://github.com/alicemartinez",
      location: "Barcelona, Spain",
      hourlyRate: 75,
      monthlyRate: 12000,
    },
    {
      email: "bob.backend@example.com",
      name: "Bob Nakamura",
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.OPEN_TO_OFFERS,
      bio: "Backend engineer specialized in distributed systems and event-driven architectures.",
      skills: ["Go", "Kafka", "PostgreSQL", "gRPC", "Docker", "Kubernetes"],
      githubUrl: "https://github.com/bobnakamura",
      location: "Tokyo, Japan",
      hourlyRate: 90,
      monthlyRate: 14400,
    },
    {
      email: "carla.fullstack@example.com",
      name: "Carla Silva",
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.ACTIVELY_LOOKING,
      bio: "Full-stack developer with a passion for fintech. Built payment systems handling $2B+ annually.",
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis", "Stripe API"],
      githubUrl: "https://github.com/carlasilva",
      linkedinUrl: "https://linkedin.com/in/carlasilva",
      location: "São Paulo, Brazil",
      hourlyRate: 65,
      monthlyRate: 10400,
    },
    {
      email: "david.devops@example.com",
      name: "David Okonkwo",
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.OPEN_TO_OFFERS,
      bio: "DevOps/SRE with deep AWS expertise. Reduced infrastructure costs by 40% at previous role.",
      skills: ["AWS", "Terraform", "Kubernetes", "Python", "Prometheus", "Grafana"],
      githubUrl: "https://github.com/davidokonkwo",
      location: "Lagos, Nigeria",
      hourlyRate: 70,
      monthlyRate: 11200,
    },
    {
      email: "elena.ml@example.com",
      name: "Elena Petrova",
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.ACTIVELY_LOOKING,
      bio: "ML engineer focused on NLP and recommendation systems. Published 3 papers at NeurIPS.",
      skills: ["Python", "PyTorch", "TensorFlow", "MLflow", "FastAPI", "SQL"],
      githubUrl: "https://github.com/elenapetrova",
      location: "Berlin, Germany",
      hourlyRate: 95,
      monthlyRate: 15200,
    },
    {
      email: "frank.mobile@example.com",
      name: "Frank Dubois",
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.NOT_LOOKING,
      bio: "Mobile developer with 5 years of React Native and iOS experience. 4 apps with 1M+ downloads.",
      skills: ["React Native", "Swift", "TypeScript", "Firebase", "Expo"],
      githubUrl: "https://github.com/frankdubois",
      location: "Paris, France",
      hourlyRate: 80,
      monthlyRate: 12800,
    },
    {
      email: "grace.junior@example.com",
      name: "Grace Kim",
      candidateStatus: CandidateStatus.APPROVED,
      availability: Availability.ACTIVELY_LOOKING,
      bio: "Recent CS graduate eager to grow as a frontend developer. Strong foundation in web fundamentals.",
      skills: ["JavaScript", "React", "CSS", "HTML", "Git"],
      githubUrl: "https://github.com/gracekim",
      location: "Seoul, South Korea",
      hourlyRate: 35,
      monthlyRate: 5600,
    },
    {
      email: "hassan.security@example.com",
      name: "Hassan Al-Rashid",
      candidateStatus: CandidateStatus.PENDING_REVIEW,
      availability: Availability.ACTIVELY_LOOKING,
      bio: "Security engineer with OSCP certification. Specializes in application security and penetration testing.",
      skills: ["Python", "Rust", "Security Auditing", "OWASP", "Burp Suite", "Linux"],
      githubUrl: "https://github.com/hassanalrashid",
      location: "Dubai, UAE",
      hourlyRate: 100,
      monthlyRate: 16000,
    },
    {
      email: "irene.data@example.com",
      name: "Irene Johansson",
      candidateStatus: CandidateStatus.PENDING_REVIEW,
      availability: Availability.OPEN_TO_OFFERS,
      bio: "Data engineer experienced with building ETL pipelines and real-time data platforms.",
      skills: ["Python", "Spark", "Airflow", "dbt", "Snowflake", "SQL"],
      location: "Stockholm, Sweden",
      hourlyRate: 85,
      monthlyRate: 13600,
    },
    {
      email: "james.onboarding@example.com",
      name: "James Taylor",
      candidateStatus: CandidateStatus.ONBOARDING,
      availability: Availability.ACTIVELY_LOOKING,
      bio: "Full-stack developer looking for new opportunities.",
      skills: ["JavaScript", "Python"],
      location: "Chicago, USA",
    },
  ];

  const createdCandidates: Array<{ id: string; email: string }> = [
    { id: candidate.id, email: candidate.email },
  ];

  for (const profile of candidateProfiles) {
    const created = await prisma.user.upsert({
      where: { email: profile.email },
      update: {},
      create: {
        ...profile,
        password: sharedPassword,
        role: Role.CANDIDATE,
        rateCurrency: "USD",
      },
    });
    if (profile.candidateStatus === CandidateStatus.APPROVED) {
      createdCandidates.push({ id: created.id, email: created.email });
    }
    console.log(`✅ Candidate created: ${created.email} (${profile.candidateStatus})`);
  }

  // ──────────────────────────────────────────────
  // Subscriptions for active clients
  // ──────────────────────────────────────────────
  const activeClients = await prisma.client.findMany({
    where: { status: ClientStatus.ACTIVE },
  });

  const tierConfig: Record<string, { tier: SubscriptionTier; interval: BillingInterval; limit: number }> = {
    "techcorp-solutions": { tier: SubscriptionTier.SCALE, interval: BillingInterval.YEARLY, limit: 25 },
    "startuphub-ai": { tier: SubscriptionTier.GROWTH, interval: BillingInterval.MONTHLY, limit: 10 },
    "financeflow": { tier: SubscriptionTier.STARTER, interval: BillingInterval.MONTHLY, limit: 3 },
    "client-user-company": { tier: SubscriptionTier.STARTER, interval: BillingInterval.MONTHLY, limit: 3 },
  };

  const now = new Date();
  for (const client of activeClients) {
    const config = tierConfig[client.slug] ?? {
      tier: SubscriptionTier.STARTER,
      interval: BillingInterval.MONTHLY,
      limit: 3,
    };
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd =
      config.interval === BillingInterval.YEARLY
        ? new Date(now.getFullYear() + 1, now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await prisma.clientSubscription.upsert({
      where: { clientId: client.id },
      update: {},
      create: {
        clientId: client.id,
        tier: config.tier,
        billingInterval: config.interval,
        status: SubscriptionStatus.ACTIVE,
        activeJobPostLimit: config.limit,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });
    console.log(`✅ Subscription created: ${client.name} (${config.tier})`);
  }

  // ──────────────────────────────────────────────
  // Jobs posted by clients
  // ──────────────────────────────────────────────
  const techcorp = activeClients.find((c) => c.slug === "techcorp-solutions");
  const startuphub = activeClients.find((c) => c.slug === "startuphub-ai");
  const financeflow = activeClients.find((c) => c.slug === "financeflow");

  const jobsData = [
    {
      title: "Senior Frontend Engineer",
      slug: "techcorp-senior-frontend",
      clientId: techcorp!.id,
      status: JobStatus.OPEN,
      summary: "Lead our design system and frontend architecture using React and TypeScript.",
      description: "We are looking for a Senior Frontend Engineer to join our platform team. You will lead the development of our component library, improve performance, and mentor junior developers.",
      responsibilities: "- Own the frontend architecture and design system\n- Mentor junior developers through code reviews\n- Collaborate with product and design teams\n- Drive performance optimization initiatives",
      requirements: "- 5+ years of React/TypeScript experience\n- Experience with design systems (Storybook, Figma tokens)\n- Strong understanding of web performance\n- Excellent communication skills",
      experienceLevel: ExperienceLevel.SENIOR,
      yearsMin: 5,
      yearsMax: 8,
      requiredSkills: ["React", "TypeScript", "CSS"],
      preferredSkills: ["Next.js", "Storybook", "GraphQL"],
      techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.HYBRID,
      location: "San Francisco, CA",
      showSalary: true,
      salaryMin: 160000,
      salaryMax: 200000,
      benefits: ["Health Insurance", "401k Match", "Remote Fridays", "Learning Budget"],
      urgency: JobUrgency.HIGH,
      headcount: 2,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ["frontend", "react", "senior", "design-system"],
      featured: true,
    },
    {
      title: "Backend Engineer (Go)",
      slug: "techcorp-backend-go",
      clientId: techcorp!.id,
      status: JobStatus.OPEN,
      summary: "Build high-performance microservices in Go for our cloud platform.",
      description: "Join our backend team to design and build microservices that power our enterprise cloud platform. You will work on event-driven systems handling millions of requests per day.",
      requirements: "- 3+ years of Go experience\n- Experience with distributed systems\n- Familiarity with Kafka or similar messaging systems\n- PostgreSQL proficiency",
      experienceLevel: ExperienceLevel.MID,
      yearsMin: 3,
      yearsMax: 6,
      requiredSkills: ["Go", "PostgreSQL", "Docker"],
      preferredSkills: ["Kafka", "gRPC", "Kubernetes"],
      techStack: ["Go", "PostgreSQL", "Kafka", "Kubernetes"],
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.REMOTE_GLOBAL,
      showSalary: true,
      salaryMin: 130000,
      salaryMax: 170000,
      benefits: ["Health Insurance", "401k Match", "Home Office Stipend"],
      urgency: JobUrgency.MEDIUM,
      headcount: 3,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      tags: ["backend", "go", "microservices", "distributed-systems"],
    },
    {
      title: "DevOps / Platform Engineer",
      slug: "techcorp-devops",
      clientId: techcorp!.id,
      status: JobStatus.OPEN,
      summary: "Scale and maintain our Kubernetes-based infrastructure on AWS.",
      description: "We need a DevOps engineer to help us scale our infrastructure. You will manage our Kubernetes clusters, CI/CD pipelines, and monitoring stack.",
      requirements: "- 4+ years of DevOps/SRE experience\n- Strong Kubernetes and AWS knowledge\n- Terraform expertise\n- Experience with monitoring (Prometheus, Grafana)",
      experienceLevel: ExperienceLevel.SENIOR,
      yearsMin: 4,
      yearsMax: 8,
      requiredSkills: ["AWS", "Kubernetes", "Terraform"],
      preferredSkills: ["Prometheus", "Grafana", "ArgoCD"],
      techStack: ["AWS", "Kubernetes", "Terraform", "Prometheus"],
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.REMOTE_LOCAL,
      location: "United States",
      showSalary: true,
      salaryMin: 150000,
      salaryMax: 190000,
      urgency: JobUrgency.HIGH,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ["devops", "kubernetes", "aws", "infrastructure"],
    },
    {
      title: "ML Engineer – NLP",
      slug: "startuphub-ml-engineer",
      clientId: startuphub!.id,
      status: JobStatus.OPEN,
      summary: "Build and deploy NLP models powering our analytics engine.",
      description: "We are building an AI-powered analytics platform and need an ML engineer to develop, fine-tune, and deploy NLP models for text analysis and insight generation.",
      requirements: "- 3+ years ML/NLP experience\n- Strong Python and PyTorch/TensorFlow\n- Experience deploying models to production\n- Published research is a plus",
      experienceLevel: ExperienceLevel.MID,
      yearsMin: 3,
      yearsMax: 7,
      requiredSkills: ["Python", "PyTorch", "NLP"],
      preferredSkills: ["TensorFlow", "MLflow", "Hugging Face"],
      techStack: ["Python", "PyTorch", "FastAPI", "Docker"],
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.HYBRID,
      location: "Austin, TX",
      showSalary: true,
      salaryMin: 140000,
      salaryMax: 180000,
      urgency: JobUrgency.CRITICAL,
      headcount: 1,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ["ml", "nlp", "python", "ai"],
      featured: true,
    },
    {
      title: "Full-Stack Developer (React + FastAPI)",
      slug: "startuphub-fullstack",
      clientId: startuphub!.id,
      status: JobStatus.OPEN,
      summary: "Build features across our React frontend and FastAPI backend.",
      description: "We are a small, fast-moving team and need a versatile full-stack developer. You will ship features end-to-end across our dashboard and API.",
      requirements: "- 2+ years React experience\n- Python/FastAPI proficiency\n- Comfortable with SQL databases\n- Startup mindset – ship fast, iterate",
      experienceLevel: ExperienceLevel.JUNIOR,
      yearsMin: 2,
      yearsMax: 4,
      requiredSkills: ["React", "Python", "SQL"],
      preferredSkills: ["FastAPI", "TypeScript", "Docker"],
      techStack: ["React", "Python", "FastAPI", "PostgreSQL"],
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.REMOTE_GLOBAL,
      showSalary: true,
      salaryMin: 90000,
      salaryMax: 120000,
      equity: true,
      equityRange: "0.1% - 0.25%",
      urgency: JobUrgency.MEDIUM,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      tags: ["fullstack", "react", "python", "startup"],
    },
    {
      title: "Senior Full-Stack Engineer (Next.js + Go)",
      slug: "financeflow-senior-fullstack",
      clientId: financeflow!.id,
      status: JobStatus.OPEN,
      summary: "Build payment infrastructure and merchant dashboards.",
      description: "Join our engineering team to build the next generation of payment tools. You will work across our Next.js merchant dashboard and Go microservices.",
      requirements: "- 5+ years full-stack experience\n- TypeScript and Go proficiency\n- Experience with payment systems or fintech\n- Understanding of PCI compliance",
      experienceLevel: ExperienceLevel.SENIOR,
      yearsMin: 5,
      yearsMax: 10,
      requiredSkills: ["TypeScript", "Go", "PostgreSQL"],
      preferredSkills: ["Next.js", "Redis", "Stripe"],
      techStack: ["Next.js", "Go", "PostgreSQL", "Redis"],
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.HYBRID,
      location: "New York, NY",
      showSalary: true,
      salaryMin: 170000,
      salaryMax: 210000,
      benefits: ["Health Insurance", "Unlimited PTO", "401k Match", "Equity"],
      equity: true,
      equityRange: "0.05% - 0.15%",
      urgency: JobUrgency.HIGH,
      headcount: 1,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ["fintech", "fullstack", "go", "nextjs"],
      featured: true,
    },
    {
      title: "Junior Frontend Developer",
      slug: "financeflow-junior-frontend",
      clientId: financeflow!.id,
      status: JobStatus.OPEN,
      summary: "Help build beautiful merchant-facing dashboards.",
      description: "We are looking for a motivated junior developer to join our frontend team. You will work on our merchant dashboard and learn from senior engineers.",
      requirements: "- 1+ year of React experience\n- Basic TypeScript knowledge\n- Eagerness to learn and grow\n- Portfolio or side projects welcome",
      experienceLevel: ExperienceLevel.JUNIOR,
      yearsMin: 1,
      yearsMax: 2,
      requiredSkills: ["React", "JavaScript", "CSS"],
      preferredSkills: ["TypeScript", "Tailwind CSS"],
      techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      employmentType: EmploymentType.FULL_TIME,
      workArrangement: WorkArrangement.ONSITE,
      location: "New York, NY",
      showSalary: true,
      salaryMin: 70000,
      salaryMax: 90000,
      urgency: JobUrgency.LOW,
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      tags: ["frontend", "junior", "react"],
    },
    {
      title: "Contract React Native Developer",
      slug: "financeflow-react-native-contract",
      clientId: financeflow!.id,
      status: JobStatus.PAUSED,
      summary: "Build our mobile banking app (paused – resuming Q2).",
      description: "We are planning a mobile app for small business owners. This contract role will lead the React Native development from scratch.",
      requirements: "- 3+ years React Native experience\n- Published apps on App Store / Play Store\n- Experience with financial/banking apps preferred",
      experienceLevel: ExperienceLevel.MID,
      yearsMin: 3,
      yearsMax: 5,
      requiredSkills: ["React Native", "TypeScript"],
      preferredSkills: ["Expo", "Firebase"],
      techStack: ["React Native", "TypeScript", "Expo"],
      employmentType: EmploymentType.CONTRACT,
      workArrangement: WorkArrangement.REMOTE_GLOBAL,
      showSalary: true,
      salaryMin: 80,
      salaryMax: 110,
      salaryCurrency: "USD",
      salaryPeriod: "HOURLY",
      urgency: JobUrgency.LOW,
      tags: ["mobile", "react-native", "contract"],
    },
    {
      title: "Intern – Software Engineering",
      slug: "techcorp-intern-swe",
      clientId: techcorp!.id,
      status: JobStatus.DRAFT,
      summary: "Summer internship for CS students (posting Q2).",
      description: "Join TechCorp for a 12-week summer internship. You will work on real projects alongside senior engineers.",
      requirements: "- Currently pursuing CS or related degree\n- Familiarity with at least one programming language\n- Strong problem-solving skills",
      experienceLevel: ExperienceLevel.INTERN,
      yearsMin: 0,
      yearsMax: 1,
      requiredSkills: ["JavaScript", "Git"],
      techStack: ["React", "TypeScript", "Node.js"],
      employmentType: EmploymentType.INTERNSHIP,
      workArrangement: WorkArrangement.ONSITE,
      location: "San Francisco, CA",
      showSalary: true,
      salaryMin: 50000,
      salaryMax: 60000,
      urgency: JobUrgency.LOW,
      tags: ["intern", "entry-level"],
    },
  ];

  for (const job of jobsData) {
    const created = await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: job,
    });
    console.log(`✅ Job created: ${created.title} (${created.status})`);
  }

  // ──────────────────────────────────────────────
  // Job applications from candidates
  // ──────────────────────────────────────────────
  const openJobs = await prisma.job.findMany({ where: { status: JobStatus.OPEN } });

  const applicationData: Array<{
    candidateEmail: string;
    jobSlug: string;
    status: ApplicationStatus;
    coverLetter?: string;
    daysAgo: number;
  }> = [
    {
      candidateEmail: "alice.react@example.com",
      jobSlug: "techcorp-senior-frontend",
      status: ApplicationStatus.INTERVIEW,
      coverLetter: "I have 6 years of React experience and have built multiple design systems from scratch. I would love to bring my expertise to TechCorp's platform team.",
      daysAgo: 4,
    },
    {
      candidateEmail: "alice.react@example.com",
      jobSlug: "financeflow-senior-fullstack",
      status: ApplicationStatus.APPLIED,
      daysAgo: 1,
    },
    {
      candidateEmail: "bob.backend@example.com",
      jobSlug: "techcorp-backend-go",
      status: ApplicationStatus.INTERVIEW,
      coverLetter: "As a Go specialist with distributed systems experience, I am excited about the opportunity to work on TechCorp's microservices architecture.",
      daysAgo: 8,
    },
    {
      candidateEmail: "carla.fullstack@example.com",
      jobSlug: "financeflow-senior-fullstack",
      status: ApplicationStatus.INTERVIEW,
      coverLetter: "My experience building payment systems handling $2B+ annually makes me a strong fit for FinanceFlow's engineering team.",
      daysAgo: 1,
    },
    {
      candidateEmail: "carla.fullstack@example.com",
      jobSlug: "startuphub-fullstack",
      status: ApplicationStatus.APPLIED,
      daysAgo: 10,
    },
    {
      candidateEmail: "david.devops@example.com",
      jobSlug: "techcorp-devops",
      status: ApplicationStatus.APPLIED,
      coverLetter: "I have deep AWS and Kubernetes experience and have reduced infrastructure costs by 40% at my previous company.",
      daysAgo: 2,
    },
    {
      candidateEmail: "elena.ml@example.com",
      jobSlug: "startuphub-ml-engineer",
      status: ApplicationStatus.INTERVIEW,
      coverLetter: "With 3 NeurIPS publications and production ML deployment experience, I am eager to build StartupHub's NLP engine.",
      daysAgo: 6,
    },
    {
      candidateEmail: "grace.junior@example.com",
      jobSlug: "financeflow-junior-frontend",
      status: ApplicationStatus.APPLIED,
      coverLetter: "I am a recent CS graduate with a strong foundation in React and web fundamentals. I am eager to grow as a developer at FinanceFlow.",
      daysAgo: 15,
    },
    {
      candidateEmail: "candidate@example.com",
      jobSlug: "techcorp-senior-frontend",
      status: ApplicationStatus.REJECTED,
      daysAgo: 4,
    },
    {
      candidateEmail: "candidate@example.com",
      jobSlug: "startuphub-fullstack",
      status: ApplicationStatus.HIRED,
      coverLetter: "I bring full-stack experience with React and Node.js and am excited to join a fast-moving startup.",
      daysAgo: 30,
    },
    {
      candidateEmail: "frank.mobile@example.com",
      jobSlug: "financeflow-senior-fullstack",
      status: ApplicationStatus.APPLIED,
      daysAgo: 1,
    },
    {
      candidateEmail: "bob.backend@example.com",
      jobSlug: "techcorp-devops",
      status: ApplicationStatus.APPLIED,
      daysAgo: 3,
    },
  ];

  for (const app of applicationData) {
    const user = await prisma.user.findUnique({ where: { email: app.candidateEmail } });
    const job = openJobs.find((j) => j.slug === app.jobSlug);
    if (!user || !job) continue;

    await prisma.jobApplication.upsert({
      where: { userId_jobId: { userId: user.id, jobId: job.id } },
      update: {},
      create: {
        userId: user.id,
        jobId: job.id,
        status: app.status,
        coverLetter: app.coverLetter ?? null,
        appliedAt: new Date(Date.now() - app.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✅ Application: ${app.candidateEmail} → ${app.jobSlug} (${app.status})`);
  }

  // Update application counts on jobs
  for (const job of openJobs) {
    const count = await prisma.jobApplication.count({ where: { jobId: job.id } });
    await prisma.job.update({ where: { id: job.id }, data: { applicationCount: count } });
  }
  console.log("✅ Job application counts updated");

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
