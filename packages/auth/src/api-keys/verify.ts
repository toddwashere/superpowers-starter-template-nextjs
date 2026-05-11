import { auth } from "../auth";

export type ApiKeyContext = {
  keyId: string;
  orgId: string | null;
  userId: string | null;
  ownerType: "organization" | "user";
  permissions: Record<string, string[]>;
};

export class ApiKeyError extends Error {
  constructor(
    public readonly code: "UNAUTHORIZED" | "RATE_LIMITED",
    message: string,
  ) {
    super(message);
    this.name = "ApiKeyError";
  }
}

export async function verifyApiKey(key: string): Promise<ApiKeyContext> {
  const result = await auth.api.verifyApiKey({ body: { key } });

  if (!result.valid || !result.key) {
    throw new ApiKeyError("UNAUTHORIZED", "Invalid or missing API key");
  }

  const apiKey = result.key;
  const ownerType =
    apiKey.configId === "org-keys" ? "organization" : "user";

  let permissions: Record<string, string[]> = {};
  if (apiKey.permissions) {
    const raw = apiKey.permissions;
    if (typeof raw === "string") {
      try {
        permissions = JSON.parse(raw) as Record<string, string[]>;
      } catch {
        permissions = {};
      }
    } else {
      permissions = raw as Record<string, string[]>;
    }
  }

  return {
    keyId: apiKey.id,
    orgId: ownerType === "organization" ? apiKey.referenceId : null,
    userId: ownerType === "user" ? apiKey.referenceId : null,
    ownerType,
    permissions,
  };
}
