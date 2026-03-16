import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, Stack, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { api } from "@/lib/trpc";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  formatSalary,
  formatRelativeDate,
} from "@/lib/constants";
import { InfoPill } from "@/components/jobs/InfoPill";
import { InterviewTimeline } from "@/components/jobs/InterviewTimeline";
import { JobDetailSkeleton } from "@/components/jobs/JobDetailSkeleton";
import { CompanyAvatar } from "@/components/jobs/JobCard";
import {
  Bell,
  Bookmark,
  FileText,
  CheckSquare,
  ClipboardList,
  Star,
  Wrench,
  DollarSign,
  TrendingUp,
  Target,
  Mic,
  Building2,
  Factory,
  Users,
  Info,
  Briefcase,
  Home,
  Stamp,
  Plane,
  Clock,
  Search,
} from "lucide-react-native";

function SectionHeader({ icon: Icon, title, color }: { icon?: React.ComponentType<{ size: number; strokeWidth: number; color: string }>; title: string; color: string }) {
  return (
    <View className="mb-3 flex-row items-center">
      {Icon && (
        <View className="mr-2">
          <Icon size={18} strokeWidth={1.5} color={color} />
        </View>
      )}
      <Text className="font-bold text-lg" style={{ color }}>{title}</Text>
    </View>
  );
}

