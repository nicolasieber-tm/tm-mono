import { describe, it, expect } from "vitest";
import { getEntityLabel } from "../hierarchyLabels";

describe("getEntityLabel", () => {
  it("returns 'Klient' singular in two_level", () => {
    expect(getEntityLabel("two_level").singular).toBe("Klient");
  });
  it("returns 'Klienten' plural in two_level", () => {
    expect(getEntityLabel("two_level").plural).toBe("Klienten");
  });
  it("returns 'Kunde' singular in single_level", () => {
    expect(getEntityLabel("single_level").singular).toBe("Kunde");
  });
  it("returns 'Kunden' plural in single_level", () => {
    expect(getEntityLabel("single_level").plural).toBe("Kunden");
  });
});
