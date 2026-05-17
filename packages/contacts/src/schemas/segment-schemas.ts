import { z } from "zod";

export const CURRENT_FILTER_VERSION = 1;

export const ContactSegmentFilterSchemaV1 = z
  .object({
    search: z.string().optional(),
    kind: z.enum(["person", "company"]).optional(),
    stageId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    includeArchived: z.boolean().optional(),
  })
  .strict();

export type ContactSegmentFilterV1 = z.infer<typeof ContactSegmentFilterSchemaV1>;

export const CreateContactSegmentSchema = z.object({
  name: z.string().min(1).max(255),
  filters: ContactSegmentFilterSchemaV1,
  sortKey: z.string().default("displayName"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export const UpdateContactSegmentSchema = CreateContactSegmentSchema.partial();

export type CreateContactSegmentInput = z.infer<typeof CreateContactSegmentSchema>;
export type UpdateContactSegmentInput = z.infer<typeof UpdateContactSegmentSchema>;
