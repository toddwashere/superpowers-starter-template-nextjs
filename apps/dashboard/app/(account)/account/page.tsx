import type { Metadata } from "next";
import { AccountSettingsPageContent } from "@/features/auth/account/ui/account-settings-page-content";

export const metadata: Metadata = { title: "Account Settings" };

export default function AccountPage() {
  return <AccountSettingsPageContent />;
}
