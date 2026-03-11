import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Navbar } from "./_components/landing/navbar";
import { Hero } from "./_components/landing/hero";
import { SocialProofBar } from "./_components/landing/social-proof-bar";
import { ForCompanies } from "./_components/landing/for-companies";
import { ForDevelopers } from "./_components/landing/for-developers";
import { HowItWorks } from "./_components/landing/how-it-works";
import { AiVetting } from "./_components/landing/ai-vetting";
import { WhyThisMarketplace } from "./_components/landing/why-this-marketplace";
import { CtaSection } from "./_components/landing/cta-section";
import { Footer } from "./_components/landing/footer";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }

    if (session.user.role === "CLIENT") {
      switch (session.user.clientStatus) {
        case "APPROVED":
          redirect("/client/dashboard");
        case "PENDING_REVIEW":
          redirect("/client/pending");
        case "REJECTED":
          redirect("/client/rejected");
        default:
          redirect("/client/onboarding");
      }
    }

    // Candidate routing based on onboarding status
    switch (session.user.candidateStatus) {
      case "APPROVED":
        redirect("/jobs");
      case "PENDING_REVIEW":
        redirect("/pending");
      case "REJECTED":
        redirect("/rejected");
      default:
        redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <Hero />
      <SocialProofBar />
      <ForCompanies />
      <ForDevelopers />
      <HowItWorks />
      <AiVetting />
      <WhyThisMarketplace />
      <CtaSection />
      <Footer />
    </div>
  );
}
