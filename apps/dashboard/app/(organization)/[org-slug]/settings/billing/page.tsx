import type { Metadata } from "next";
import { BillingPageContent } from "@/features/organization/ui/billing-page-content";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return <BillingPageContent />;
}
