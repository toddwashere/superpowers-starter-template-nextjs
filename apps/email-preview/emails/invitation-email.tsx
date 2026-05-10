import { InvitationEmail } from "@workspace/email/templates/invitation-email";

export default function Preview() {
  return (
    <InvitationEmail
      inviterName="Bob Smith"
      organizationName="Acme Inc"
      acceptUrl="https://app.example.com/accept-invitation/inv_preview123"
    />
  );
}
