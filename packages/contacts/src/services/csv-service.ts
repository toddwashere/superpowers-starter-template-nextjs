// packages/contacts/src/services/csv-service.ts
import Papa from "papaparse";

const CSV_COLUMNS = [
  "displayName",
  "kind",
  "firstName",
  "lastName",
  "companyName",
  "primaryEmail",
  "primaryPhone",
  "website",
  "source",
  "tags",
] as const;

export type CsvContactRow = {
  displayName: string;
  kind: "person" | "company";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  source?: string;
  tags?: string;
};

export type CsvRowError = { row: number; field: string; message: string };
export type CsvPreviewResult = {
  valid: CsvContactRow[];
  errors: CsvRowError[];
  duplicateWarnings: { row: number; email: string }[];
};

export function parseContactsCsv(csv: string): CsvPreviewResult {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const valid: CsvContactRow[] = [];
  const errors: CsvRowError[] = [];
  const seenEmails = new Set<string>();
  const duplicateWarnings: { row: number; email: string }[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const raw = parsed.data[i] ?? {};
    const row = i + 2; // 1-indexed + header row

    if (!raw["displayName"]?.trim()) {
      errors.push({ row, field: "displayName", message: "displayName is required" });
      continue;
    }

    const kind = raw["kind"]?.trim().toLowerCase();
    if (kind !== "person" && kind !== "company") {
      errors.push({ row, field: "kind", message: "kind must be 'person' or 'company'" });
      continue;
    }

    const email = raw["primaryEmail"]?.trim().toLowerCase();
    if (email) {
      if (seenEmails.has(email)) {
        duplicateWarnings.push({ row, email });
      }
      seenEmails.add(email);
    }

    valid.push({
      displayName: raw["displayName"].trim(),
      kind: kind as "person" | "company",
      firstName: raw["firstName"]?.trim() || undefined,
      lastName: raw["lastName"]?.trim() || undefined,
      companyName: raw["companyName"]?.trim() || undefined,
      primaryEmail: email || undefined,
      primaryPhone: raw["primaryPhone"]?.trim() || undefined,
      website: raw["website"]?.trim() || undefined,
      source: raw["source"]?.trim() || undefined,
      tags: raw["tags"]?.trim() || undefined,
    });
  }

  return { valid, errors, duplicateWarnings };
}

export function exportContactsToCsv(contacts: CsvContactRow[]): string {
  return Papa.unparse(contacts, { columns: [...CSV_COLUMNS] });
}
