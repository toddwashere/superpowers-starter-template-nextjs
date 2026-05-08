import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin } from "better-auth/plugins";
import { prisma } from "@workspace/database";
import { ac, permissions } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      console.log(`[Auth] Verification email for ${user.email}: ${url}`);
    },
    sendResetPasswordEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      console.log(`[Auth] Password reset for ${user.email}: ${url}`);
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    }),
    ...(process.env.MICROSOFT_CLIENT_ID && {
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      },
    }),
  },
  plugins: [
    organization({
      ac,
      roles: {
        owner: permissions.owner,
        admin: permissions.admin,
        member: permissions.member,
      },
      async sendInvitationEmail(data) {
        console.log(
          `[Auth] Org invite: ${data.email} invited to ${data.organization.name} by ${data.inviter.user.name}`,
        );
        console.log(
          `[Auth] Accept URL: /accept-invitation/${data.id}`,
        );
      },
    }),
    admin(),
  ],
});

export type Auth = typeof auth;
