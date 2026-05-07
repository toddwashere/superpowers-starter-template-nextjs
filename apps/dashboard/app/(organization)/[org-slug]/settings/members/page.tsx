import type { Metadata } from "next";
import { MembersPageContent } from "@/features/organization/ui/members-page-content";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <MembersPageContent orgSlug={orgSlug} />;
}
