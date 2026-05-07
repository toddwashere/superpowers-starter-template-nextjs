import type { Metadata } from "next";
import { GeneralSettingsPageContent } from "@/features/organization/ui/general-settings-page-content";

export const metadata: Metadata = { title: "General Settings" };

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <GeneralSettingsPageContent orgSlug={orgSlug} />;
}