function BulletList({ items, color }: { items: string; color: string }) {
  const lines = items
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <View>
      {lines.map((line, i) => (
        <View key={i} className="mb-1.5 flex-row">
          <Text className="mr-2 text-sm" style={{ color }}>•</Text>
          <Text className="flex-1 font-sans text-sm leading-5" style={{ color }}>
            {line.replace(/^[-•]\s*/, "")}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SkillPills({
  label,
  skills,
  colors: c,
}: {
  label: string;
  skills: string[];
  variant?: "required" | "preferred" | "default";
  colors: ReturnType<typeof useThemeColors>;
}) {
  if (skills.length === 0) return null;

  return (
    <View className="mb-3">
      <Text className="mb-1.5 font-medium text-xs uppercase tracking-wide" style={{ color: c.placeholder }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {skills.map((s) => (
          <View key={s} className="rounded-md px-2.5 py-1" style={{ backgroundColor: c.tag }}>
            <Text className="font-medium text-xs" style={{ color: c.tagText }}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nav = useRouter();
  const c = useThemeColors();
  const { data: job, isLoading } = api.job.candidateGetById.useQuery({ id: id! });
  const { data: applicationData } = api.application.hasApplied.useQuery(
    { jobId: id! },
    { enabled: !!id },
  );
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const utils = api.useUtils();

  const bookmarkScale = useSharedValue(1);
  const bookmarkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const applyMutation = api.application.apply.useMutation({
    onSuccess: () => {
      utils.application.hasApplied.invalidate({ jobId: id! });
      utils.application.myApplications.invalidate();
    },
  });

  const handleBookmark = () => {
    bookmarkScale.value = withSpring(1.3, { damping: 8, stiffness: 400 }, () => {
      bookmarkScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    toggleBookmark(id!);
  };

  const hasApplied = !!applicationData;
  const isApplying = applyMutation.isLoading;
  const justApplied = applyMutation.isSuccess;

  if (isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor: c.bg }}>
        <JobDetailSkeleton />
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.bg }}>
        <View className="mb-2">
          <Search size={28} strokeWidth={1.5} color={c.mutedFg} />
        </View>
        <Text className="font-sans" style={{ color: c.fg }}>Job not found</Text>
      </View>
    );
  }

  const salary =
    job.showSalary && job.salaryMin && job.salaryMax
      ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)
      : "";

  const techGroups = [
    { label: "Required Skills", skills: job.requiredSkills, variant: "required" as const },
    { label: "Preferred Skills", skills: job.preferredSkills, variant: "preferred" as const },
    { label: "Tech Stack", skills: job.techStack, variant: "default" as const },
    { label: "Frameworks", skills: job.frameworks, variant: "default" as const },
    { label: "Databases", skills: job.databases, variant: "default" as const },
    { label: "Cloud", skills: job.cloud, variant: "default" as const },
    { label: "Tools", skills: job.tools, variant: "default" as const },
  ].filter((g) => g.skills.length > 0);

  return (
    <View className="flex-1" style={{ backgroundColor: c.bg }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center gap-4 mr-4">
              <Pressable onPress={handleBookmark} hitSlop={12}>
                <Animated.View style={bookmarkAnimStyle}>
                  <Bookmark
                    size={20}
                    strokeWidth={1.5}
                    color={isBookmarked(id!) ? c.highlight : c.mutedFg}
                    fill={isBookmarked(id!) ? c.highlight : "none"}
                  />
                </Animated.View>
              </Pressable>
              <Pressable onPress={() => nav.push("/(app)/notifications")} hitSlop={12}>
                <Bell size={22} strokeWidth={1.5} color={c.fg} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerClassName="pb-28">
        {/* Company + Title */}
        <View className="mb-4 items-center px-4">
          <View className="mb-3">
            <CompanyAvatar name={job.client.name} logo={job.client.logo} size={56} colors={c} />
          </View>
          <Text className="mb-1 text-center font-bold text-2xl" style={{ color: c.fg }}>
            {job.title}
          </Text>
          <Text className="mb-1 font-sans text-base" style={{ color: c.mutedFg }}>
            {job.client.name}
          </Text>
          <View className="flex-row items-center">
            {job.location && (
              <Text className="font-sans text-xs" style={{ color: c.placeholder }}>{job.location}</Text>
            )}
            {job.location && job.publishedAt && (
              <Text className="mx-1.5 text-xs" style={{ color: c.placeholder }}>•</Text>
            )}
            {job.publishedAt && (
              <Text className="font-sans text-xs" style={{ color: c.placeholder }}>
                {formatRelativeDate(job.publishedAt)}
              </Text>
            )}
          </View>
        </View>

        {/* Quick info bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {job.experienceLevel && (
            <InfoPill
              icon={Briefcase}
              label={experienceLevelLabels[job.experienceLevel] ?? job.experienceLevel}
            />
          )}
          {job.employmentType && (
            <InfoPill
              icon={ClipboardList}
              label={employmentTypeLabels[job.employmentType] ?? job.employmentType}
            />
          )}
          {job.workArrangement && (
            <InfoPill
              icon={Home}
              label={workArrangementLabels[job.workArrangement] ?? job.workArrangement}
            />
          )}
          {salary && <InfoPill icon={DollarSign} label={salary} accent />}
        </ScrollView>

        <View className="px-4">
          {/* About This Role */}
          {(job.summary || job.description) && (
            <View className="mb-5" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 20 }}>
              <SectionHeader icon={FileText} title="About This Role" color={c.fg} />
              {job.summary && (
                <Text className="mb-3 font-sans text-sm leading-6" style={{ color: c.fg }}>
                  {job.summary}
                </Text>
              )}
              {job.description && (
                <Text className="font-sans text-sm leading-6" style={{ color: c.mutedFg }}>
                  {job.description}
                </Text>
              )}
            </View>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <View className="mb-5" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 20 }}>
              <SectionHeader icon={CheckSquare} title="Responsibilities" color={c.fg} />
              <BulletList items={job.responsibilities} color={c.mutedFg} />
            </View>
          )}

          {/* Requirements */}
          {job.requirements && (
            <View className="mb-5" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 20 }}>
              <SectionHeader icon={ClipboardList} title="Requirements" color={c.fg} />
              <BulletList items={job.requirements} color={c.mutedFg} />
            </View>
          )}

          {/* Nice to Have */}
          {job.niceToHave && (
            <View className="mb-5" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 20 }}>
              <SectionHeader icon={Star} title="Nice to Have" color={c.fg} />
              <BulletList items={job.niceToHave} color={c.mutedFg} />
            </View>
          )}

          {/* Tech Stack */}
          {techGroups.length > 0 && (
            <View className="mb-5" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 20 }}>
              <SectionHeader icon={Wrench} title="Tech Stack" color={c.fg} />
              {techGroups.map((group) => (
                <SkillPills
                  key={group.label}
                  label={group.label}
                  skills={group.skills}
                  variant={group.variant}
                  colors={c}
                />
              ))}
            </View>
          )}

          {/* Compensation & Benefits */}
          {(salary || job.equity || job.bonus || job.benefits.length > 0) && (
            <View className="mb-5" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 20 }}>
              <SectionHeader icon={DollarSign} title="Compensation & Benefits" color={c.fg} />
              {salary && (
                <Text className="mb-2 font-bold text-lg" style={{ color: c.highlight }}>{salary}</Text>
              )}
              {job.equity && (
                <View className="mb-1.5 flex-row items-center">
                  <View className="mr-2">
                    <TrendingUp size={14} strokeWidth={1.5} color={c.mutedFg} />
                  </View>
                  <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                    Equity: {job.equityRange ?? "Yes"}
                  </Text>
                </View>
              )}
              {job.bonus && (
                <View className="mb-1.5 flex-row items-center">
                  <View className="mr-2">
                    <Target size={14} strokeWidth={1.5} color={c.mutedFg} />
                  </View>
                  <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                    Bonus: {job.bonus}
                  </Text>
                </View>
              )}
              {job.benefits.length > 0 && (
                <View className="mt-2">
                  {job.benefits.map((b) => (
                    <View key={b} className="mb-1 flex-row items-center">
                      <Text className="mr-2 text-sm" style={{ color: c.highlight }}>✓</Text>
                      <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Interview Process */}
          {job.interviewStages.length > 0 && (
            <View className="mb-5" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingBottom: 20 }}>
              <SectionHeader icon={Mic} title="Interview Process" color={c.fg} />
              {job.interviewLength && (
                <Text className="mb-3 font-sans text-xs" style={{ color: c.placeholder }}>
                  Typical duration: {job.interviewLength}
                </Text>
              )}
              <InterviewTimeline stages={job.interviewStages} />
            </View>
          )}

          {/* About the Company */}
          {(job.client.description || job.client.industry) && (
            <View className="mb-5 rounded-xl p-4" style={{ backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.borderLight }}>
              <SectionHeader icon={Building2} title={`About ${job.client.name}`} color={c.fg} />
              <View className="flex-row flex-wrap gap-3 mb-2">
                {job.client.industry && (
                  <View className="flex-row items-center">
                    <View className="mr-1">
                      <Factory size={12} strokeWidth={1.5} color={c.placeholder} />
                    </View>
                    <Text className="font-sans text-xs" style={{ color: c.placeholder }}>
                      {job.client.industry}
                    </Text>
                  </View>
                )}
                {job.client.size && (
                  <View className="flex-row items-center">
                    <View className="mr-1">
                      <Users size={12} strokeWidth={1.5} color={c.placeholder} />
                    </View>
                    <Text className="font-sans text-xs" style={{ color: c.placeholder }}>
                      {job.client.size}
                    </Text>
                  </View>
                )}
              </View>
              {job.client.description && (
                <Text className="font-sans text-sm leading-5" style={{ color: c.mutedFg }}>
                  {job.client.description}
                </Text>
              )}
            </View>
          )}

          {/* Additional Info */}
          {(job.visaSponsorship || job.relocation || job.timezone) && (
            <View className="mb-5">
              <SectionHeader icon={Info} title="Additional Info" color={c.fg} />
              <View className="flex-row flex-wrap gap-3">
                {job.visaSponsorship && (
                  <InfoPill icon={Stamp} label="Visa Sponsorship" />
                )}
                {job.relocation && (
                  <InfoPill icon={Plane} label="Relocation Support" />
                )}
                {job.timezone && (
                  <InfoPill icon={Clock} label={job.timezone} />
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom apply bar */}
      <SafeAreaView
        edges={["bottom"]}
        className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{
          backgroundColor: c.bg,
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
        }}
      >
        {hasApplied || justApplied ? (
          <View className="items-center rounded-none py-4" style={{ backgroundColor: c.highlightBg }}>
            <Text className="font-bold text-base" style={{ color: c.highlight }}>Applied ✓</Text>
          </View>
        ) : (
          <Pressable
            className={`items-center rounded-none py-4 ${isApplying ? "opacity-60" : ""}`}
            style={{ backgroundColor: c.primary }}
            onPress={() => applyMutation.mutate({ jobId: id! })}
            disabled={isApplying}
          >
            <Text className="font-bold text-base" style={{ color: "#FFFFFF" }}>
              {isApplying ? "Applying..." : "Apply Now"}
            </Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}
