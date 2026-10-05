import { describe, it, expect } from "vitest";
import { computeLeadScore } from "@/lib/calculations/scoring";

describe("Lead Scoring & Qualification Algorithm", () => {
  it("qualifies high income leads with multiple gaps and 4 modules as HOT", () => {
    const result = computeLeadScore({
      incomeRange: "₱150,000 and above",
      initialSavings: 100000,
      monthlyContribution: 5000,
      years: 10,
      completedModulesCount: 4,
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.category).toBe("HOT");
  });

  it("qualifies middle-tier income leads as WARM", () => {
    const result = computeLeadScore({
      incomeRange: "₱30,000 - ₱50,000",
      initialSavings: 7000000,
      monthlyContribution: 5000,
      years: 10,
      completedModulesCount: 3,
    });

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThan(75);
    expect(result.category).toBe("WARM");
  });

  it("assigns COLD status for baseline minimal completion profiles", () => {
    const result = computeLeadScore({
      incomeRange: "Under ₱30,000",
      initialSavings: 10000000, // extremely high savings = minimal gap
      monthlyContribution: 50000,
      years: 20,
      completedModulesCount: 1,
    });

    expect(result.category).toBe("COLD");
  });
});
