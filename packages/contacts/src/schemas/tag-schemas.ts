import { z } from "zod";

export const CreateContactTagSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

export const UpdateContactTagSchema = CreateContactTagSchema.partial();

export type CreateContactTagInput = z.infer<typeof CreateContactTagSchema>;
export type UpdateContactTagInput = z.infer<typeof UpdateContactTagSchema>;
