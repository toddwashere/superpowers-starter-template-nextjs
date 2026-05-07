import type { Metadata } from "next";
import { VerifyEmailPageContent } from "@/features/auth/ui/verify-email-page-content";

export const metadata: Metadata = { title: "Verify Email" };

export default function VerifyEmailPage() {
  return <VerifyEmailPageContent />;
}
