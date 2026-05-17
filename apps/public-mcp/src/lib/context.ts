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

export type OAuthAuthContext = {
  kind: "oauth";
  userId: string;
  orgId: string | null;
  scopes: string[];
  clientId: string | null;
};

export type AuthContext = ApiKeyAuthContext | SessionAuthContext | OAuthAuthContext;
