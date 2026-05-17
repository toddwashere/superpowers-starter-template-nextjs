"use client";
export function ContactDetailPageContent({ orgSlug, contactId }: { orgSlug: string; contactId: string }) {
  return <div>Contact {contactId} — {orgSlug}</div>;
}
