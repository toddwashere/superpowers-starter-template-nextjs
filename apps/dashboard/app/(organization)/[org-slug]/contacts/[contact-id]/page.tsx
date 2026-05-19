import type { Metadata } from "next";
import { ContactDetailPageContent } from "@/features/contacts/contact/ui/contact-detail-page-content";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ "org-slug": string; "contact-id": string }>;
}) {
  const { "org-slug": orgSlug, "contact-id": contactId } = await params;
  return <ContactDetailPageContent orgSlug={orgSlug} contactId={contactId} />;
}
