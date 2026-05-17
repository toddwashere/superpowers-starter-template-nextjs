import type { ToolCallContext } from "./context";

export type ToolDefinition<TOutput = unknown> = {
  name: string;
  description: string;
  requiredScopes: string[];
  requiredPermissions: Record<string, string[]>;
  run: (ctx: ToolCallContext) => Promise<TOutput>;
};
