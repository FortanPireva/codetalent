import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WELCOME_SEEN_KEY = "talentflow_welcome_seen";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SEEN_KEY).then((value) => {
      setWelcomeSeen(value === "true");
    });
  }, []);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/jobs" />;
  }

  // Wait until we know whether welcome was seen
  if (welcomeSeen === null) {
    return null;
  }

  if (!welcomeSeen) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(auth)/login" />;
}
