import { describe, expect, it } from "vitest";
import {
  SALUTATION_NONE_VALUE,
  formatSalutationLetter,
  normalizeSalutationInput,
} from "@/utils/salutation";

describe("formatSalutationLetter", () => {
  it("formats known salutations for letter openings", () => {
    expect(formatSalutationLetter("Herr")).toBe("Sehr geehrter Herr");
    expect(formatSalutationLetter("Frau")).toBe("Sehr geehrte Frau");
    expect(formatSalutationLetter("Divers")).toBe("Guten Tag");
  });

  it("returns empty string for missing or invalid values", () => {
    expect(formatSalutationLetter(null)).toBe("");
    expect(formatSalutationLetter(undefined)).toBe("");
    expect(formatSalutationLetter("")).toBe("");
    expect(formatSalutationLetter("Dr.")).toBe("");
  });
});

describe("normalizeSalutationInput", () => {
  it("normalizes empty, sentinel, and invalid values to null", () => {
    expect(normalizeSalutationInput(SALUTATION_NONE_VALUE)).toBeNull();
    expect(normalizeSalutationInput("")).toBeNull();
    expect(normalizeSalutationInput(" ")).toBeNull();
    expect(normalizeSalutationInput("Dr.")).toBeNull();
  });

  it("keeps valid salutation enum values", () => {
    expect(normalizeSalutationInput("Herr")).toBe("Herr");
    expect(normalizeSalutationInput("Frau")).toBe("Frau");
    expect(normalizeSalutationInput("Divers")).toBe("Divers");
  });
});
