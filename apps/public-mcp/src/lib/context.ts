export type ApiKeyAuthContext = {
  kind: "api-key";
  keyId: string;
  orgId: string | null;
  userId: string | null;
  ownerType: "organization" | "user";
  permissions: Record<string, string[]>;
};

export type SessionAuthContext = {
  kind: "session";
  userId: string;
  orgId: string | null;
  permissions: Record<string, string[]>;
};

export type AuthContext = ApiKeyAuthContext | SessionAuthContext;
