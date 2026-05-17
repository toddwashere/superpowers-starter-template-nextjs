// packages/contacts/src/services/csv-service.test.ts
import { describe, it, expect } from "vitest";
import { parseContactsCsv, exportContactsToCsv } from "./csv-service";

const validCsv = `displayName,kind,firstName,lastName,primaryEmail
Jane Doe,person,Jane,Doe,jane@example.com
Acme Corp,company,,,`;

describe("parseContactsCsv", () => {
  it("parses valid rows into valid array", () => {
    const result = parseContactsCsv(validCsv);
    expect(result.valid).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it("reports error for missing displayName", () => {
    const csv = `displayName,kind\n,person`;
    const result = parseContactsCsv(csv);
    expect(result.errors[0]?.field).toBe("displayName");
  });

  it("reports error for invalid kind", () => {
    const csv = `displayName,kind\nJane,robot`;
    const result = parseContactsCsv(csv);
    expect(result.errors[0]?.field).toBe("kind");
  });

  it("warns about duplicate primary emails within the file", () => {
    const csv = `displayName,kind,primaryEmail\nA,person,same@x.com\nB,person,same@x.com`;
    const result = parseContactsCsv(csv);
    expect(result.duplicateWarnings).toHaveLength(1);
    expect(result.duplicateWarnings[0]?.email).toBe("same@x.com");
  });

  it("does not write any data (pure parse)", () => {
    const result = parseContactsCsv(validCsv);
    expect(result).not.toHaveProperty("created");
  });
});

describe("exportContactsToCsv", () => {
  it("produces a CSV string with a header row", () => {
    const csv = exportContactsToCsv([
      { displayName: "Jane", kind: "person", primaryEmail: "jane@example.com" },
    ]);
    expect(csv).toContain("displayName");
    expect(csv).toContain("Jane");
  });

  it("escapes commas inside field values", () => {
    const csv = exportContactsToCsv([
      { displayName: "Smith, John", kind: "person" },
    ]);
    expect(csv).toContain('"Smith, John"');
  });
});
