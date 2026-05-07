import { headers } from "next/headers";
import { auth } from "./auth";

export async function requireUser() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    throw new Error("Unauthorized", { cause: { status: 401 } });
  }
  return session;
}

export async function requireSystemAdmin() {
  const session = await requireUser();
  if (session.user.role !== "admin") {
    throw new Error("Forbidden: admin role required", {
      cause: { status: 403 },
    });
  }
  return session;
}

export async function requireOrgPermission(
  permissions: Record<string, string[]>,
) {
  const session = await requireUser();
  const hasPermission = await auth.api.hasPermission({
    headers: await headers(),
    body: { permissions },
  });
  if (!hasPermission?.success) {
    throw new Error(
      `Forbidden: missing required permission`,
      { cause: { status: 403 } },
    );
  }
  return session;
}
