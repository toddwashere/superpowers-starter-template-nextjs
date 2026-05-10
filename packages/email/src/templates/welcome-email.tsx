import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface WelcomeEmailProps {
  name: string;
  getStartedUrl: string;
}

export function WelcomeEmail({ name, getStartedUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome! Your account is ready.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Welcome, {name}!
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Your account is set up and ready to go.
      </Text>
      <Button
        href={getStartedUrl}
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
        Get Started
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {getStartedUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t create this account, please ignore this email.
      </Text>
    </EmailLayout>
  );
}
