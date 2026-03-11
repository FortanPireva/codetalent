import React, { forwardRef, useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
} from "@/lib/constants";

export interface JobFilters {
  experienceLevel?: string;
  employmentType?: string;
  workArrangement?: string;
}

interface FilterSheetProps {
  filters: JobFilters;
  onApply: (filters: JobFilters) => void;
}

function Chip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-2 mb-2 rounded-lg px-4 py-2"
      style={{ backgroundColor: active ? colors.primary : colors.tag }}
    >
      <Text
        className="font-medium text-sm"
        style={{ color: active ? colors.primaryFg : colors.mutedFg }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export const FilterSheet = forwardRef<BottomSheet, FilterSheetProps>(
  ({ filters, onApply }, ref) => {
    const snapPoints = useMemo(() => ["60%", "85%"], []);
    const [draft, setDraft] = useState<JobFilters>(filters);
    const c = useThemeColors();

    useEffect(() => {
      setDraft(filters);
    }, [filters]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const toggleFilter = (
      key: keyof JobFilters,
      value: string,
    ) => {
      setDraft((prev) => ({
        ...prev,
        [key]: prev[key] === value ? undefined : value,
      }));
    };

    const resetAll = () => setDraft({});

    const apply = () => {
      onApply(draft);
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
      }
    };

    const hasFilters = draft.experienceLevel || draft.employmentType || draft.workArrangement;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: c.bg === "#141414" ? "#1A1A1A" : "#FFFFFF" }}
        handleIndicatorStyle={{ backgroundColor: c.bg === "#141414" ? "#555555" : "#CCCCCC" }}
      >
        <BottomSheetView className="flex-1 px-5 pt-2">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-bold text-xl" style={{ color: c.fg }}>Filters</Text>
            {hasFilters && (
              <Pressable onPress={resetAll}>
                <Text className="font-medium text-sm" style={{ color: "#ef4444" }}>Reset All</Text>
              </Pressable>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Experience Level */}
            <Text className="mb-2 font-bold text-sm" style={{ color: c.fg }}>Experience Level</Text>
            <View className="mb-4 flex-row flex-wrap">
              {Object.entries(experienceLevelLabels).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  active={draft.experienceLevel === key}
                  onPress={() => toggleFilter("experienceLevel", key)}
                  colors={c}
                />
              ))}
            </View>

            {/* Employment Type */}
            <Text className="mb-2 font-bold text-sm" style={{ color: c.fg }}>Employment Type</Text>
            <View className="mb-4 flex-row flex-wrap">
              {Object.entries(employmentTypeLabels).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  active={draft.employmentType === key}
                  onPress={() => toggleFilter("employmentType", key)}
                  colors={c}
                />
              ))}
            </View>

            {/* Work Arrangement */}
            <Text className="mb-2 font-bold text-sm" style={{ color: c.fg }}>Work Arrangement</Text>
            <View className="mb-4 flex-row flex-wrap">
              {Object.entries(workArrangementLabels).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  active={draft.workArrangement === key}
                  onPress={() => toggleFilter("workArrangement", key)}
                  colors={c}
                />
              ))}
            </View>
          </ScrollView>

          {/* Apply button */}
          <Pressable
            onPress={apply}
            className="mb-6 items-center rounded-xl py-4"
            style={{ backgroundColor: c.primary }}
          >
            <Text className="font-bold text-base" style={{ color: c.primaryFg }}>Apply Filters</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

FilterSheet.displayName = "FilterSheet";
