import type { Metadata } from "next";
import { ConsentPageContent } from "@/features/consent/ui/consent-page-content";

export const metadata: Metadata = { title: "Authorize Application" };

export default function ConsentPage() {
  return <ConsentPageContent />;
}
