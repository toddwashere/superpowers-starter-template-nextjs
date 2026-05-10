import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { WelcomeEmail } from "./templates/welcome-email";

export interface SendWelcomeEmailInput {
  recipient: string;
  name: string;
  getStartedUrl: string;
}

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Welcome email for ${input.recipient}: ${input.getStartedUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    WelcomeEmail({ name: input.name, getStartedUrl: input.getStartedUrl }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Welcome!",
    html,
    text,
  });
}
