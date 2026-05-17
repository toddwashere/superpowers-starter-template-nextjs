# Auth Data Models

This package intentionally does not wrap every Better Auth table in repository files.

Better Auth owns mechanism tables such as sessions, accounts, verifications, OAuth tokens, OAuth consents, API keys, and most invitation/session lifecycle behavior. App code should use Better Auth APIs for those flows so it does not bypass token handling, expiry logic, revocation, hooks, or plugin assumptions.

Repository files in this package are only for app-facing auth concepts that the product intentionally reads or queries directly, such as users, organizations, or members. Do not add create/update/delete helpers for Better Auth-owned mechanism tables unless there is a specific product requirement and the Better Auth API cannot cover it.
