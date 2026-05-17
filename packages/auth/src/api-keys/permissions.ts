export const publicApiPermissions = {
  account: ["read"],
  contact: ["read", "create", "update"],
  contactInteraction: ["create"],
  contactTask: ["read", "create", "update"],
} as const;

export type PublicApiResource = keyof typeof publicApiPermissions;
export type PublicApiAction =
  (typeof publicApiPermissions)[PublicApiResource][number];

export function hasPermission(
  keyPermissions: Record<string, string[]>,
  required: Partial<Record<string, string[]>>,
): boolean {
  for (const [resource, actions] of Object.entries(required)) {
    const granted = keyPermissions[resource] ?? [];
    if (!actions?.every((action) => granted.includes(action))) return false;
  }
  return true;
}
