import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { prisma } from "@workspace/database";
import { ac, permissions } from "./permissions";
import { routeVerificationEmail } from "./email-routing";
import { sendPasswordResetEmail } from "@workspace/email/send-password-reset-email";
import { sendInvitationEmail } from "@workspace/email/send-invitation-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string; emailVerified: boolean };
      url: string;
    }) => {
      await routeVerificationEmail({ user, url });
    },
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      await sendPasswordResetEmail({
        recipient: user.email,
        name: user.name,
        resetUrl: url,
      });
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
        const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";
        await sendInvitationEmail({
          recipient: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          acceptUrl: `${baseUrl}/accept-invitation/${data.id}`,
        });
      },
    }),
    admin(),
    apiKey([
      {
        configId: "org-keys",
        defaultPrefix: "sk_org_",
        references: "organization",
        enableMetadata: true,
        rateLimit: {
          enabled: true,
          maxRequests: 1000,
          timeWindow: 1000 * 60 * 60,
        },
      },
      {
        configId: "user-keys",
        defaultPrefix: "sk_user_",
        references: "user",
        enableMetadata: true,
        rateLimit: {
          enabled: true,
          maxRequests: 1000,
          timeWindow: 1000 * 60 * 60,
        },
      },
    ]),
  ],
});

export type Auth = typeof auth;
