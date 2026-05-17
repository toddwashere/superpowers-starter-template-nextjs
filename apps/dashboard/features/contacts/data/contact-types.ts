import { z } from "zod";

export const ContactFormSchema = z.object({
  kind: z.enum(["person", "company"]),
  displayName: z.string().min(1, "Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  primaryEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  primaryPhone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  parentContactId: z.string().optional(),
  stageId: z.string().optional(),
  source: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
