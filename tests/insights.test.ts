import { describe, it, expect } from "vitest";
import { generateCannedInsights } from "@/lib/calculations/insights";

describe("Canned Insights & VIP Strategy Brief Generation", () => {
  it("assigns Family Anchor persona when lead has dependents and protection gap", () => {
    const insights = generateCannedInsights({
      leadName: "Juan Dela Cruz",
      age: 35,
      monthlyIncomeRange: "₱50,000 - ₱100,000",
      dependentsCount: 2,
      maritalStatus: "MARRIED",
      currentSavings: 150000,
      retirementAgeGoal: 60,
      monthlyContribution: 5000,
      years: 10,
      protExpenses: 60000,
      protLiabilities: 300000,
      protExisting: 500000,
    });

    expect(insights.personaTitle).toContain("Family Anchor");
    expect(insights.protectionAnalysis.netGap).toBeGreaterThan(0);
    expect(insights.healthGrade).toBeDefined();
    expect(insights.priorityRoadmap).toHaveLength(3);
    expect(insights.stressTestMatrix).toHaveLength(3);
  });

  it("generates 3 inflation stress-test scenarios (3%, 5%, 8%)", () => {
    const insights = generateCannedInsights({
      leadName: "Maria Clara",
      age: 28,
      monthlyIncomeRange: "₱100,000 - ₱150,000",
      dependentsCount: 0,
      maritalStatus: "SINGLE",
      currentSavings: 300000,
      retirementAgeGoal: 55,
      retExpenses: 50000,
    });

    const rates = insights.stressTestMatrix.map(m => m.inflationRate);
    expect(rates).toEqual([3, 5, 8]);

    // Ensure 8% inflation results in higher corpus than 3% inflation
    const corpus3 = insights.stressTestMatrix[0].targetCorpusNeeded;
    const corpus8 = insights.stressTestMatrix[2].targetCorpusNeeded;
    expect(corpus8).toBeGreaterThan(corpus3);
  });

  it("omits education analysis when lead has no dependents or education is skipped", () => {
    const insights = generateCannedInsights({
      leadName: "Single Professional",
      age: 26,
      monthlyIncomeRange: "₱30,000 - ₱50,000",
      dependentsCount: 0,
      maritalStatus: "SINGLE",
      currentSavings: 50000,
      retirementAgeGoal: 60,
      includeEducation: false,
    });

    expect(insights.educationAnalysis).toBeUndefined();
    expect(insights.priorityRoadmap.some(s => s.title.includes("Education"))).toBe(false);
  });
});
