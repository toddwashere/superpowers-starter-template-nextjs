import { z } from "zod";

export const ContactKindSchema = z.enum(["person", "company"]);
export type ContactKind = z.infer<typeof ContactKindSchema>;

export const ContactStatusSchema = z.enum(["active", "inactive"]);

export const CreateContactSchema = z.object({
  kind: ContactKindSchema,
  displayName: z.string().min(1).max(255),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  companyName: z.string().max(255).optional(),
  primaryEmail: z.string().email().optional(),
  primaryPhone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  parentContactId: z.string().optional(),
  stageId: z.string().optional(),
  ownerId: z.string().optional(),
  source: z.string().max(100).optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const ContactListFiltersSchema = z.object({
  search: z.string().optional(),
  kind: ContactKindSchema.optional(),
  stageId: z.string().optional(),
  tagId: z.string().optional(),
  includeArchived: z.boolean().default(false),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type ContactListFilters = z.infer<typeof ContactListFiltersSchema>;
