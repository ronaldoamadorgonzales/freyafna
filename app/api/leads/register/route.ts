import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { leads, financialProfiles, fnaModulesResponses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { computeLeadScore } from "@/lib/calculations/scoring";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, inputs, outputs } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
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
          .set({ fullName: name, mobileNumber: mobile || null, updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      } else {
        const newLeads = await tx.insert(leads).values({
          fullName: name,
          email,
          mobileNumber: mobile || null,
          overallLeadScore: 50, // default placeholder
          leadCategory: "WARM"
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
          monthlyIncomeRange: inputs.monthlyIncomeRange || "₱30,005 - ₱50,000",
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

      return { leadId };
    });

    return NextResponse.json({ success: true, leadId: result.leadId });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}
