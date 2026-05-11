import { z } from "zod";

export const ApiKeyRecordSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  prefix: z.string().nullable(),
  configId: z.string().nullable(),
  enabled: z.boolean(),
  expiresAt: z.date().nullable(),
  lastRequest: z.date().nullable(),
  createdAt: z.date(),
  permissions: z.record(z.array(z.string())).nullable(),
});

export type ApiKeyRecord = z.infer<typeof ApiKeyRecordSchema>;

export const CreateApiKeyInputSchema = z.object({
  name: z.string().min(1),
  configId: z.enum(["org-keys", "user-keys"]),
  permissions: z.record(z.array(z.string())),
  expiresIn: z.number().nullable(),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInputSchema>;
