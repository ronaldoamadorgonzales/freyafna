import { calculateInsuranceProtection, calculateHealthShortfall } from "./kintsugiMath";

interface LeadProfileInput {
  incomeRange: string;
  initialSavings: number;
  monthlyContribution: number;
  years: number;
  completedModulesCount: number;
  [key: string]: any;
}

export function computeLeadScore(profile: LeadProfileInput): {
  score: number;
  category: "HOT" | "WARM" | "COLD";
} {
  let score = 0;
  let mockMonthlyIncome = 35000; // default for low tier

  // Robust parsing in order of priority to avoid overlapping substrings
  const income = profile.incomeRange;
  
  if (
    income.includes("150,000") || 
    income.includes("150k") || 
    income.includes("100,000") || 
    income.includes("100k")
  ) {
    // ₱100,000+ tier
    score += 30;
    mockMonthlyIncome = 150000;
  } else if (
    (income.includes("50,000") && !income.includes("30,000")) || 
    income.includes("50k")
  ) {
    // ₱50,000 - ₱100,000 tier
    score += 20;
    mockMonthlyIncome = 75000;
  } else {
    // Under ₱50,000 tier
    score += 10;
    mockMonthlyIncome = 35000;
  }

  // 2. Financial Gaps Points (Max 40)
  const mockMonthlyExpenses = mockMonthlyIncome * 0.7; // assume 70% expenses

  const insuranceNeed = calculateInsuranceProtection({
    monthlyExpenses: mockMonthlyExpenses,
    interestRate: 6,
    liabilities: 200000,
    emergencyFund: 100000,
    finalExpenses: 50000,
    existingCoverage: 1000000,
    savings: profile.initialSavings,
  });

  const healthNeed = calculateHealthShortfall({
    desiredCoverage: 2000000,
    existingCoverage: 500005, // 500,005
  });

  const projectedRetirementSavings = profile.initialSavings + (profile.monthlyContribution * 12 * 20);
  const retirementGap = Math.max(0, 12000000 - projectedRetirementSavings);

  const totalGaps = insuranceNeed.targetFund + healthNeed.shortfall + retirementGap;

  if (totalGaps > 5000000) {
    score += 40;
  } else if (totalGaps >= 1000000) {
    score += 25;
  } else if (totalGaps > 0) {
    score += 10;
  }

  // 3. Completed Modules Points (Max 30)
  const modules = profile.completedModulesCount;
  if (modules >= 4) {
    score += 30;
  } else if (modules >= 2) {
    score += 20;
  } else {
    score += 10;
  }

  // Determine Category
  let category: "HOT" | "WARM" | "COLD" = "COLD";
  if (score >= 75) {
    category = "HOT";
  } else if (score >= 50) {
    category = "WARM";
  }

  return { score, category };
}
