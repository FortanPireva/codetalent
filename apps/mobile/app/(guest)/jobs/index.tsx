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
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { api } from "@/lib/trpc";
import { useDebounce } from "@/hooks/useDebounce";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
} from "@/lib/constants";
import { Search, LogIn } from "lucide-react-native";
import { SearchBar } from "@/components/jobs/SearchBar";
import { FilterSheet, type JobFilters } from "@/components/jobs/FilterSheet";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";

export default function GuestJobsScreen() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobFilters>({});
  const debouncedSearch = useDebounce(search, 300);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const c = useThemeColors();

  const { data, isLoading, refetch, isRefetching } = api.job.publicList.useQuery({
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

      {!isLoading && (
        <Text className="mb-2 px-4 font-sans text-sm" style={{ color: c.mutedFg }}>
          {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
        </Text>
      )}
    </>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-2">
        <Search size={36} strokeWidth={1.5} color={c.mutedFg} />
      </View>
      <Text className="mb-1 font-bold text-base" style={{ color: c.fg }}>No jobs found</Text>
      <Text className="mb-4 font-sans text-sm" style={{ color: c.mutedFg }}>
        Try adjusting your search or filters
      </Text>
      {hasActiveFilters && (
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ flex: 1, backgroundColor: c.surface }}>
          {/* Header */}
          <SafeAreaView edges={["top"]} style={{ backgroundColor: c.surface }}>
            <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
              <Text className="font-bold text-xl" style={{ color: c.fg }}>
                Browse Jobs
              </Text>
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                className="flex-row items-center rounded-lg px-3 py-2"
                style={{ backgroundColor: c.primary }}
              >
                <LogIn size={16} strokeWidth={2} color={c.primaryFg} />
                <Text className="ml-1.5 font-medium text-sm" style={{ color: c.primaryFg }}>
                  Sign In
                </Text>
              </Pressable>
            </View>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onFilterPress={() => filterSheetRef.current?.present()}
              hasActiveFilters={hasActiveFilters}
            />
          </SafeAreaView>

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
                  onPress={() => router.push(`/(guest)/jobs/${item.id}`)}
                />
              )}
            />
          )}

          <FilterSheet
            ref={filterSheetRef}
            filters={filters}
            onApply={setFilters}
          />
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
