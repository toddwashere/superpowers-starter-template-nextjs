"use server";

import { auth } from "@workspace/auth";
import { requireOrgPermission, requireUser } from "@workspace/auth/guards";
import { headers } from "next/headers";

export async function createOrganizationAction(data: {
  name: string;
  slug: string;
}) {
  await requireUser();
  const requestHeaders = await headers();
  const result = await auth.api.createOrganization({
    body: { name: data.name, slug: data.slug },
    headers: requestHeaders,
  });
  return result;
}

export async function inviteMemberAction(data: {
  organizationId: string;
  email: string;
  role: "admin" | "member";
}) {
  await requireOrgPermission({ invitation: ["create"] });
  const requestHeaders = await headers();
  const result = await auth.api.createInvitation({
    body: {
      organizationId: data.organizationId,
      email: data.email,
      role: data.role,
    },
    headers: requestHeaders,
  });
  return result;
}

export async function updateMemberRoleAction(data: {
  memberId: string;
  role: "owner" | "admin" | "member";
  organizationId: string;
}) {
  await requireOrgPermission({ member: ["update"] });
  const requestHeaders = await headers();
  const result = await auth.api.updateMemberRole({
    body: {
      memberId: data.memberId,
      role: data.role,
      organizationId: data.organizationId,
    },
    headers: requestHeaders,
  });
  return result;
}

export async function removeMemberAction(data: {
  memberId: string;
  organizationId: string;
}) {
  await requireOrgPermission({ member: ["delete"] });
  const requestHeaders = await headers();
  const result = await auth.api.removeMember({
    body: {
      memberIdOrEmail: data.memberId,
      organizationId: data.organizationId,
    },
    headers: requestHeaders,
  });
  return result;
}

export async function cancelInvitationAction(data: {
  invitationId: string;
}) {
  await requireOrgPermission({ invitation: ["cancel"] });
  const requestHeaders = await headers();
  const result = await auth.api.cancelInvitation({
    body: { invitationId: data.invitationId },
    headers: requestHeaders,
  });
  return result;
}
