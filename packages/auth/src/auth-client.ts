import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient } from "better-auth/client/plugins";
import { apiKeyClient } from "@better-auth/api-key/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000",
  plugins: [organizationClient(), adminClient(), apiKeyClient()],
  fetchOptions: { throw: true },
});

export type AuthClient = typeof authClient;
