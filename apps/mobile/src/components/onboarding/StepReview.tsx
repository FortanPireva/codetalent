import { View, Text } from "react-native";
import { StepContainer } from "./StepContainer";
import { AVAILABILITY_OPTIONS } from "@/lib/onboarding";
import type { OnboardingFormData } from "@/lib/onboarding";

interface StepReviewProps {
  data: OnboardingFormData;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export function StepReview({ data, onSubmit, onBack, loading }: StepReviewProps) {
  const availabilityLabel =
    AVAILABILITY_OPTIONS.find((o) => o.value === data.availability)?.label ?? data.availability;

  return (
    <StepContainer
      title="Review Your Profile"
      description="Make sure everything looks good before submitting"
      onNext={onSubmit}
      onBack={onBack}
      isLast
      loading={loading}
    >
      <Section title="Personal Info">
        <InfoRow label="Name" value={data.name} />
        <InfoRow label="Phone" value={data.phone} />
        <InfoRow label="Location" value={data.location} />
        {data.profilePicture ? <InfoRow label="Photo" value="Uploaded" /> : null}
      </Section>

      <Section title="Bio">
        <Text className="font-sans text-sm text-muted-foreground leading-5">
          {data.bio}
        </Text>
      </Section>

      <Section title="Links">
        <InfoRow label="GitHub" value={data.githubUrl} />
        {data.linkedinUrl ? <InfoRow label="LinkedIn" value={data.linkedinUrl} /> : null}
      </Section>

      <Section title="Skills">
        <View className="flex-row flex-wrap gap-2">
          {data.skills.map((skill) => (
            <View key={skill} className="rounded-lg bg-surface px-3 py-1.5">
              <Text className="font-medium text-sm text-foreground">{skill}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Availability & Rates">
        <InfoRow label="Status" value={availabilityLabel} />
        {data.hourlyRate ? (
          <InfoRow label="Hourly Rate" value={`${data.rateCurrency} ${data.hourlyRate}`} />
        ) : null}
        {data.monthlyRate ? (
          <InfoRow label="Monthly Rate" value={`${data.rateCurrency} ${data.monthlyRate}`} />
        ) : null}
      </Section>

      {data.resumeUrl ? (
        <Section title="Resume">
          <InfoRow label="Status" value="Uploaded" />
        </Section>
      ) : null}
    </StepContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-4 rounded-xl bg-card border border-border-light p-4">
      <Text className="mb-3 font-bold text-base text-foreground">{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-border-light py-2">
      <Text className="font-sans text-sm text-muted-foreground">{label}</Text>
      <Text className="ml-4 flex-1 text-right font-medium text-sm text-foreground" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
