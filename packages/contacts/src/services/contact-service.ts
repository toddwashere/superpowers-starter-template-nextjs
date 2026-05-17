import {
  createContact,
  updateContact,
  getContactById,
} from "../data-models/contact-repo";
import type { CreateContactInput, UpdateContactInput } from "../schemas/contact-schemas";

export async function createContactWithValidation(
  organizationId: string,
  data: CreateContactInput,
) {
  if (data.parentContactId) {
    const parent = await getContactById(data.parentContactId, organizationId);
    if (!parent) throw new Error("Parent contact not found in this organization");
  }
  return createContact(organizationId, data);
}

export async function updateContactWithValidation(
  contactId: string,
  organizationId: string,
  data: UpdateContactInput,
) {
  if (data.parentContactId !== undefined && data.parentContactId !== null) {
    // Self-parenting check — no DB round-trip needed
    if (data.parentContactId === contactId) {
      throw new Error("A contact cannot be its own parent");
    }

    // Fetch proposed parent once; validates existence and provides chain root
    const parent = await getContactById(data.parentContactId, organizationId);
    if (!parent) throw new Error("Parent contact not found in this organization");

    // Walk the parent's ancestry to detect cycles
    const MAX_DEPTH = 50;
    let depth = 0;
    const visited = new Set<string>();
    let current: string | null = parent.parentContactId ?? null;
    while (current) {
      if (++depth > MAX_DEPTH) {
        throw new Error("Parent chain too deep — possible data corruption");
      }
      if (visited.has(current)) break;
      visited.add(current);
      if (current === contactId) {
        throw new Error("Setting this parent would create a cycle");
      }
      const node = await getContactById(current, organizationId);
      current = node?.parentContactId ?? null;
    }
  }
  return updateContact(contactId, organizationId, data);
}
