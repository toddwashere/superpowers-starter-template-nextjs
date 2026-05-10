export type AccountRecord = { providerId: string };

export function hasCredentialAccount(accounts: AccountRecord[]): boolean {
  return accounts.some((a) => a.providerId === "credential");
}

export function hasOnlyOneAuthMethod(accounts: AccountRecord[]): boolean {
  return accounts.length <= 1;
}

export function isDeleteConfirmationValid(input: string): boolean {
  return input === "delete my account";
}

export function isCurrentSession(
  sessionToken: string,
  currentToken: string
): boolean {
  return sessionToken === currentToken;
}

export function shouldShowConnectedAccounts(
  configuredProviders: { id: string; name: string }[]
): boolean {
  return configuredProviders.length > 0;
}
