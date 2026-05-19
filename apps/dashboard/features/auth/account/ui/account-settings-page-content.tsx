"use client";

import Link from "next/link";
import { getPathForHome } from "@workspace/routes";
import { Page, PageBody } from "@workspace/ui/components/page";
import { PageHeaderNoOrg } from "@/common/ui/page-header-no-org";
import { ProfileSettings } from "./profile-settings";
import { EmailSettings } from "./email-settings";
import { PasswordSettings } from "./password-settings";
import { ConnectedAccountsSettings } from "./connected-accounts-settings";
import { SessionsSettings } from "./sessions-settings";
import { DangerZoneSettings } from "./danger-zone-settings";

export function AccountSettingsPageContent() {
  return (
    <Page className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
      <PageHeaderNoOrg
        leading={
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={getPathForHome()}
              className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to dashboard
            </Link>
            <span className="truncate text-sm font-semibold">Account Settings</span>
          </div>
        }
        description="Manage your profile, security, and connected accounts."
      />
      <PageBody disableScroll className="space-y-6 p-6">
        <ProfileSettings />
        <EmailSettings />
        <PasswordSettings />
        <ConnectedAccountsSettings />
        <SessionsSettings />
        <DangerZoneSettings />
      </PageBody>
    </Page>
  );
}
