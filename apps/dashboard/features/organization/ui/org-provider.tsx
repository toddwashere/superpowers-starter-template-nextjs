"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@workspace/auth/client";
import { useQuery } from "@tanstack/react-query";

interface OrgContextValue {
  organization: Awaited<
    ReturnType<typeof authClient.organization.getFullOrganization>
  >["data"] | null;
  members: NonNullable<
    Awaited<
      ReturnType<typeof authClient.organization.listMembers>
    >["data"]
  >;
  invitations: NonNullable<
    Awaited<
      ReturnType<typeof authClient.organization.getInvitation>
    >["data"]
  >[];
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
      return result.data;
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
