import { z } from "zod";

export const TaskPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const CreateContactTaskSchema = z.object({
  contactId: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  statusId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: TaskPrioritySchema.default("normal"),
  dueAt: z.coerce.date().optional(),
  sortOrder: z.number().int().default(0),
});

export const UpdateContactTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  statusId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: TaskPrioritySchema.optional(),
  dueAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const CreateContactTaskStatusSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
  isTerminal: z.boolean().default(false),
});

export const UpdateContactTaskStatusSchema = CreateContactTaskStatusSchema.partial();

export type CreateContactTaskInput = z.infer<typeof CreateContactTaskSchema>;
export type UpdateContactTaskInput = z.infer<typeof UpdateContactTaskSchema>;
export type CreateContactTaskStatusInput = z.infer<typeof CreateContactTaskStatusSchema>;
export type UpdateContactTaskStatusInput = z.infer<typeof UpdateContactTaskStatusSchema>;
