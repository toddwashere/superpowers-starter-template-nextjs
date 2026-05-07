import type { Metadata } from "next";
import { ResetPasswordPageContent } from "@/features/auth/ui/reset-password-page-content";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return <ResetPasswordPageContent />;
}
