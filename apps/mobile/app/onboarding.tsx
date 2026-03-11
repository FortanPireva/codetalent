import { useState, useCallback } from "react";
import { View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import {
  type OnboardingFormData,
  initialFormData,
  STEPS,
  validateStep,
} from "@/lib/onboarding";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Step0Resume } from "@/components/onboarding/Step0Resume";
import { Step1PersonalInfo } from "@/components/onboarding/Step1PersonalInfo";
import { Step2ProfessionalLinks } from "@/components/onboarding/Step2ProfessionalLinks";
import { Step3Skills } from "@/components/onboarding/Step3Skills";
import { Step4Availability } from "@/components/onboarding/Step4Availability";
import { Step5Resume } from "@/components/onboarding/Step5Resume";
import { StepReview } from "@/components/onboarding/StepReview";

// Steps: 0=Resume(opt), 1=PersonalInfo, 2=Links, 3=Skills, 4=Availability, 5=Resume(if skipped), review
const REVIEW_STEP = 6;

export default function OnboardingScreen() {
  const { logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const submitMutation = api.onboarding.submit.useMutation();

  const updateFormData = useCallback((updates: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  function getVisibleSteps(): number[] {
    // If resume was uploaded in step 0, skip step 5
    const steps = [0, 1, 2, 3, 4];
    if (!formData.resumeUrl) {
      steps.push(5);
    }
    return steps;
  }

  function goNext() {
    const error = validateStep(currentStep, formData);
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    const visibleSteps = getVisibleSteps();
    const currentIndex = visibleSteps.indexOf(currentStep);

    if (currentIndex === visibleSteps.length - 1) {
      // Last visible step -> go to review
      setCurrentStep(REVIEW_STEP);
    } else {
      setCurrentStep(visibleSteps[currentIndex + 1]!);
    }
  }

  function goBack() {
    if (currentStep === REVIEW_STEP) {
      const visibleSteps = getVisibleSteps();
      setCurrentStep(visibleSteps[visibleSteps.length - 1]!);
      return;
    }

    const visibleSteps = getVisibleSteps();
    const currentIndex = visibleSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(visibleSteps[currentIndex - 1]!);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl || "",
        resumeUrl: formData.resumeUrl || "",
        profilePicture: formData.profilePicture || "",
        skills: formData.skills,
        availability: formData.availability as "ACTIVELY_LOOKING" | "OPEN_TO_OFFERS" | "NOT_LOOKING" | "HIRED",
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : undefined,
        rateCurrency: formData.rateCurrency || undefined,
      });

      // Update stored user to reflect new status
      const storedUser = await SecureStore.getItemAsync("auth_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.candidateStatus = "PENDING_REVIEW";
        await SecureStore.setItemAsync("auth_user", JSON.stringify(user));
      }

      router.replace("/pending");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit profile";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  }

  const visibleSteps = getVisibleSteps();
  const totalVisibleSteps = visibleSteps.length + 1; // +1 for review
  const currentVisibleIndex =
    currentStep === REVIEW_STEP
      ? visibleSteps.length
      : visibleSteps.indexOf(currentStep);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StepIndicator
        currentStep={currentVisibleIndex}
        totalSteps={totalVisibleSteps}
      />

      {currentStep === 0 && (
        <Step0Resume data={formData} onUpdate={updateFormData} onNext={goNext} />
      )}
      {currentStep === 1 && (
        <Step1PersonalInfo
          data={formData}
          onUpdate={updateFormData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentStep === 2 && (
        <Step2ProfessionalLinks
          data={formData}
          onUpdate={updateFormData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentStep === 3 && (
        <Step3Skills
          data={formData}
          onUpdate={updateFormData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentStep === 4 && (
        <Step4Availability
          data={formData}
          onUpdate={updateFormData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentStep === 5 && (
        <Step5Resume
          data={formData}
          onUpdate={updateFormData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {currentStep === REVIEW_STEP && (
        <StepReview
          data={formData}
          onSubmit={handleSubmit}
          onBack={goBack}
          loading={submitting}
        />
      )}
    </SafeAreaView>
  );
}
