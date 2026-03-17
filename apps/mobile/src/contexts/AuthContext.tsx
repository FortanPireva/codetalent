import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/trpc";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  candidateStatus: string;
  clientStatus: string;
  hasActiveSubscription: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  loginWithToken: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const loginMutation = api.auth.login.useMutation();

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const storedUser = await SecureStore.getItemAsync("auth_user");
      const storedToken = await SecureStore.getItemAsync("auth_token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Ignore errors loading stored user
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });

    if (result.user.role === "CLIENT" || result.user.role === "ADMIN") {
      throw new Error("This app is for developers only. Please use the web platform.");
    }

    await SecureStore.setItemAsync("auth_token", result.token);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(result.user));
    setUser(result.user);
  }, [loginMutation]);

  const loginWithToken = useCallback(async (token: string, userData: User) => {
    await SecureStore.setItemAsync("auth_token", token);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      SecureStore.setItemAsync("auth_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("auth_user");
    setUser(null);
    queryClient.clear();
    router.replace("/(auth)/login");
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithToken,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
