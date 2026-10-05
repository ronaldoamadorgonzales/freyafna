export interface LeadInsightsInput {
  leadName: string;
  age: number;
  monthlyIncomeRange: string;
  dependentsCount: number;
  maritalStatus: string;
  currentSavings: number;
  retirementAgeGoal: number;
  monthlyContribution?: number;
  years?: number;
  
  // Optional pillar overrides
  protExpenses?: number;
  protInterest?: number;
  protLiabilities?: number;
  protEmergency?: number;
  protFinal?: number;
  protExisting?: number;

  retExpenses?: number;
  retPension?: number;

  childName?: string;
  childAge?: number;
  annualTuition?: number;
  includeEducation?: boolean;

  desiredHealth?: number;
  existingHealth?: number;
}

export interface CannedInsightsResult {
  personaTitle: string;
  personaSummary: string;
  healthGrade: string;
  leadScore: number;
  urgencyLevel: "HIGH" | "MODERATE" | "LOW";

  // Financial Diagnostics
  protectionAnalysis: {
    targetNeed: number;
    existingAssets: number;
    netGap: number;
    yearsOfExpenseCoverage: number;
    insightSummary: string;
  };

  retirementAnalysis: {
    yearsToRetire: number;
    futureMonthlyExpenses: number;
    targetCorpus: number;
    projectedAccumulation: number;
    netShortfall: number;
    insightSummary: string;
  };

  educationAnalysis?: {
    childName: string;
    yearsToCollege: number;
    projected4YearCost: number;
    netGap: number;
    insightSummary: string;
  };

  stressTestMatrix: Array<{
    inflationRate: number;
    futureRetirementMonthlyCost: number;
    targetCorpusNeeded: number;
    impactLabel: string;
  }>;

  priorityRoadmap: Array<{
    step: number;
    title: string;
    timeline: string;
    targetAmount: number;
    recommendation: string;
    urgency: "CRITICAL" | "HIGH" | "MEDIUM";
  }>;

  advisorTalkingPoints: string[];
}

