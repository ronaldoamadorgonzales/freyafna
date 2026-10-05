import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { leads, financialProfiles, fnaModulesResponses, advisors, leadAssignments } from "@/lib/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { computeLeadScore } from "@/lib/calculations/scoring";
import { createInsightsToken } from "@/lib/auth-jwt";
import { sendLeadInsightsEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, advisorCode, inputs, outputs } = body;

    if (!name || !email || !mobile) {
      return NextResponse.json({ error: "Full Name, Email Address, and Mobile Number are all strictly required." }, { status: 400 });
    }

    // Basic mobile validation (at least 7 digits)
    const cleanMobile = mobile.replace(/[^0-9+]/g, "");
    if (cleanMobile.length < 7) {
      return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
    }

    // Wrap insertions in a database transaction
    const result = await db.transaction(async (tx) => {
      // 1. Insert or find lead
      const existingLeads = await tx.select().from(leads).where(eq(leads.email, email)).limit(1);
      
      let leadId: string;
      
      if (existingLeads.length > 0) {
        leadId = existingLeads[0].id;
        // Update existing lead name & details
        await tx.update(leads)
          .set({ 
            fullName: name, 
            mobileNumber: mobile, 
            insightsEmailSentAt: new Date(),
            updatedAt: new Date() 
          })
          .where(eq(leads.id, leadId));
      } else {
        const newLeads = await tx.insert(leads).values({
          fullName: name,
          email,
          mobileNumber: mobile,
          overallLeadScore: 50, // default placeholder
          leadCategory: "WARM",
          insightsEmailSentAt: new Date(),
        }).returning({ id: leads.id });
        
        leadId = newLeads[0].id;
      }

      // 2. Insert or update financial profile
      const existingProfiles = await tx.select().from(financialProfiles).where(eq(financialProfiles.leadId, leadId)).limit(1);
      
      if (existingProfiles.length > 0) {
        await tx.update(financialProfiles).set({
          age: inputs.age || 30,
          maritalStatus: inputs.maritalStatus || "SINGLE",
          dependentsCount: inputs.dependentsCount || 0,
          monthlyIncomeRange: inputs.monthlyIncomeRange || "₱30,000 - ₱50,000",
          currentSavings: String(inputs.initialSavings || 0),
          retirementAgeGoal: inputs.retirementAgeGoal || 60,
          updatedAt: new Date()
        }).where(eq(financialProfiles.leadId, leadId));
      } else {
        await tx.insert(financialProfiles).values({
          leadId,
          age: inputs.age || 30,
          maritalStatus: inputs.maritalStatus || "SINGLE",
          dependentsCount: inputs.dependentsCount || 0,
          monthlyIncomeRange: inputs.monthlyIncomeRange || "₱30,000 - ₱50,000",
          currentSavings: String(inputs.initialSavings || 0),
          retirementAgeGoal: inputs.retirementAgeGoal || 60,
        });
      }

      // 3. Count completed modules & calculate lead score
      const pastResponses = await tx.select().from(fnaModulesResponses).where(eq(fnaModulesResponses.leadId, leadId));
      const completedModulesCount = pastResponses.length + 1; // including current response

      const scoreData = computeLeadScore({
        incomeRange: inputs.monthlyIncomeRange || "₱30,000 - ₱50,000",
        initialSavings: Number(inputs.initialSavings || 0),
        monthlyContribution: Number(inputs.monthlyContribution || 0),
        years: Number(inputs.years || 10),
        completedModulesCount
      });

      // 4. Update overall lead score and category
      await tx.update(leads)
        .set({ 
          overallLeadScore: scoreData.score, 
          leadCategory: scoreData.category,
          updatedAt: new Date()
        })
        .where(eq(leads.id, leadId));

      // 5. Log milestone modules responses
      await tx.insert(fnaModulesResponses).values({
        leadId,
        moduleType: "MILESTONE_SAVINGS",
        inputs: inputs,
        outputs: outputs
      });

      // 6. Determine assigned advisor (Advisor code, Default advisor, or First Active)
      let selectedAdvisor = null;
      if (advisorCode) {
        const codeResults = await tx
          .select()
          .from(advisors)
          .where(and(ilike(advisors.advisorCode, advisorCode), eq(advisors.status, "ACTIVE")))
          .limit(1);
        if (codeResults.length > 0) {
          selectedAdvisor = codeResults[0];
        }
      }

      if (!selectedAdvisor) {
        const defaultResults = await tx
          .select()
          .from(advisors)
          .where(and(eq(advisors.isDefault, true), eq(advisors.status, "ACTIVE")))
          .limit(1);
        if (defaultResults.length > 0) {
          selectedAdvisor = defaultResults[0];
        } else {
          const activeAdvisors = await tx.select().from(advisors).where(eq(advisors.status, "ACTIVE")).limit(1);
          if (activeAdvisors.length > 0) {
            selectedAdvisor = activeAdvisors[0];
          }
        }
      }

      // 7. Assign to Advisor if no assignment exists
      const existingAssignment = await tx.select().from(leadAssignments).where(eq(leadAssignments.leadId, leadId)).limit(1);
      if (existingAssignment.length === 0) {
        await tx.insert(leadAssignments).values({
          leadId,
          advisorId: selectedAdvisor?.id || null,
          status: "PENDING",
          notes: advisorCode ? `Referred via advisor link: ${advisorCode}` : "Direct landing page registration",
        });
      } else if (selectedAdvisor && existingAssignment[0].advisorId !== selectedAdvisor.id) {
        // If re-registered with a specific code, link assignment
        await tx.update(leadAssignments).set({
          advisorId: selectedAdvisor.id,
          updatedAt: new Date(),
        }).where(eq(leadAssignments.leadId, leadId));
      }

      return { 
        leadId, 
        advisor: selectedAdvisor ? {
          fullName: selectedAdvisor.fullName,
          advisorCode: selectedAdvisor.advisorCode,
          title: selectedAdvisor.title,
          email: selectedAdvisor.email,
          phone: selectedAdvisor.phone,
          calendlyUrl: selectedAdvisor.calendlyUrl,
        } : null 
      };
    });

    // 8. Generate 48-hour time-limited insights token
    const insightsToken = await createInsightsToken(result.leadId, result.advisor?.advisorCode || undefined, 48);
    const appUrl = process.env.APP_URL || "http://localhost:3005";
    const absoluteInsightsUrl = `${appUrl}/insights/${insightsToken}`;

    // 9. Dispatch 48-hour VIP strategy brief email asynchronously
    sendLeadInsightsEmail({
      leadName: name,
      leadEmail: email,
      insightsUrl: absoluteInsightsUrl,
      advisorName: result.advisor?.fullName,
      advisorTitle: result.advisor?.title,
      advisorPhone: result.advisor?.phone || undefined,
      advisorEmail: result.advisor?.email || undefined,
    }).catch((err) => console.error("Error sending lead insights email:", err));

    return NextResponse.json({ 
      success: true, 
      leadId: result.leadId,
      advisor: result.advisor,
      insightsToken,
      insightsUrl: `/insights/${insightsToken}`,
    });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}
