import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { api } from "@/lib/trpc";
import { useDebounce } from "@/hooks/useDebounce";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
} from "@/lib/constants";
import { Search, Bookmark } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SearchBar } from "@/components/jobs/SearchBar";
import { FilterSheet, type JobFilters } from "@/components/jobs/FilterSheet";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";

export default function JobsScreen() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobFilters>({});
  const [showSaved, setShowSaved] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { bookmarkedIds, isBookmarked, toggleBookmark } = useBookmarks();
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const c = useThemeColors();

  const { data, isLoading, refetch, isRefetching } = api.job.candidateList.useQuery({
    search: debouncedSearch || undefined,
    experienceLevel: filters.experienceLevel as
      | "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "STAFF" | "PRINCIPAL" | "LEAD" | "MANAGER"
      | undefined,
    employmentType: filters.employmentType as
      | "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP"
      | undefined,
    workArrangement: filters.workArrangement as
      | "ONSITE" | "HYBRID" | "REMOTE_LOCAL" | "REMOTE_GLOBAL"
      | undefined,
  }, {
    staleTime: 60_000,
  });

  const allJobs = data ?? [];
  const jobs = showSaved
    ? allJobs.filter((j) => bookmarkedIds.has(j.id))
    : allJobs;

  const hasActiveFilters = !!(
    filters.experienceLevel ||
    filters.employmentType ||
    filters.workArrangement
  );

  const activeFilterPills = useMemo(() => {
    const pills: { key: keyof JobFilters; label: string }[] = [];
    if (filters.experienceLevel) {
      pills.push({
        key: "experienceLevel",
        label: experienceLevelLabels[filters.experienceLevel] ?? filters.experienceLevel,
      });
    }
    if (filters.employmentType) {
      pills.push({
        key: "employmentType",
        label: employmentTypeLabels[filters.employmentType] ?? filters.employmentType,
      });
    }
    if (filters.workArrangement) {
      pills.push({
        key: "workArrangement",
        label: workArrangementLabels[filters.workArrangement] ?? filters.workArrangement,
      });
    }
    return pills;
  }, [filters]);

  const removeFilter = useCallback(
    (key: keyof JobFilters) => {
      setFilters((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearch("");
  }, []);

  const renderHeader = () => (
    <>
      {/* Active filter pills */}
      {activeFilterPills.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2 px-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {activeFilterPills.map((pill) => (
            <Pressable
              key={pill.key}
              onPress={() => removeFilter(pill.key)}
              className="flex-row items-center rounded-lg px-3 py-1.5"
              style={{ backgroundColor: c.primary }}
            >
              <Text className="mr-1.5 font-medium text-xs" style={{ color: c.primaryFg }}>
                {pill.label}
              </Text>
              <Text className="text-xs" style={{ color: c.primaryFg }}>✕</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Results count */}
      {!isLoading && (
        <Text className="mb-2 px-4 font-sans text-sm" style={{ color: c.mutedFg }}>
          {showSaved
            ? `${jobs.length} saved job${jobs.length !== 1 ? "s" : ""}`
            : `${jobs.length} open position${jobs.length !== 1 ? "s" : ""}`}
        </Text>
      )}
    </>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-2">
        {showSaved ? (
          <Bookmark size={36} strokeWidth={1.5} color={c.mutedFg} />
        ) : (
          <Search size={36} strokeWidth={1.5} color={c.mutedFg} />
        )}
      </View>
      <Text className="mb-1 font-bold text-base" style={{ color: c.fg }}>
        {showSaved ? "No saved jobs yet" : "No jobs match your filters"}
      </Text>
      <Text className="mb-4 text-center font-sans text-sm" style={{ color: c.mutedFg }}>
        {showSaved
          ? "Tap the bookmark icon on any job to save it here"
          : "Try adjusting your search or filters"}
      </Text>
      {!showSaved && (
        <Pressable
          onPress={clearAllFilters}
          className="rounded-lg px-5 py-2.5"
          style={{ backgroundColor: c.primary }}
        >
          <Text className="font-medium text-sm" style={{ color: c.primaryFg }}>Clear Filters</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
        {/* Header */}
        <View className="pb-1">
          <ScreenHeader />
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={() => filterSheetRef.current?.present()}
            hasActiveFilters={hasActiveFilters}
          />

          {/* All / Saved toggle */}
          <View className="flex-row gap-2 px-4 pb-2">
            <Pressable
              className="flex-row items-center rounded-lg px-4 py-2"
              style={{
                backgroundColor: !showSaved ? c.primary : c.tag,
              }}
              onPress={() => setShowSaved(false)}
            >
              <Text
                className="font-medium text-sm"
                style={{ color: !showSaved ? c.primaryFg : c.mutedFg }}
              >
                All
              </Text>
            </Pressable>
            <Pressable
              className="flex-row items-center gap-1.5 rounded-lg px-4 py-2"
              style={{
                backgroundColor: showSaved ? c.primary : c.tag,
              }}
              onPress={() => setShowSaved(true)}
            >
              <Bookmark
                size={14}
                strokeWidth={1.5}
                color={showSaved ? c.primaryFg : c.mutedFg}
                fill={showSaved ? c.primaryFg : "none"}
              />
              <Text
                className="font-medium text-sm"
                style={{ color: showSaved ? c.primaryFg : c.mutedFg }}
              >
                Saved{bookmarkedIds.size > 0 ? ` (${bookmarkedIds.size})` : ""}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="px-4">
            {[0, 1, 2, 3].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <FlatList
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            data={jobs}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            renderItem={({ item, index }) => (
              <JobCard
                job={item}
                index={index}
                isBookmarked={isBookmarked(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
                onPress={() => router.push(`/(app)/jobs/${item.id}`)}
              />
            )}
          />
        )}

        {/* Filter Bottom Sheet */}
        <FilterSheet
          ref={filterSheetRef}
          filters={filters}
          onApply={setFilters}
        />
    </View>
  );
}
