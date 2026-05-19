import { describe, it, expect } from "vitest";
import { parseUserAgent } from "./parse-user-agent";

describe("parseUserAgent", () => {
  it("identifies Chrome on macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(parseUserAgent(ua)).toBe("Chrome on macOS");
  });

  it("identifies Firefox on Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0";
    expect(parseUserAgent(ua)).toBe("Firefox on Windows");
  });

  it("identifies Edge on Windows (not Chrome, despite containing Chrome in UA)", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
    expect(parseUserAgent(ua)).toBe("Edge on Windows");
  });

  it("returns 'Unknown device' for empty string", () => {
    expect(parseUserAgent("")).toBe("Unknown device");
  });
});
