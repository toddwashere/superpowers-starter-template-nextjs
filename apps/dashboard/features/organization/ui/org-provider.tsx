"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@workspace/auth/client";
import { useQuery } from "@tanstack/react-query";

interface OrgMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface OrgInvitation {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: string;
  organizationId: string;
  expiresAt: Date;
}

interface OrgContextValue {
  organization: Awaited<
    ReturnType<typeof authClient.organization.getFullOrganization>
  >["data"] | null;
  members: OrgMember[];
  invitations: OrgInvitation[];
  isLoading: boolean;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: ReactNode;
}) {
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ["organization", orgSlug],
    queryFn: async () => {
      const result = await authClient.organization.getFullOrganization({
        query: { organizationSlug: orgSlug },
      });
      return result.data;
    },
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["members", orgSlug],
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: { organizationId: orgData!.id },
      });
      const data = result.data;
      if (!data) return [];
      return (data as { members: OrgMember[] }).members ?? [];
    },
    enabled: !!orgData?.id,
  });

  return (
    <OrgContext.Provider
      value={{
        organization: orgData ?? null,
        members: membersData ?? [],
        invitations: orgData?.invitations ?? [],
        isLoading: orgLoading || membersLoading,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useCurrentOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useCurrentOrg must be used within OrgProvider");
  }
  return context;
}
