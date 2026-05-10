import { WelcomeAndVerifyEmail } from "@workspace/email/templates/welcome-and-verify-email";

export default function Preview() {
  return (
    <WelcomeAndVerifyEmail
      name="Jane Doe"
      verifyUrl="https://app.example.com/verify?token=abc123preview"
    />
  );
}
