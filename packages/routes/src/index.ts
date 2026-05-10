export function homePath() {
  return "/";
}

export function signInPath() {
  return "/sign-in";
}

export function signUpPath() {
  return "/sign-up";
}

export function forgotPasswordPath() {
  return "/forgot-password";
}

export function resetPasswordPath() {
  return "/reset-password";
}

export function verifyEmailPath() {
  return "/verify-email";
}

export function createOrgPath() {
  return "/create-org";
}

export function orgPath(orgSlug: string) {
  return `/${orgSlug}`;
}

export function orgSettingsPath(orgSlug: string) {
  return `/${orgSlug}/settings`;
}

export function orgSettingsGeneralPath(orgSlug: string) {
  return `/${orgSlug}/settings/general`;
}

export function orgMembersPath(orgSlug: string) {
  return `/${orgSlug}/settings/members`;
}

export function acceptInvitationPath(invitationId: string) {
  return `/accept-invitation/${invitationId}`;
}

export function accountPath() {
  return "/account";
}
