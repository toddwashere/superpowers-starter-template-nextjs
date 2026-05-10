import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { EmailChangeVerificationEmail } from "./templates/email-change-verification-email";

export interface SendEmailChangeVerificationEmailInput {
  recipient: string;
  name: string;
  verifyUrl: string;
}

export async function sendEmailChangeVerificationEmail(
  input: SendEmailChangeVerificationEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Email change verify for ${input.recipient}: ${input.verifyUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    EmailChangeVerificationEmail({
      name: input.name,
      verifyUrl: input.verifyUrl,
    }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Confirm your new email address",
    html,
    text,
  });
}
