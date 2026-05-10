import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface EmailChangeVerificationEmailProps {
  name: string;
  verifyUrl: string;
}

export function EmailChangeVerificationEmail({
  name,
  verifyUrl,
}: EmailChangeVerificationEmailProps) {
  return (
    <EmailLayout preview="Confirm your new email address.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Hi, {name}
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Click below to confirm your new email address.
      </Text>
      <Button
        href={verifyUrl}
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
        Confirm New Email
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {verifyUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t request an email change, please ignore this email.
      </Text>
    </EmailLayout>
  );
}
