import { sendWelcomeAndVerifyEmail } from "@workspace/email/send-welcome-and-verify-email";
import { sendEmailChangeVerificationEmail } from "@workspace/email/send-email-change-verification-email";

export async function routeVerificationEmail({
  user,
  url,
}: {
  user: { email: string; name: string; emailVerified: boolean };
  url: string;
}): Promise<void> {
  if (user.emailVerified) {
    await sendEmailChangeVerificationEmail({
      recipient: user.email,
      name: user.name,
      verifyUrl: url,
    });
  } else {
    await sendWelcomeAndVerifyEmail({
      recipient: user.email,
      name: user.name,
      verifyUrl: url,
    });
  }
}
