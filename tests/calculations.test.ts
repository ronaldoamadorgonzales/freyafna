import { describe, it, expect } from "vitest";

describe("Pillar 1: Milestone Savings & TVM Compounding", () => {
  it("calculates compound savings growth correctly with monthly contributions", () => {
    const initialSavings = 100000;
    const monthlyContribution = 5000;
    const years = 10;
    const expectedReturn = 7.0; // 7% annual
    const monthlyRate = (expectedReturn / 100) / 12;

    let balance = initialSavings;
    for (let i = 1; i <= years; i++) {
      for (let m = 0; m < 12; m++) {
        balance = (balance + monthlyContribution) * (1 + monthlyRate);
      }
    }

    const projectedTotal = Math.round(balance);
    expect(projectedTotal).toBeGreaterThan(initialSavings + monthlyContribution * 12 * years);
    expect(projectedTotal).toBe(1071438); // Exact TVM ₱1.071M
  });
});

describe("Pillar 2: Retirement Needs & Inflation Compounding", () => {
  it("calculates retirement capitalization target using 4% inflation and 6% capitalization rate", () => {
    const clientAge = 30;
    const retirementAge = 60;
    const currentMonthlyExpenses = 50000;
    const yearsToRetire = retirementAge - clientAge; // 30 years

    // 4% inflation compounding over 30 years
    const futureAnnualExpenses = (currentMonthlyExpenses * 12) * Math.pow(1.04, yearsToRetire);
    
    // Living on interest at 6% rule
    const retirementTarget = futureAnnualExpenses / 0.06;
    
    expect(yearsToRetire).toBe(30);
    expect(Math.round(futureAnnualExpenses)).toBe(1946039); // ₱1.95M/yr
    expect(Math.round(retirementTarget)).toBe(32433975); // ~₱32.4M required corpus
  });

  it("calculates retirement sinking fund target (20-year principal depletion)", () => {
    const yearsToRetire = 30;
    const currentMonthlyExpenses = 50000;
    const futureAnnualExpenses = (currentMonthlyExpenses * 12) * Math.pow(1.04, yearsToRetire);
    const sinkingFundTarget = futureAnnualExpenses * 20;

    expect(Math.round(sinkingFundTarget)).toBe(38920770);
  });
});

describe("Pillar 3: Income Protection & Human Life Value", () => {
  it("computes net insurance protection gap taking liabilities and existing coverage into account", () => {
    const monthlyExpenses = 50000;
    const interestRate = 6; // 6% capitalization
    const amountNeededToProvide = (monthlyExpenses * 12) / (interestRate / 100); // ₱10M
    
    const liabilities = 200000;
    const emergencyFund = 100000;
    const finalExpenses = 50000;
    const totalLiabilities = liabilities + emergencyFund + finalExpenses; // ₱350k

    const existingCoverage = 1000000;
    const cashSavings = 200000;
    const totalAvailableAssets = existingCoverage + cashSavings; // ₱1.2M

    const totalNeed = amountNeededToProvide + totalLiabilities; // ₱10.35M
    const gap = Math.max(0, totalNeed - totalAvailableAssets);

    expect(amountNeededToProvide).toBe(10000000);
    expect(totalNeed).toBe(10350000);
    expect(gap).toBe(9150000); // ₱9.15M shortfall
  });
});

describe("Pillar 4: Education Fund with 8% Tuition Inflation", () => {
  it("calculates 4-year and 5-year college tuition targets inflating at 8% annually", () => {
    const childAge = 5;
    const annualTuitionCurrent = 100000;
    const yearsToCollege = 18 - childAge; // 13 years

    const t1 = annualTuitionCurrent * Math.pow(1.08, yearsToCollege);
    const t2 = annualTuitionCurrent * Math.pow(1.08, yearsToCollege + 1);
    const t3 = annualTuitionCurrent * Math.pow(1.08, yearsToCollege + 2);
    const t4 = annualTuitionCurrent * Math.pow(1.08, yearsToCollege + 3);
    const t5 = annualTuitionCurrent * Math.pow(1.08, yearsToCollege + 4);

    const target4Year = t1 + t2 + t3 + t4;
    const target5Year = t1 + t2 + t3 + t4 + t5;

    expect(yearsToCollege).toBe(13);
    expect(Math.round(t1)).toBe(271962); // ₱271.9k in year 1
    expect(Math.round(target4Year)).toBe(1225493); // ₱1.22M for 4 years
    expect(Math.round(target5Year)).toBe(1595495); // ₱1.59M for 5 years
  });
});

describe("Pillar 5: Health & Critical Illness Vulnerability", () => {
  it("calculates critical illness gap correctly", () => {
    const desiredHealthBuffer = 2000000;
    const existingHealthCoverage = 500000;
    const gap = Math.max(0, desiredHealthBuffer - existingHealthCoverage);

    expect(gap).toBe(1500000);
  });
});