export function generateCannedInsights(data: LeadInsightsInput): CannedInsightsResult {
  const age = Number(data.age || 30);
  const retAge = Number(data.retirementAgeGoal || 60);
  const savings = Number(data.currentSavings || 0);
  const dependents = Number(data.dependentsCount || 0);
  const monthlyContrib = Number(data.monthlyContribution || 5000);
  const years = Number(data.years || 10);

  const protExpenses = Number(data.protExpenses || 50000);
  const protInterest = Number(data.protInterest || 6);
  const protLiabilities = Number(data.protLiabilities || 200000);
  const protEmergency = Number(data.protEmergency || 100000);
  const protFinal = Number(data.protFinal || 50000);
  const protExisting = Number(data.protExisting || 1000000);

  const retExpenses = Number(data.retExpenses || 50000);
  const retPension = Number(data.retPension || 0);

  const childName = data.childName || "Junior";
  const childAge = Number(data.childAge || 5);
  const annualTuition = Number(data.annualTuition || 100000);

  const desiredHealth = Number(data.desiredHealth || 2000000);
  const existingHealth = Number(data.existingHealth || 500000);

  // 1. Protection Gap Calculations
  const amountNeededToProvide = (protExpenses * 12) / (protInterest / 100);
  const totalLiabilities = protLiabilities + protEmergency + protFinal;
  const totalCashAssets = protExisting + savings;
  const targetProtectionNeed = amountNeededToProvide + totalLiabilities;
  const netProtectionGap = Math.max(0, targetProtectionNeed - totalCashAssets);
  const yearsCoverage = totalCashAssets > 0 ? (totalCashAssets / (protExpenses * 12)) : 0;

  // 2. Retirement Calculations
  const yearsToRetire = Math.max(0, retAge - age);
  const futureMonthlyRetExpenses = retExpenses * Math.pow(1.04, yearsToRetire);
  const futureAnnualRetExpenses = futureMonthlyRetExpenses * 12;
  const targetRetCorpus = futureAnnualRetExpenses / 0.06;
  const pensionLumpSum = (retPension * 12) / 0.06;
  
  // Future accumulation estimate (7% return over yearsToRetire)
  const rMonthly = 0.07 / 12;
  const nMonths = yearsToRetire * 12;
  const fvSavings = savings * Math.pow(1.07, yearsToRetire);
  const fvContrib = nMonths > 0 ? monthlyContrib * ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) : 0;
  const projectedAccumulation = Math.round(fvSavings + fvContrib);
  const netRetirementShortfall = Math.max(0, targetRetCorpus - pensionLumpSum - projectedAccumulation);

  // 3. Education Calculations (if child age < 18)
  const yearsToCollege = Math.max(0, 18 - childAge);
  const t1 = annualTuition * Math.pow(1.08, yearsToCollege);
  const t2 = annualTuition * Math.pow(1.08, yearsToCollege + 1);
  const t3 = annualTuition * Math.pow(1.08, yearsToCollege + 2);
  const t4 = annualTuition * Math.pow(1.08, yearsToCollege + 3);
  const projected4YearCost = Math.round(t1 + t2 + t3 + t4);
  const netEducationGap = Math.max(0, projected4YearCost - 120000);

  // 4. Stress Test Matrix
  const stressRates = [
    { rate: 0.03, label: "Conservative (3% Inflation)" },
    { rate: 0.05, label: "Moderate Baseline (5% Inflation)" },
    { rate: 0.08, label: "High Inflation Stress (8% Inflation)" },
  ];

  const stressTestMatrix = stressRates.map((s) => {
    const cost = Math.round(retExpenses * Math.pow(1 + s.rate, yearsToRetire));
    const corpus = Math.round((cost * 12) / 0.06);
    return {
      inflationRate: s.rate * 100,
      futureRetirementMonthlyCost: cost,
      targetCorpusNeeded: corpus,
      impactLabel: s.label,
    };
  });

  // 5. Persona & Narrative
  let personaTitle = "Forward Wealth Builder";
  let personaSummary = `${data.leadName}, at age ${age} with a goal retirement age of ${retAge}, you are in a key accumulation phase. Building proactive protection safeguards and disciplined compounding will protect your family's future standard of living.`;
  let healthGrade = "B+";
  let urgencyLevel: "HIGH" | "MODERATE" | "LOW" = "MODERATE";

  if (netProtectionGap > 3000000 || dependents >= 2) {
    personaTitle = "Family Anchor & Protection Seeker";
    personaSummary = `As a primary provider supporting ${dependents} dependent(s), safeguarding your family against unexpected income loss is your highest tactical priority.`;
    healthGrade = "B-";
    urgencyLevel = "HIGH";
  } else if (yearsToRetire <= 10 && netRetirementShortfall > 2000000) {
    personaTitle = "Pre-Retirement Capital Preserver";
    personaSummary = `With ${yearsToRetire} years remaining until your target retirement age, accelerating corpus building and inflation-proofing cash reserves is critical.`;
    healthGrade = "C+";
    urgencyLevel = "HIGH";
  } else if (netProtectionGap < 1000000 && netRetirementShortfall < 1000000) {
    personaTitle = "Disciplined Wealth Multiplier";
    personaSummary = `Your baseline protection metrics are sturdy. Your focus is optimizing tax-advantaged growth and legacy distribution.`;
    healthGrade = "A";
    urgencyLevel = "LOW";
  }

  // 6. Priority Roadmap
  const priorityRoadmap: CannedInsightsResult["priorityRoadmap"] = [];

  // Step 1: Emergency & Health Buffer
  const efTarget = protExpenses * 6;
  const efGap = Math.max(0, efTarget - savings);
  priorityRoadmap.push({
    step: 1,
    title: "Liquid Emergency & Critical Health Reserve",
    timeline: "Months 1 – 6",
    targetAmount: efGap > 0 ? efGap : efTarget,
    recommendation: `Lock in a guaranteed 6-month buffer of ₱${efTarget.toLocaleString()} and bridge the ₱${Math.max(0, desiredHealth - existingHealth).toLocaleString()} critical illness gap.`,
    urgency: efGap > 0 ? "CRITICAL" : "MEDIUM",
  });

  // Step 2: Income Protection Gap
  if (netProtectionGap > 0) {
    priorityRoadmap.push({
      step: 2,
      title: "Family Income & Liability Shield",
      timeline: "Months 3 – 12",
      targetAmount: netProtectionGap,
      recommendation: `Establish guaranteed term or VUL life protection of ₱${netProtectionGap.toLocaleString()} to ensure ${yearsCoverage.toFixed(1)} years of full expense coverage for your dependents.`,
      urgency: "HIGH",
    });
  }

  // Step 3: Compounding Retirement Corpus
  if (netRetirementShortfall > 0) {
    const roundedShortfall = Math.round(netRetirementShortfall);
    priorityRoadmap.push({
      step: 3,
      title: "Inflation-Proof Retirement Corpus Acceleration",
      timeline: "Year 1 and Ongoing",
      targetAmount: roundedShortfall,
      recommendation: `Target a monthly allocation to close the ₱${roundedShortfall.toLocaleString()} retirement shortfall before age ${retAge}.`,
      urgency: "MEDIUM",
    });
  }

  // Talking points for advisor
  const shouldIncludeEdu = data.includeEducation !== false && dependents > 0;
  const advisorTalkingPoints = [
    `Current liquid savings cover approximately ${(savings / (protExpenses || 1)).toFixed(1)} months of baseline living expenses.`,
    `Family income protection gap of ₱${netProtectionGap.toLocaleString()} requires immediate policy review.`,
    ...(shouldIncludeEdu ? [`Projected college inflation will elevate annual tuition to ₱${Math.round(t1).toLocaleString()} by age 18.`] : []),
    `Retirement living expenses will increase from ₱${retExpenses.toLocaleString()}/mo to ₱${Math.round(futureMonthlyRetExpenses).toLocaleString()}/mo due to inflation.`,
  ];

  return {
    personaTitle,
    personaSummary,
    healthGrade,
    leadScore: urgencyLevel === "HIGH" ? 85 : urgencyLevel === "MODERATE" ? 65 : 45,
    urgencyLevel,
    protectionAnalysis: {
      targetNeed: Math.round(targetProtectionNeed),
      existingAssets: Math.round(totalCashAssets),
      netGap: Math.round(netProtectionGap),
      yearsOfExpenseCoverage: Number(yearsCoverage.toFixed(1)),
      insightSummary: netProtectionGap > 0 
        ? `Your dependents face an estimated ₱${Math.round(netProtectionGap).toLocaleString()} shortfall if living expenses are sustained without the primary earner.`
        : `Your current liquid and insurance assets sufficiently cover baseline liability targets.`,
    },
    retirementAnalysis: {
      yearsToRetire,
      futureMonthlyExpenses: Math.round(futureMonthlyRetExpenses),
      targetCorpus: Math.round(targetRetCorpus),
      projectedAccumulation,
      netShortfall: Math.round(netRetirementShortfall),
      insightSummary: netRetirementShortfall > 0
        ? `To sustain ₱${Math.round(futureMonthlyRetExpenses).toLocaleString()}/month in retirement at age ${retAge}, an additional ₱${Math.round(netRetirementShortfall).toLocaleString()} is needed.`
        : `Your current compounding rate is on track to meet your retirement corpus goal.`,
    },
    educationAnalysis: shouldIncludeEdu ? {
      childName,
      yearsToCollege,
      projected4YearCost,
      netGap: netEducationGap,
      insightSummary: `Projected 4-year tuition for ${childName} will require ₱${projected4YearCost.toLocaleString()} factoring 8% annual education inflation.`,
    } : undefined,
    stressTestMatrix,
    priorityRoadmap,
    advisorTalkingPoints,
  };
}
