import { EmailChangeVerificationEmail } from "@workspace/email/templates/email-change-verification-email";

export default function Preview() {
  return (
    <EmailChangeVerificationEmail
      name="Jane Doe"
      verifyUrl="https://app.example.com/verify?token=xyz789preview"
    />
  );
}
