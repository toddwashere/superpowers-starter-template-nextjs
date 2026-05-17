import { z } from "zod";

export const InteractionTypeSchema = z.enum([
  "note",
  "call",
  "email",
  "meeting",
  "sms",
  "other",
]);
export type InteractionType = z.infer<typeof InteractionTypeSchema>;

export const CreateContactInteractionSchema = z.object({
  contactId: z.string(),
  type: InteractionTypeSchema.default("note"),
  body: z.string().min(1),
  happenedAt: z.coerce.date().optional(),
});

export const UpdateContactInteractionSchema = CreateContactInteractionSchema.partial();

export type CreateContactInteractionInput = z.infer<typeof CreateContactInteractionSchema>;
export type UpdateContactInteractionInput = z.infer<typeof UpdateContactInteractionSchema>;
