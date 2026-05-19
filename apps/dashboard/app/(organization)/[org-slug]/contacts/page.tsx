import type { Metadata } from "next";
import { ContactsPageContent } from "@/features/contacts/contact/ui/contacts-page-content";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <ContactsPageContent orgSlug={orgSlug} />;
}
