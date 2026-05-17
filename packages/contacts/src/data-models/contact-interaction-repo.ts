import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactInteractionInput, UpdateContactInteractionInput } from "../schemas/interaction-schemas";

export async function listContactInteractions(
  contactId: string,
  organizationId: string,
  limit = 50,
) {
  return prisma.contactInteraction.findMany({
    where: { contactId, organizationId },
    orderBy: { happenedAt: "desc" },
    take: limit,
  });
}

export async function createContactInteraction(
  contactId: string,
  organizationId: string,
  createdById: string,
  data: CreateContactInteractionInput,
) {
  return prisma.contactInteraction.create({
    data: {
      id: createId("cint"),
      contactId,
      organizationId,
      createdById,
      type: data.type ?? "note",
      body: data.body,
      happenedAt: data.happenedAt ?? new Date(),
    },
  });
}

export async function updateContactInteraction(
  interactionId: string,
  organizationId: string,
  data: UpdateContactInteractionInput,
) {
  return prisma.contactInteraction.update({
    where: { id: interactionId, organizationId },
    data,
  });
}

export async function deleteContactInteraction(interactionId: string, organizationId: string) {
  return prisma.contactInteraction.delete({ where: { id: interactionId, organizationId } });
}
