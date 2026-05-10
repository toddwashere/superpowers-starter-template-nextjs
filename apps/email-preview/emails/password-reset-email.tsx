import { PasswordResetEmail } from "@workspace/email/templates/password-reset-email";

export default function Preview() {
  return (
    <PasswordResetEmail
      name="Jane Doe"
      resetUrl="https://app.example.com/reset?token=qrs456preview"
    />
  );
}
