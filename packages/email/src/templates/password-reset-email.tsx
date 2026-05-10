import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Hi, {name}
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Click the button below to reset your password. This link expires in 1 hour.
      </Text>
      <Button
        href={resetUrl}
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
        Reset Password
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {resetUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t request a password reset, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
