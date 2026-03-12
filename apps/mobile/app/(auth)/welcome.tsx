import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  type ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TalentflowLogo } from "@/components/TalentflowLogo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const WELCOME_SEEN_KEY = "talentflow_welcome_seen";

interface Slide {
  icon: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    icon: "🔍",
    title: "Find Top Tech Jobs",
    description:
      "Browse curated opportunities from companies that value real coding skills over resumes.",
  },
  {
    icon: "💻",
    title: "Prove Your Skills with Code",
    description:
      "Complete GitHub-based coding challenges that let your work speak for itself.",
  },
  {
    icon: "🤖",
    title: "AI-Powered Code Review",
    description:
      "Get instant, objective feedback on code quality, architecture, and best practices — scored across 8 categories.",
  },
  {
    icon: "🚀",
    title: "Get Discovered",
    description:
      "Join a searchable talent pool where companies find you based on verified skills, not keywords.",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLast = activeIndex === slides.length - 1;

  function handleNext() {
    if (isLast) {
      markSeenAndNavigate();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }

  async function markSeenAndNavigate() {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
    router.replace("/(auth)/login");
  }

  function handleSkip() {
    markSeenAndNavigate();
  }

  return (
    <View className="flex-1" style={{ backgroundColor: c.bg }}>
      {/* Skip button */}
      <View className="flex-row justify-end px-6 pt-16">
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text className="font-sans text-base" style={{ color: c.mutedFg }}>
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <View
            style={{ width }}
            className="flex-1 items-center justify-center px-10"
          >
            {index === 0 && (
              <View className="mb-6">
                <TalentflowLogo size={64} />
              </View>
            )}
            <Text className="mb-4 text-center" style={{ fontSize: 56 }}>
              {item.icon}
            </Text>
            <Text
              className="mb-3 text-center font-bold text-2xl"
              style={{ color: c.fg }}
            >
              {item.title}
            </Text>
            <Text
              className="text-center font-sans text-base leading-6"
              style={{ color: c.mutedFg, maxWidth: 300 }}
            >
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Pagination dots + buttons */}
      <View className="items-center px-6 pb-14">
        {/* Dots */}
        <View className="mb-8 flex-row gap-2">
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === activeIndex ? c.primary : c.border,
              }}
            />
          ))}
        </View>

        {/* Primary CTA */}
        <Pressable
          className="mb-3 w-full items-center rounded-xl py-4"
          style={{ backgroundColor: c.primary }}
          onPress={handleNext}
        >
          <Text className="font-medium text-base" style={{ color: c.primaryFg }}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </Pressable>

        {/* Secondary CTA on last slide */}
        {isLast && (
          <Pressable
            className="w-full items-center rounded-xl py-4"
            style={{ backgroundColor: c.secondary }}
            onPress={() => {
              AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
              router.replace("/(auth)/login");
            }}
          >
            <Text
              className="font-medium text-base"
              style={{ color: c.secondaryFg }}
            >
              I already have an account
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export { WELCOME_SEEN_KEY };
