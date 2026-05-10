"use client";

import { ProfileSettings } from "./profile-settings";
import { EmailSettings } from "./email-settings";
import { PasswordSettings } from "./password-settings";
import { ConnectedAccountsSettings } from "./connected-accounts-settings";
import { SessionsSettings } from "./sessions-settings";
import { DangerZoneSettings } from "./danger-zone-settings";

export function AccountSettingsPageContent() {
  return (
    <div className="space-y-6">
      <ProfileSettings />
      <EmailSettings />
      <PasswordSettings />
      <ConnectedAccountsSettings />
      <SessionsSettings />
      <DangerZoneSettings />
    </div>
  );
}
