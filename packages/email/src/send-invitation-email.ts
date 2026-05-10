import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { InvitationEmail } from "./templates/invitation-email";

export interface SendInvitationEmailInput {
  recipient: string;
  inviterName: string;
  organizationName: string;
  acceptUrl: string;
}

export async function sendInvitationEmail(
  input: SendInvitationEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Invitation for ${input.recipient} to ${input.organizationName}: ${input.acceptUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    InvitationEmail({
      inviterName: input.inviterName,
      organizationName: input.organizationName,
      acceptUrl: input.acceptUrl,
    }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `You've been invited to ${input.organizationName}`,
    html,
    text,
  });
}
