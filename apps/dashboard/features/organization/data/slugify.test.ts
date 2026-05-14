import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases input", () => {
    expect(slugify("Acme Inc")).toBe("acme-inc");
  });

  it("replaces spaces with dashes", () => {
    expect(slugify("my org name")).toBe("my-org-name");
  });

  it("strips special characters", () => {
    expect(slugify("This is an org 4 u!!!")).toBe("this-is-an-org-4-u");
  });

  it("collapses multiple dashes into one", () => {
    expect(slugify("foo---bar")).toBe("foo-bar");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("--foo-bar--")).toBe("foo-bar");
  });

  it("replaces underscores with dashes", () => {
    expect(slugify("foo_bar")).toBe("foo-bar");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("handles mixed special characters and spaces", () => {
    expect(slugify("  Hello, World! @#$ ")).toBe("hello-world");
  });

  it("produces valid slug from typical org name", () => {
    const result = slugify("thereis");
    expect(result).toBe("thereis");
  });

  it("handles numbers in names", () => {
    expect(slugify("Team 42")).toBe("team-42");
  });
});
