import envConfig from "@/config/env";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
export const authClient = createAuthClient({
  baseURL: envConfig.API_BASE_URL, // Base URL of your Better Auth backend.
  plugins: [
    expoClient({
      scheme: "batterymonitoring",
      storagePrefix: "batterymonitoring",
      storage: SecureStore,
    }),
  ],
});
