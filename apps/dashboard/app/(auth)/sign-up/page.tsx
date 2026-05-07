import type { Metadata } from "next";
import { SignUpPageContent } from "@/features/auth/ui/sign-up-page-content";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return <SignUpPageContent />;
}
