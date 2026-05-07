export const SYSTEM_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const ORG_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  SIGN_OUT: "/sign-out",
} as const;

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.SIGN_IN,
  AUTH_ROUTES.SIGN_UP,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  AUTH_ROUTES.VERIFY_EMAIL,
  "/accept-invitation",
  "/api/auth",
] as const;
