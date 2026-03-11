import { View, Text } from "react-native";
import { StepContainer } from "./StepContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import { AVAILABILITY_OPTIONS } from "@/lib/onboarding";
import type { OnboardingFormData } from "@/lib/onboarding";

interface StepReviewProps {
  data: OnboardingFormData;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export function StepReview({ data, onSubmit, onBack, loading }: StepReviewProps) {
  const c = useThemeColors();
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
      <Section title="Personal Info" colors={c}>
        <InfoRow label="Name" value={data.name} colors={c} />
        <InfoRow label="Phone" value={data.phone} colors={c} />
        <InfoRow label="Location" value={data.location} colors={c} />
        {data.profilePicture ? <InfoRow label="Photo" value="Uploaded" colors={c} /> : null}
      </Section>

      <Section title="Bio" colors={c}>
        <Text className="font-sans text-sm leading-5" style={{ color: c.mutedFg }}>
          {data.bio}
        </Text>
      </Section>

      <Section title="Links" colors={c}>
        <InfoRow label="GitHub" value={data.githubUrl} colors={c} />
        {data.linkedinUrl ? <InfoRow label="LinkedIn" value={data.linkedinUrl} colors={c} /> : null}
      </Section>

      <Section title="Skills" colors={c}>
        <View className="flex-row flex-wrap gap-2">
          {data.skills.map((skill) => (
            <View key={skill} className="rounded-lg px-3 py-1.5" style={{ backgroundColor: c.surface }}>
              <Text className="font-medium text-sm" style={{ color: c.fg }}>{skill}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Availability & Rates" colors={c}>
        <InfoRow label="Status" value={availabilityLabel} colors={c} />
        {data.hourlyRate ? (
          <InfoRow label="Hourly Rate" value={`${data.rateCurrency} ${data.hourlyRate}`} colors={c} />
        ) : null}
        {data.monthlyRate ? (
          <InfoRow label="Monthly Rate" value={`${data.rateCurrency} ${data.monthlyRate}`} colors={c} />
        ) : null}
      </Section>

      {data.resumeUrl ? (
        <Section title="Resume" colors={c}>
          <InfoRow label="Status" value="Uploaded" colors={c} />
        </Section>
      ) : null}
    </StepContainer>
  );
}

function Section({
  title,
  children,
  colors: c,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      className="mb-4 rounded-xl p-4"
      style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.borderLight }}
    >
      <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  colors: c,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      className="flex-row justify-between py-2"
      style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight }}
    >
      <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>{label}</Text>
      <Text className="ml-4 flex-1 text-right font-medium text-sm" style={{ color: c.fg }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
