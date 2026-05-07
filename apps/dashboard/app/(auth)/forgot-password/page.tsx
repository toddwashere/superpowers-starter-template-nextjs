import type { Metadata } from "next";
import { ForgotPasswordPageContent } from "@/features/auth/ui/forgot-password-page-content";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
