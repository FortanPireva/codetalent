import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import * as SecureStore from "expo-secure-store";
import type { AppRouter } from "@codetalent/web/server/api/root";

export const api = createTRPCReact<AppRouter>();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function createMobileTRPCClient() {
  return api.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        async headers() {
          const token = await SecureStore.getItemAsync("auth_token");
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
