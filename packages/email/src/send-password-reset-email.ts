import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { PasswordResetEmail } from "./templates/password-reset-email";

export interface SendPasswordResetEmailInput {
  recipient: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Password reset for ${input.recipient}: ${input.resetUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    PasswordResetEmail({ name: input.name, resetUrl: input.resetUrl }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Reset your password",
    html,
    text,
  });
}
