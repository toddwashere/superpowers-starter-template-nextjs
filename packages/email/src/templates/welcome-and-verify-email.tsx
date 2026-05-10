import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface WelcomeAndVerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function WelcomeAndVerifyEmail({
  name,
  verifyUrl,
}: WelcomeAndVerifyEmailProps) {
  return (
    <EmailLayout preview="Welcome! Please verify your email address.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Welcome, {name}!
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Click the button below to verify your email address and get started.
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
        Verify &amp; Get Started
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {verifyUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t create an account, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
