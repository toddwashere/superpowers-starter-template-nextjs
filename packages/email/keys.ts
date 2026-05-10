import { z } from "zod";

const schema = z.object({
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("App <noreply@example.com>"),
});

export function keys() {
  return schema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  });
}
