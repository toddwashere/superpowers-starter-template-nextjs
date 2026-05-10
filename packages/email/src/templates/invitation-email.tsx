import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface InvitationEmailProps {
  inviterName: string;
  organizationName: string;
  acceptUrl: string;
}

export function InvitationEmail({
  inviterName,
  organizationName,
  acceptUrl,
}: InvitationEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to join ${organizationName}.`}
    >
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        You&apos;ve been invited!
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        {inviterName} has invited you to join <strong>{organizationName}</strong>.
        Click below to accept.
      </Text>
      <Button
        href={acceptUrl}
        style={{
          display: "block",
          backgroundColor: "#000",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "4px",
          fontWeight: "bold",
          textDecoration: "none",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Accept Invitation
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {acceptUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you weren&apos;t expecting an invitation, you can ignore this email.
      </Text>
    </EmailLayout>
  );
}
