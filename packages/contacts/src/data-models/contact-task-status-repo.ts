import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactTaskStatusInput, UpdateContactTaskStatusInput } from "../schemas/task-schemas";

export async function listContactTaskStatusesForOrg(organizationId: string) {
  return prisma.contactTaskStatus.findMany({
    where: { organizationId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getContactTaskStatusById(statusId: string, organizationId: string) {
  return prisma.contactTaskStatus.findFirst({ where: { id: statusId, organizationId } });
}

export async function createContactTaskStatus(
  organizationId: string,
  data: CreateContactTaskStatusInput,
) {
  return prisma.contactTaskStatus.create({
    data: { id: createId("ctstatus"), organizationId, ...data },
  });
}

export async function updateContactTaskStatus(
  statusId: string,
  organizationId: string,
  data: UpdateContactTaskStatusInput,
) {
  return prisma.contactTaskStatus.update({ where: { id: statusId, organizationId }, data });
}

export async function deleteContactTaskStatus(statusId: string, organizationId: string) {
  return prisma.contactTaskStatus.delete({ where: { id: statusId, organizationId } });
}
