import { z } from "zod";

export const CreateContactStageSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
});

export const UpdateContactStageSchema = CreateContactStageSchema.partial();

export type CreateContactStageInput = z.infer<typeof CreateContactStageSchema>;
export type UpdateContactStageInput = z.infer<typeof UpdateContactStageSchema>;
