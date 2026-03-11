import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type BottomSheet from "@gorhom/bottom-sheet";
import { api } from "@/lib/trpc";
import { useDebounce } from "@/hooks/useDebounce";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
} from "@/lib/constants";
import { SearchBar } from "@/components/jobs/SearchBar";
import { FilterSheet, type JobFilters } from "@/components/jobs/FilterSheet";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";

export default function JobsScreen() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobFilters>({});
  const debouncedSearch = useDebounce(search, 300);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const filterSheetRef = useRef<BottomSheet>(null);
  const c = useThemeColors();

  const { data, isLoading, refetch, isRefetching } = api.job.candidateList.useQuery({
    search: debouncedSearch || undefined,
    experienceLevel: filters.experienceLevel as any,
    employmentType: filters.employmentType as any,
    workArrangement: filters.workArrangement as any,
  });

  const jobs = data ?? [];

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
          {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
        </Text>
      )}
    </>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="mb-2 text-4xl">🔍</Text>
      <Text className="mb-1 font-bold text-base" style={{ color: c.fg }}>No jobs match your filters</Text>
      <Text className="mb-4 font-sans text-sm" style={{ color: c.mutedFg }}>
        Try adjusting your search or filters
      </Text>
      <Pressable
        onPress={clearAllFilters}
        className="rounded-lg px-5 py-2.5"
        style={{ backgroundColor: c.primary }}
      >
        <Text className="font-medium text-sm" style={{ color: c.primaryFg }}>Clear Filters</Text>
      </Pressable>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: c.surface }} edges={["top"]}>
        {/* Header */}
        <View className="pb-1 pt-2">
          <Text className="mb-3 px-4 font-bold text-2xl" style={{ color: c.fg }}>Jobs</Text>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={() => filterSheetRef.current?.snapToIndex(0)}
            hasActiveFilters={hasActiveFilters}
          />
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
