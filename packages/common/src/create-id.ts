import { randomUUID } from "node:crypto";

export type AuthIdPrefix = "user" | "org" | "mbr";
export type ContactsIdPrefix =
  | "contact"
  | "cstage"
  | "ctag"
  | "cseg"
  | "cint"
  | "ctask"
  | "ctstatus";
export type McpIdPrefix = "mcptcl";

export type IdPrefix = AuthIdPrefix | ContactsIdPrefix | McpIdPrefix | "tmp";

export function createId(prefix: IdPrefix): string {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}
