import type { Metadata } from "next";
import { ContactsTasksPageContent } from "@/features/contacts/ui/contacts-tasks-page-content";

export const metadata: Metadata = { title: "Contact Tasks" };

export default async function ContactsTasksPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <ContactsTasksPageContent orgSlug={orgSlug} />;
}
