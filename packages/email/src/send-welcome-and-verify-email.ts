import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { WelcomeAndVerifyEmail } from "./templates/welcome-and-verify-email";

export interface SendWelcomeAndVerifyEmailInput {
  recipient: string;
  name: string;
  verifyUrl: string;
}

export async function sendWelcomeAndVerifyEmail(
  input: SendWelcomeAndVerifyEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Welcome & verify for ${input.recipient}: ${input.verifyUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    WelcomeAndVerifyEmail({ name: input.name, verifyUrl: input.verifyUrl }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Welcome! Please verify your email",
    html,
    text,
  });
}
