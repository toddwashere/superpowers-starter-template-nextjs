import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin } from "better-auth/plugins";
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
  ],
});

export type Auth = typeof auth;
