import type { Metadata } from "next";
import { ContactsSettingsPageContent } from "@/features/contacts/contact/ui/contacts-settings-page-content";

export const metadata: Metadata = { title: "Contacts Settings" };

export default async function ContactsSettingsPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <ContactsSettingsPageContent orgSlug={orgSlug} />;
}
