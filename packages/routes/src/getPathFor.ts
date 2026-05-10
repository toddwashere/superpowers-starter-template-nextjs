export function getPathForHome() {
  return "/";
}

export function getPathForSignIn() {
  return "/sign-in";
}

export function getPathForSignUp() {
  return "/sign-up";
}

export function getPathForForgotPassword() {
  return "/forgot-password";
}

export function getPathForResetPassword() {
  return "/reset-password";
}

export function getPathForVerifyEmail() {
  return "/verify-email";
}

export function getPathForCreateOrg() {
  return "/create-org";
}

export function getPathForOrg(orgSlug: string) {
  return `/${orgSlug}`;
}

export function getPathForOrgSettings(orgSlug: string) {
  return `/${orgSlug}/settings`;
}

export function getPathForOrgSettingsGeneral(orgSlug: string) {
  return `/${orgSlug}/settings/general`;
}

export function getPathForOrgMembers(orgSlug: string) {
  return `/${orgSlug}/settings/members`;
}

export function getPathForAcceptInvitation(invitationId: string) {
  return `/accept-invitation/${invitationId}`;
}

export function getPathForAccount() {
  return "/account";
}
