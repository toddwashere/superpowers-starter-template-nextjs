export type ToolResult = {
  toolName: string;
  arguments: Record<string, unknown>;
  result: unknown;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
};
