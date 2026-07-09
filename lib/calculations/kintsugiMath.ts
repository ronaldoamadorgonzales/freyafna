/**
 * Project Kintsugi - Financial Needs Analysis Calculation Engines
 */

// 1. Insurance Protection comprehensive need (Formula 1)
export function calculateInsuranceProtection({
  monthlyExpenses,
  interestRate,
  liabilities,
  emergencyFund,
  finalExpenses,
  existingCoverage,
  savings,
}: {
  monthlyExpenses: number;
  interestRate: number;
  liabilities: number;
  emergencyFund: number;
  finalExpenses: number;
  existingCoverage: number;
  savings: number;
}) {
  const annualExpenses = monthlyExpenses * 12;
  const rateFraction = interestRate / 100;
  
  // Income replacement capital needed
  const amountNeededToProvide = rateFraction > 0 ? annualExpenses / rateFraction : 0;
  const totalLiabilities = liabilities + emergencyFund + finalExpenses;
  const totalCashAssets = existingCoverage + savings;
  
  const targetFund = (amountNeededToProvide + totalLiabilities) - totalCashAssets;
  
  return {
    annualExpenses,
    amountNeededToProvide,
    totalLiabilities,
    totalCashAssets,
    targetFund: Math.max(0, targetFund),
  };
}

// 2. Future Value of an Ordinary Annuity (Savings projections / Retirement)
export function calculateFutureValueAnnuity({
  pmt,
  rate,
  periods,
  presentValue = 0,
}: {
  pmt: number;
  rate: number; // annual rate fraction (e.g. 0.08)
  periods: number; // total periods (e.g. years)
  presentValue?: number;
}) {
  if (rate === 0) {
    return presentValue + (pmt * periods);
  }
  const fvLumpSum = presentValue * Math.pow(1 + rate, periods);
  const fvAnnuity = pmt * ((Math.pow(1 + rate, periods) - 1) / rate);
  return fvLumpSum + fvAnnuity;
}

// 3. Health protection shortfall
export function calculateHealthShortfall({
  desiredCoverage = 2000000, // PHP 2M default
  existingCoverage,
}: {
  desiredCoverage?: number;
  existingCoverage: number;
}) {
  const shortfall = desiredCoverage - existingCoverage;
  return {
    desiredCoverage,
    existingCoverage,
    shortfall: Math.max(0, shortfall),
  };
}
