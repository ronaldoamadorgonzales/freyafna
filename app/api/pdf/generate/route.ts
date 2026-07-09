import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, inputs, outputs } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Launch Headless Chromium
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Calculate dynamic values for the PDF template based on custom user inputs
    const initialSavingsVal = Number(inputs.initialSavings || 0);
    const monthlyContributionVal = Number(inputs.monthlyContribution || 0);
    const projectedTotalVal = Number(outputs.projectedTotal || 0);
    const yearsVal = Number(inputs.years || 10);
    
    // Extracted custom inputs
    const clientAge = Number(inputs.age || 30);
    const retirementAge = Number(inputs.retirementAgeGoal || 60);
    const retExpenses = Number(inputs.retExpenses || 50000);
    const retPension = Number(inputs.retPension || 0);
    
    const childName = inputs.childName || "Junior";
    const childAge = Number(inputs.childAge || 5);
    const annualTuition = Number(inputs.annualTuition || 100000);
    const courseDuration = Number(inputs.courseDuration || 4);
    
    const protExpenses = Number(inputs.protExpenses || 50000);
    const protInterest = Number(inputs.protInterest || 6);
    const protLiabilities = Number(inputs.protLiabilities || 200000);
    const protEmergency = Number(inputs.protEmergency || 100000);
    const protFinal = Number(inputs.protFinal || 50000);
    const protExisting = Number(inputs.protExisting || 1000000);
    
    const desiredHealth = Number(inputs.desiredHealth || 2000000);
    const existingHealth = Number(inputs.existingHealth || 500000);

    // Check included pillars (All active by default)
    const includeRetirement = true;
    const includeIncome = true;
    const includeEducation = true;
    const includeHealth = true;

    // 1. Retirement Gaps
    const yearsToRetire = Math.max(0, retirementAge - clientAge);
    const futureAnnualExpenses = (retExpenses * 12) * Math.pow(1.04, yearsToRetire); // 4% inflation
    const retirementTarget = futureAnnualExpenses / 0.06; // 6% capitalization
    const pensionLumpSum = (retPension * 12) / 0.06;
    const retirementGap = Math.max(0, retirementTarget - pensionLumpSum - projectedTotalVal);

    const retirementTargetSinking = futureAnnualExpenses * 20;
    const retirementGapSinking = Math.max(0, retirementTargetSinking - pensionLumpSum - projectedTotalVal);

    // 2. Education Gaps (4-Year & 5-Year Courses)
    const yearsToCollege = Math.max(0, 18 - childAge);
    const t1 = annualTuition * Math.pow(1.08, yearsToCollege);
    const t2 = annualTuition * Math.pow(1.08, yearsToCollege + 1);
    const t3 = annualTuition * Math.pow(1.08, yearsToCollege + 2);
    const t4 = annualTuition * Math.pow(1.08, yearsToCollege + 3);
    const t5 = annualTuition * Math.pow(1.08, yearsToCollege + 4);

    const educationTarget4 = t1 + t2 + t3 + t4;
    const educationTarget5 = t1 + t2 + t3 + t4 + t5;
    const educationGap4 = Math.max(0, educationTarget4 - 120000);
    const educationGap5 = Math.max(0, educationTarget5 - 120000);

    // 3. Income Protection Gap
    const amountNeededToProvide = (protExpenses * 12) / (protInterest / 100);
    const totalLiabilities = protLiabilities + protEmergency + protFinal;
    const totalCashAssets = protExisting + initialSavingsVal;
    const incomeTarget = amountNeededToProvide + totalLiabilities;
    const incomeGap = Math.max(0, incomeTarget - totalCashAssets);

    // 4. Health Security Gap
    const healthGap = Math.max(0, desiredHealth - existingHealth);

    // HTML Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.35;
            padding: 15px 20px;
            background-color: #ffffff;
            font-size: 11px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .logo {
            font-size: 20px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .subtitle {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .client-info {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
          }
          .client-info h4 {
            margin: 0 0 8px 0;
            color: #0f766e;
            font-size: 12px;
            font-weight: bold;
          }
          .client-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px 15px;
          }
          .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f766e;
            margin-top: 12px;
            margin-bottom: 6px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 12px;
          }
          .data-table th, .data-table td {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
          }
          .data-table th {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: bold;
            background-color: #f8fafc;
          }
          .data-table td {
            font-size: 11px;
          }
          .bold {
            font-weight: bold;
          }
          .red {
            color: #ef4444;
          }
          .teal {
            color: #0f766e;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            background-color: #ccfbf1;
            color: #0f766e;
            border-radius: 9999px;
            font-size: 9px;
            font-weight: bold;
          }
          .advisor-box {
            margin-top: 12px;
            background-color: #f0fdfa;
            border: 1px solid #99f6e4;
            padding: 10px 15px;
            border-radius: 8px;
          }
          .advisor-box h4 {
            margin: 0 0 4px 0;
            color: #0f766e;
            font-size: 11px;
            font-weight: bold;
          }
          .advisor-box p {
            margin: 0;
            font-size: 10px;
            color: #0f766e;
            line-height: 1.4;
          }
          .footer {
            margin-top: 15px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">FreyaFNA</div>
            <div class="subtitle">Financial Needs Analysis (FNA) Assessment Summary</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">CONFIDENTIAL</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 3px;">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="client-info">
          <h4>Client Profile Summary</h4>
          <div class="client-grid">
            <div><strong>Name:</strong> ${name}</div>
            <div><strong>Email:</strong> ${email}</div>
            <div><strong>Mobile:</strong> ${mobile || "N/A"}</div>
            <div><strong>Age:</strong> ${clientAge} Years Old</div>
            <div><strong>Marital Status:</strong> ${inputs.maritalStatus || "SINGLE"}</div>
            <div><strong>Dependents Count:</strong> ${inputs.dependentsCount || 0}</div>
            <div><strong>Monthly Income:</strong> ${inputs.monthlyIncomeRange || "₱30,000 - ₱50,000"}</div>
          </div>
        </div>

        <h3 class="section-title">1. Wealth Accumulation Trajectory (Pillar 1)</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Strategy Factor</th>
              <th>Value Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Current Liquid/Initial Savings</td>
              <td>₱${initialSavingsVal.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Target Monthly Contribution</td>
              <td>₱${monthlyContributionVal.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Selected Accumulation Period</td>
              <td>${yearsVal} Years</td>
            </tr>
            <tr>
              <td>Projected Wealth Growth (at ${Number(inputs.expectedReturn || 6).toFixed(1)}% yield)</td>
              <td class="bold teal">₱${projectedTotalVal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <h3 class="section-title">2. Financial Gaps & Safety Nets Assessment</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Financial Pillar Module</th>
              <th>Target Need</th>
              <th>Current Strategy Asset Coverage</th>
              <th>Identified Coverage Gap</th>
            </tr>
          </thead>
          <tbody>
            ${includeRetirement ? `
            <tr>
              <td class="bold">Retirement (Capitalization Strategy)</td>
              <td>₱${Math.round(retirementTarget).toLocaleString()}</td>
              <td>₱${projectedTotalVal.toLocaleString()} + Pension</td>
              <td class="bold red">₱${Math.round(retirementGap).toLocaleString()}</td>
            </tr>
            <tr>
              <td class="bold">Retirement (Sinking Fund Strategy)</td>
              <td>₱${Math.round(retirementTargetSinking).toLocaleString()}</td>
              <td>₱${projectedTotalVal.toLocaleString()} + Pension</td>
              <td class="bold red">₱${Math.round(retirementGapSinking).toLocaleString()}</td>
            </tr>
            ` : ""}

            ${includeIncome ? `
            <tr>
              <td class="bold">Family Income Protection</td>
              <td>₱${Math.round(incomeTarget).toLocaleString()}</td>
              <td>₱${totalCashAssets.toLocaleString()}</td>
              <td class="bold red">₱${Math.round(incomeGap).toLocaleString()}</td>
            </tr>
            ` : ""}

            ${includeEducation ? `
            <tr>
              <td class="bold">Education (${childName} - 4-Year Course)</td>
              <td>₱${Math.round(educationTarget4).toLocaleString()}</td>
              <td>₱120,000 (Base Asset)</td>
              <td class="bold red">₱${Math.round(educationGap4).toLocaleString()}</td>
            </tr>
            <tr>
              <td class="bold">Education (${childName} - 5-Year Course)</td>
              <td>₱${Math.round(educationTarget5).toLocaleString()}</td>
              <td>₱120,000 (Base Asset)</td>
              <td class="bold red">₱${Math.round(educationGap5).toLocaleString()}</td>
            </tr>
            ` : ""}

            ${includeHealth ? `
            <tr>
              <td class="bold">Health Critical Illness Buffer</td>
              <td>₱${desiredHealth.toLocaleString()}</td>
              <td>₱${existingHealth.toLocaleString()}</td>
              <td class="bold red">₱${healthGap.toLocaleString()}</td>
            </tr>
            ` : ""}
          </tbody>
        </table>

        <div class="advisor-box">
          <h4>Professional Advisor Notes & Advisory Trajectory</h4>
          <p>
            Based on this analysis, your custom safety nets show targeted protection opportunities. 
            Advisors recommend bridging identified shortfall gaps using Suns Life solutions to lock in tax-exempt growth and guaranteed family coverage.
          </p>
        </div>

        <div class="footer">
          This report is for educational purposes only and does not constitute a formal offer of insurance coverage or investment advice.
          <br>&copy; 2026 FreyaFNA. All Rights Reserved.
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent);

    // Generate PDF Buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10px", bottom: "10px", left: "15px", right: "15px" },
    });

    await browser.close();

    // Return PDF Response
    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="FreyaFNA_Report_${name.replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}
