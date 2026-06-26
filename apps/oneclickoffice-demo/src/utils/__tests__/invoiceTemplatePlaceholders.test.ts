import { describe, it, expect } from "vitest";
import { getAvailablePlaceholders } from "../invoiceTemplatePlaceholders";

describe("getAvailablePlaceholders", () => {
  it("returns base placeholders in both modes", () => {
    const two = getAvailablePlaceholders("two_level");
    const one = getAvailablePlaceholders("single_level");
    for (const token of [
      "{{invoice_number}}",
      "{{invoice_date}}",
      "{{company_name}}",
      "{{company_address}}",
      "{{time_entries}}",
    ]) {
      expect(two.map((p) => p.token)).toContain(token);
      expect(one.map((p) => p.token)).toContain(token);
    }
  });

  it("includes client placeholders in two_level", () => {
    const tokens = getAvailablePlaceholders("two_level").map((p) => p.token);
    expect(tokens).toContain("{{client_name}}");
    expect(tokens).toContain("{{client_first_name}}");
    expect(tokens).toContain("{{client_last_name}}");
  });

  it("excludes client placeholders in single_level", () => {
    const tokens = getAvailablePlaceholders("single_level").map((p) => p.token);
    expect(tokens).not.toContain("{{client_name}}");
    expect(tokens).not.toContain("{{client_first_name}}");
    expect(tokens).not.toContain("{{client_last_name}}");
  });
});
