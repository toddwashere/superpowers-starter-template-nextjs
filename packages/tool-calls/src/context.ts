export type ToolCallContext =
  | {
      kind: "oauth";
      userId: string;
      orgId: string | null;
      scopes: string[];
      clientId: string | null;
    }
  | {
      kind: "api-key";
      keyId: string;
      ownerType: "organization" | "user";
      userId: string | null;
      orgId: string | null;
      permissions: Record<string, string[]>;
    }
  | {
      kind: "session";
      userId: string;
      orgId: string | null;
      permissions: Record<string, string[]>;
    };
