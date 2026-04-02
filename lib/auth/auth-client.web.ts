import envConfig from "@/config/env";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: envConfig.API_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
});
