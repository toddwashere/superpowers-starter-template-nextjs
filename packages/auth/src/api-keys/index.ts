export { publicApiPermissions, hasPermission } from "./permissions";
export type { PublicApiResource, PublicApiAction } from "./permissions";
export { verifyApiKey, ApiKeyError } from "./verify";
export type { ApiKeyContext } from "./verify";

// Convenience alias: resolveApiKeyContext is identical to verifyApiKey but
// named for clarity in middleware that just wants the context object.
export { verifyApiKey as resolveApiKeyContext } from "./verify";
