import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { leads, financialProfiles, fnaModulesResponses, advisors, leadAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyInsightsToken } from "@/lib/auth-jwt";
import { generateCannedInsights } from "@/lib/calculations/insights";
import { sendAdvisorAlertEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { payload, isExpired } = await verifyInsightsToken(token);

    if (!payload || !payload.leadId) {
      return NextResponse.json({ 
        success: false, 
        isExpired: true, 
        error: "Invalid or corrupted access link." 
      }, { status: 400 });
    }

    // If expired, attempt to lookup lead details to prefill the renewal form
    if (isExpired) {
      const expiredLeadRows = await db.select().from(leads).where(eq(leads.id, payload.leadId)).limit(1);
      const expiredLead = expiredLeadRows[0] || null;

      return NextResponse.json({ 
        success: false, 
        isExpired: true, 
        expiresAt: payload.expiresAt,
        leadEmail: expiredLead?.email || "",
        leadName: expiredLead?.fullName || "",
        error: "This 48-hour secure insights link has expired." 
      }, { status: 410 });
    }

    // Fetch Lead Data
    const leadRows = await db.select().from(leads).where(eq(leads.id, payload.leadId)).limit(1);
    if (leadRows.length === 0) {
      return NextResponse.json({ success: false, error: "Lead record not found." }, { status: 404 });
    }
    const lead = leadRows[0];

    // Update view count and timestamp
    const updatedViewCount = (lead.insightsViewCount || 0) + 1;
    const viewTimestamp = new Date();
    await db.update(leads)
      .set({ 
        insightsViewCount: updatedViewCount, 
        lastViewedInsightsAt: viewTimestamp,
        updatedAt: viewTimestamp
      })
      .where(eq(leads.id, lead.id));

    // Fetch Financial Profile
    const profileRows = await db.select().from(financialProfiles).where(eq(financialProfiles.leadId, lead.id)).limit(1);
    const profile = profileRows[0] || null;

    // Fetch Modules Responses
    const moduleRows = await db.select().from(fnaModulesResponses).where(eq(fnaModulesResponses.leadId, lead.id));
    
    // Extract inputs from saved modules if available
    let savedInputs: any = {};
    for (const m of moduleRows) {
      if (m.inputs && typeof m.inputs === "object") {
        savedInputs = { ...savedInputs, ...m.inputs };
      }
    }

    // Fetch Advisor Assignment
    const assignmentRows = await db
      .select({
        advisorId: leadAssignments.advisorId,
        status: leadAssignments.status,
      })
      .from(leadAssignments)
      .where(eq(leadAssignments.leadId, lead.id))
      .limit(1);

    let assignedAdvisor = null;
    if (assignmentRows.length > 0 && assignmentRows[0].advisorId) {
      const advRows = await db
        .select({
          id: advisors.id,
          fullName: advisors.fullName,
          email: advisors.email,
          phone: advisors.phone,
          advisorCode: advisors.advisorCode,
          title: advisors.title,
          avatarUrl: advisors.avatarUrl,
          calendlyUrl: advisors.calendlyUrl,
          linkedinUrl: advisors.linkedinUrl,
        })
        .from(advisors)
        .where(eq(advisors.id, assignmentRows[0].advisorId))
        .limit(1);

      if (advRows.length > 0) {
        assignedAdvisor = advRows[0];
      }
    }

    // If no assigned advisor, fallback to default advisor
    if (!assignedAdvisor) {
      const defaultAdvRows = await db
        .select({
          id: advisors.id,
          fullName: advisors.fullName,
          email: advisors.email,
          phone: advisors.phone,
          advisorCode: advisors.advisorCode,
          title: advisors.title,
          avatarUrl: advisors.avatarUrl,
          calendlyUrl: advisors.calendlyUrl,
          linkedinUrl: advisors.linkedinUrl,
        })
        .from(advisors)
        .where(eq(advisors.isDefault, true))
        .limit(1);

      if (defaultAdvRows.length > 0) {
        assignedAdvisor = defaultAdvRows[0];
      }
    }

    // Generate Canned Insights
    const insightsInput = {
      leadName: lead.fullName,
      age: profile?.age || savedInputs.age || 30,
      monthlyIncomeRange: profile?.monthlyIncomeRange || savedInputs.monthlyIncomeRange || "₱30,000 - ₱50,000",
      dependentsCount: profile?.dependentsCount || savedInputs.dependentsCount || 0,
      maritalStatus: profile?.maritalStatus || savedInputs.maritalStatus || "SINGLE",
      currentSavings: Number(profile?.currentSavings || savedInputs.initialSavings || 0),
      retirementAgeGoal: profile?.retirementAgeGoal || savedInputs.retirementAgeGoal || 60,
      monthlyContribution: Number(savedInputs.monthlyContribution || 5000),
      years: Number(savedInputs.years || 10),
      protExpenses: Number(savedInputs.protExpenses || 50000),
      protInterest: Number(savedInputs.protInterest || 6),
      protLiabilities: Number(savedInputs.protLiabilities || 200000),
      protEmergency: Number(savedInputs.protEmergency || 100000),
      protFinal: Number(savedInputs.protFinal || 50000),
      protExisting: Number(savedInputs.protExisting || 1000000),
      retExpenses: Number(savedInputs.retExpenses || 50000),
      retPension: Number(savedInputs.retPension || 0),
      childName: savedInputs.childName || "Junior",
      childAge: Number(savedInputs.childAge || 5),
      annualTuition: Number(savedInputs.annualTuition || 100000),
      desiredHealth: Number(savedInputs.desiredHealth || 2000000),
      existingHealth: Number(savedInputs.existingHealth || 500000),
    };

    const insights = generateCannedInsights(insightsInput);

    // Dispatch real-time advisor alert email asynchronously
    if (assignedAdvisor && assignedAdvisor.email) {
      sendAdvisorAlertEmail({
        advisorEmail: assignedAdvisor.email,
        advisorName: assignedAdvisor.fullName,
        leadName: lead.fullName,
        leadEmail: lead.email,
        leadMobile: lead.mobileNumber,
        viewCount: updatedViewCount,
        viewedAt: viewTimestamp,
      }).catch((err) => console.error("Error sending advisor alert email:", err));
    }

    return NextResponse.json({
      success: true,
      isExpired: false,
      expiresAt: payload.expiresAt,
      lead: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        mobileNumber: lead.mobileNumber,
        category: lead.leadCategory,
        score: lead.overallLeadScore,
        viewCount: updatedViewCount,
        lastViewedAt: viewTimestamp,
      },
      profile,
      advisor: assignedAdvisor,
      insights,
    });
  } catch (error: any) {
    console.error("GET Insights Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
