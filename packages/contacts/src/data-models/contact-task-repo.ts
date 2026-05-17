import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactTaskInput, UpdateContactTaskInput } from "../schemas/task-schemas";

type TaskFilters = {
  statusId?: string;
  assigneeId?: string;
};

export async function listContactTasksForOrg(organizationId: string, filters: TaskFilters = {}) {
  return prisma.contactTask.findMany({
    where: {
      organizationId,
      archivedAt: null,
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    include: { status: true, contact: { select: { id: true, displayName: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function listContactTasksForContact(contactId: string, organizationId: string) {
  return prisma.contactTask.findMany({
    where: { contactId, organizationId, archivedAt: null },
    include: { status: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getContactTaskById(taskId: string, organizationId: string) {
  return prisma.contactTask.findFirst({
    where: { id: taskId, organizationId },
    include: { status: true },
  });
}

export async function createContactTask(
  organizationId: string,
  createdById: string,
  data: CreateContactTaskInput,
) {
  return prisma.contactTask.create({
    data: { id: createId("ctask"), organizationId, createdById, ...data },
    include: { status: true },
  });
}

export async function updateContactTask(
  taskId: string,
  organizationId: string,
  data: UpdateContactTaskInput,
) {
  return prisma.contactTask.update({
    where: { id: taskId, organizationId },
    data,
    include: { status: true },
  });
}

export async function archiveContactTask(taskId: string, organizationId: string) {
  return prisma.contactTask.update({
    where: { id: taskId, organizationId },
    data: { archivedAt: new Date() },
  });
}
