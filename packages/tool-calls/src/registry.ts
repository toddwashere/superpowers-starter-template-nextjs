import type { ToolDefinition } from "./tool-definition";
import { accountInfoTool } from "./tools/account-info";
import { contactTools } from "./tools/contact-tools";

export const toolRegistry: ToolDefinition[] = [
  accountInfoTool,
  ...contactTools,
];
