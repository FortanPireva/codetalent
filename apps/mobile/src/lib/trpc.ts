import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, retryLink } from "@trpc/client";
import superjson from "superjson";
import * as SecureStore from "expo-secure-store";
import type { AppRouter } from "@codetalent/web/server/api/root";

export const api = createTRPCReact<AppRouter>();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function createMobileTRPCClient() {
  return api.createClient({
    transformer: superjson,
    links: [
      retryLink({
        retry(opts) {
          // Only retry on network/timeout errors, not on 4xx errors
          if (opts.error?.data?.code === "UNAUTHORIZED") return false;
          if (opts.error?.data?.code === "BAD_REQUEST") return false;
          // Retry up to 2 times for mutations (covers cold starts)
          return opts.attempts < 2;
        },
      }),
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        async headers() {
          const token = await SecureStore.getItemAsync("auth_token");
          return token ? { authorization: `Bearer ${token}` } : {};
        },
        fetch(url, options) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeout));
        },
      }),
    ],
  });
}
