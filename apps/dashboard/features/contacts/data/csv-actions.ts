"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  parseContactsCsv,
  exportContactsToCsv,
  createContactWithValidation,
  listContactsForOrg,
} from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function previewCsvImportAction(
  csvText: string,
): Promise<ActionResult<Awaited<ReturnType<typeof parseContactsCsv>>>> {
  try {
    await requireOrgPermissionWithActiveOrg({});
    const result = parseContactsCsv(csvText);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to parse CSV" };
  }
}

export async function commitCsvImportAction(
  csvText: string,
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const { valid } = parseContactsCsv(csvText);
    // Best-effort: import each row independently so one failure doesn't block the rest.
    let imported = 0;
    let skipped = 0;
    for (const row of valid) {
      try {
        await createContactWithValidation(activeOrganizationId, {
          kind: row.kind,
          displayName: row.displayName,
          firstName: row.firstName,
          lastName: row.lastName,
          companyName: row.companyName,
          primaryEmail: row.primaryEmail,
          primaryPhone: row.primaryPhone,
          website: row.website,
          source: row.source,
        });
        imported++;
      } catch {
        skipped++;
      }
    }
    return { success: true, data: { imported, skipped } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Import failed" };
  }
}

export async function exportContactsCsvAction(): Promise<ActionResult<string>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const contacts = await listContactsForOrg(activeOrganizationId, { pageSize: 5000 });
    const csv = exportContactsToCsv(
      contacts.map((c) => ({
        displayName: c.displayName,
        kind: c.kind as "person" | "company",
        firstName: c.firstName ?? undefined,
        lastName: c.lastName ?? undefined,
        companyName: c.companyName ?? undefined,
        primaryEmail: c.primaryEmail ?? undefined,
        primaryPhone: c.primaryPhone ?? undefined,
        website: c.website ?? undefined,
        source: c.source ?? undefined,
      })),
    );
    return { success: true, data: csv };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Export failed" };
  }
}
