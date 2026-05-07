import { headers } from "next/headers";
import { auth } from "./auth";

export async function getCurrentUser() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  return session;
}

export async function getCurrentOrg() {
  const requestHeaders = await headers();
  const org = await auth.api.getFullOrganization({
    headers: requestHeaders,
  });
  return org;
}
