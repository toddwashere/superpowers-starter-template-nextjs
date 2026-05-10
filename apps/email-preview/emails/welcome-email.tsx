import { WelcomeEmail } from "@workspace/email/templates/welcome-email";

export default function Preview() {
  return (
    <WelcomeEmail
      name="Jane Doe"
      getStartedUrl="https://app.example.com/dashboard"
    />
  );
}
