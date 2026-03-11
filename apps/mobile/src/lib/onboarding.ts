export interface OnboardingFormData {
  name: string;
  bio: string;
  phone: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  profilePicture: string;
  skills: string[];
  availability: string;
  hourlyRate: string;
  monthlyRate: string;
  rateCurrency: string;
}

export const initialFormData: OnboardingFormData = {
  name: "",
  bio: "",
  phone: "",
  location: "",
  githubUrl: "",
  linkedinUrl: "",
  resumeUrl: "",
  profilePicture: "",
  skills: [],
  availability: "ACTIVELY_LOOKING",
  hourlyRate: "",
  monthlyRate: "",
  rateCurrency: "USD",
};

export const STEPS = [
  {
    title: "Upload Resume",
    description: "Upload your resume to auto-fill your profile (optional)",
  },
  {
    title: "Personal Info",
    description: "Tell us about yourself",
  },
  {
    title: "Professional Links",
    description: "Connect your online profiles",
  },
  {
    title: "Skills",
    description: "What technologies do you work with?",
  },
  {
    title: "Availability & Rates",
    description: "Let employers know your availability",
  },
  {
    title: "Upload Resume",
    description: "Upload your resume (required)",
  },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "ACTIVELY_LOOKING", label: "Actively Looking" },
  { value: "OPEN_TO_OFFERS", label: "Open to Offers" },
  { value: "NOT_LOOKING", label: "Not Looking" },
  { value: "HIRED", label: "Hired" },
] as const;

export const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CHF", "CAD", "AUD"] as const;

export function validateStep(step: number, data: OnboardingFormData): string | null {
  switch (step) {
    case 0:
      return null; // Resume upload is optional at step 0
    case 1:
      if (!data.name || data.name.length < 2) return "Name must be at least 2 characters";
      if (!data.bio || data.bio.length < 10) return "Bio must be at least 10 characters";
      if (!data.phone) return "Phone is required";
      if (!data.location) return "Location is required";
      return null;
    case 2:
      if (!data.githubUrl) return "GitHub URL is required";
      try {
        new URL(data.githubUrl);
      } catch {
        return "GitHub URL must be a valid URL";
      }
      if (data.linkedinUrl) {
        try {
          new URL(data.linkedinUrl);
        } catch {
          return "LinkedIn URL must be a valid URL";
        }
      }
      return null;
    case 3:
      if (data.skills.length === 0) return "At least one skill is required";
      return null;
    case 4:
      if (!data.availability) return "Please select your availability";
      return null;
    case 5:
      return null; // Resume validation handled by orchestrator
    default:
      return null;
  }
}
