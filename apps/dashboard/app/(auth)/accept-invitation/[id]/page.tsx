import type { Metadata } from "next";
import { AcceptInvitationPageContent } from "@/features/organization/ui/accept-invitation-page-content";

export const metadata: Metadata = { title: "Accept Invitation" };

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AcceptInvitationPageContent invitationId={id} />;
}
