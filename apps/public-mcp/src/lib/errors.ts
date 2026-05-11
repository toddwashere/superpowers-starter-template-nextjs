import type { ServerResponse } from "node:http";

export class McpAuthError extends Error {
  constructor(
    public readonly code: "UNAUTHORIZED" | "RATE_LIMITED",
    message: string,
  ) {
    super(message);
    this.name = "McpAuthError";
  }
}

export function writeJsonError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { code, message } }));
}
