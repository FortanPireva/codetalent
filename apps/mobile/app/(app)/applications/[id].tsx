import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  Home,
  FileText,
  AlertCircle,
} from "lucide-react-native";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  applicationStatusLabels,
  applicationStatusDescriptions,
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  formatSalary,
} from "@/lib/constants";

const statusDotColors: Record<string, string> = {
  APPLIED: "#3b82f6",
  INVITED: "#8b5cf6",
  INTERVIEW: "#f59e0b",
  HIRED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useThemeColors();
  const { data: applications, isLoading, refetch, isRefetching } =
    api.application.myApplications.useQuery();

  const utils = api.useUtils();
  const withdrawMutation = api.application.withdraw.useMutation({
    onSuccess: () => {
      utils.application.myApplications.invalidate();
      router.back();
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.bg }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const application = applications?.find((a) => a.id === id);

  if (!application) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: c.bg }}>
        <AlertCircle size={32} strokeWidth={1.5} color={c.mutedFg} />
        <Text className="mt-3 font-bold text-base" style={{ color: c.fg }}>
          Application not found
        </Text>
        <Text className="mt-1 text-center font-sans text-sm" style={{ color: c.mutedFg }}>
          This application may have been removed
        </Text>
      </View>
    );
  }

  const { job } = application;
  const dotColor = statusDotColors[application.status] ?? c.mutedFg;
  const statusLabel = applicationStatusLabels[application.status] ?? application.status;
  const statusDesc = applicationStatusDescriptions[application.status] ?? "";
  const salary =
    job.showSalary && job.salaryMin && job.salaryMax
      ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)
      : null;
  const canWithdraw = application.status === "APPLIED";

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: c.bg }}
      contentContainerClassName="pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View className="items-center px-4 pt-2 pb-4">
        <Text className="text-center font-bold text-2xl" style={{ color: c.fg }}>
          {job.title}
        </Text>
        <Text className="mt-1 font-sans text-base" style={{ color: c.mutedFg }}>
          {job.client.name}
        </Text>
      </View>

      {/* Status Card */}
      <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.borderLight }}>
        <View className="flex-row items-center gap-2">
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: dotColor,
            }}
          />
          <Text className="font-bold text-base" style={{ color: c.fg }}>
            {statusLabel}
          </Text>
        </View>
        {statusDesc ? (
          <Text className="mt-1.5 ml-5 font-sans text-sm" style={{ color: c.mutedFg }}>
            {statusDesc}
          </Text>
        ) : null}
      </View>

      {/* Job Details Card */}
      <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.borderLight }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Job Details
        </Text>

        {job.location && (
          <DetailRow icon={MapPin} label="Location" value={job.location} colors={c} />
        )}
        {job.employmentType && (
          <DetailRow
            icon={Briefcase}
            label="Employment"
            value={employmentTypeLabels[job.employmentType] ?? job.employmentType}
            colors={c}
          />
        )}
        {job.experienceLevel && (
          <DetailRow
            icon={Clock}
            label="Level"
            value={experienceLevelLabels[job.experienceLevel] ?? job.experienceLevel}
            colors={c}
          />
        )}
        {job.workArrangement && (
          <DetailRow
            icon={Home}
            label="Arrangement"
            value={workArrangementLabels[job.workArrangement] ?? job.workArrangement}
            colors={c}
          />
        )}
        {salary && (
          <DetailRow icon={DollarSign} label="Salary" value={salary} colors={c} />
        )}
      </View>

      {/* Timeline Card */}
      <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.borderLight }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Timeline
        </Text>
        <DetailRow
          icon={Calendar}
          label="Applied"
          value={new Date(application.appliedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          colors={c}
        />
        <DetailRow
          icon={Clock}
          label="Last Updated"
          value={new Date(application.updatedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          colors={c}
          isLast
        />
      </View>

      {/* Skills */}
      {job.requiredSkills.length > 0 && (
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.borderLight }}>
          <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
            Required Skills
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {job.requiredSkills.map((skill) => (
              <View key={skill} className="rounded-md px-2.5 py-1.5" style={{ backgroundColor: c.tag }}>
                <Text className="font-medium text-xs" style={{ color: c.tagText }}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Cover Letter */}
      {application.coverLetter && (
        <View className="mx-4 mb-4 rounded-xl p-4" style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.borderLight }}>
          <View className="mb-3 flex-row items-center gap-2">
            <FileText size={16} strokeWidth={1.5} color={c.fg} />
            <Text className="font-bold text-base" style={{ color: c.fg }}>
              Cover Letter
            </Text>
          </View>
          <Text className="font-sans text-sm leading-6" style={{ color: c.mutedFg }}>
            {application.coverLetter}
          </Text>
        </View>
      )}

      {/* View Job button */}
      <View className="mx-4 mb-3">
        <Pressable
          className="items-center rounded-xl py-3.5"
          style={{ backgroundColor: c.primary }}
          onPress={() => router.push(`/(app)/jobs/${application.jobId}`)}
        >
          <Text className="font-bold text-sm" style={{ color: c.primaryFg }}>
            View Full Job Posting
          </Text>
        </Pressable>
      </View>

      {/* Withdraw button */}
      {canWithdraw && (
        <View className="mx-4 mb-4">
          <Pressable
            className="items-center rounded-xl py-3.5"
            style={{ borderWidth: 1, borderColor: c.border }}
            onPress={() => {
              Alert.alert(
                "Withdraw Application",
                "Are you sure you want to withdraw? This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Withdraw",
                    style: "destructive",
                    onPress: () =>
                      withdrawMutation.mutate({ applicationId: application.id }),
                  },
                ],
              );
            }}
            disabled={withdrawMutation.isLoading}
          >
            <Text className="font-medium text-sm" style={{ color: c.destructive }}>
              {withdrawMutation.isLoading ? "Withdrawing..." : "Withdraw Application"}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  colors: c,
  isLast,
}: {
  icon: React.ComponentType<{ size: number; strokeWidth: number; color: string }>;
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
  isLast?: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between py-2.5"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: c.borderLight } : undefined}
    >
      <View className="flex-row items-center gap-2">
        <Icon size={14} strokeWidth={1.5} color={c.placeholder} />
        <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>{label}</Text>
      </View>
      <Text className="font-medium text-sm" style={{ color: c.fg }}>{value}</Text>
    </View>
  );
}
