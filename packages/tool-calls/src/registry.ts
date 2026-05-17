import type { ToolDefinition } from "./tool-definition";
import { accountInfoTool } from "./tools/account-info";

export const toolRegistry: ToolDefinition[] = [accountInfoTool];
