import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactStageInput, UpdateContactStageInput } from "../schemas/stage-schemas";

export async function listContactStagesForOrg(organizationId: string) {
  return prisma.contactStage.findMany({
    where: { organizationId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getContactStageById(stageId: string, organizationId: string) {
  return prisma.contactStage.findFirst({ where: { id: stageId, organizationId } });
}

export async function createContactStage(
  organizationId: string,
  data: CreateContactStageInput,
) {
  return prisma.contactStage.create({
    data: { id: createId("cstage"), organizationId, ...data },
  });
}

export async function updateContactStage(
  stageId: string,
  organizationId: string,
  data: UpdateContactStageInput,
) {
  return prisma.contactStage.update({ where: { id: stageId, organizationId }, data });
}

export async function deleteContactStage(stageId: string, organizationId: string) {
  return prisma.contactStage.delete({ where: { id: stageId, organizationId } });
}
