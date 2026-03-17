import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Clock, RefreshCw } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { api } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function PendingScreen() {
  const { logout, updateUser } = useAuth();
  const c = useThemeColors();
  const [checking, setChecking] = useState(false);

  const { data, refetch } = api.onboarding.getStatus.useQuery(undefined, {
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (data?.candidateStatus && data.candidateStatus !== "PENDING_REVIEW") {
      updateUser({ candidateStatus: data.candidateStatus });
    }
  }, [data?.candidateStatus, updateUser]);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await refetch();
    } finally {
      setChecking(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: c.bg }}>
      <View className="mb-4 items-center justify-center rounded-2xl p-4" style={{ backgroundColor: c.highlightBg }}>
        <Clock size={40} strokeWidth={1.5} color={c.highlight} />
      </View>
      <Text className="mb-2 text-center font-bold text-2xl" style={{ color: c.fg }}>
        Under Review
      </Text>
      <Text className="text-center font-sans text-base leading-6" style={{ color: c.mutedFg }}>
        Your profile is under review by the Codeks team. We'll notify you once
        it's approved.
      </Text>
      <Pressable
        className="mt-8 flex-row items-center rounded-xl px-6 py-3"
        style={{ backgroundColor: c.highlight }}
        onPress={handleCheckStatus}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <RefreshCw size={18} strokeWidth={2} color="#FFFFFF" />
        )}
        <Text className="ml-2 font-bold text-sm" style={{ color: "#FFFFFF" }}>
          {checking ? "Checking..." : "Check Status"}
        </Text>
      </Pressable>
      <Pressable
        className="mt-4"
        onPress={() => { logout().catch(() => {}); }}
        hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
      >
        <Text className="font-sans text-sm" style={{ color: c.placeholder }}>Sign Out</Text>
      </Pressable>
    </View>
  );
}
