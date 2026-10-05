import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { leads, advisors, leadAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createInsightsToken } from "@/lib/auth-jwt";
import { sendLeadInsightsEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // 1. Find lead by email
    const leadRows = await db.select().from(leads).where(eq(leads.email, email.trim())).limit(1);
    if (leadRows.length === 0) {
      return NextResponse.json({ 
        error: "No assessment record found with this email address. Please start an assessment on our homepage." 
      }, { status: 404 });
    }

    const lead = leadRows[0];

    // 2. Find assigned advisor or default
    const assignmentRows = await db
      .select({
        advisorId: leadAssignments.advisorId,
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
        })
        .from(advisors)
        .where(eq(advisors.id, assignmentRows[0].advisorId))
        .limit(1);

      if (advRows.length > 0) {
        assignedAdvisor = advRows[0];
      }
    }

    if (!assignedAdvisor) {
      const defaultAdvRows = await db
        .select({
          id: advisors.id,
          fullName: advisors.fullName,
          email: advisors.email,
          phone: advisors.phone,
          advisorCode: advisors.advisorCode,
          title: advisors.title,
        })
        .from(advisors)
        .where(eq(advisors.isDefault, true))
        .limit(1);

      if (defaultAdvRows.length > 0) {
        assignedAdvisor = defaultAdvRows[0];
      }
    }

    // 3. Generate brand new 48-hour token
    const newToken = await createInsightsToken(lead.id, assignedAdvisor?.advisorCode || undefined, 48);
    const appUrl = process.env.APP_URL || "http://localhost:3005";
    const absoluteInsightsUrl = `${appUrl}/insights/${newToken}`;

    // 4. Update timestamp
    await db.update(leads)
      .set({ 
        insightsEmailSentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(leads.id, lead.id));

    // 5. Dispatch email
    await sendLeadInsightsEmail({
      leadName: lead.fullName,
      leadEmail: lead.email,
      insightsUrl: absoluteInsightsUrl,
      advisorName: assignedAdvisor?.fullName,
      advisorTitle: assignedAdvisor?.title,
      advisorPhone: assignedAdvisor?.phone || undefined,
      advisorEmail: assignedAdvisor?.email || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `A brand-new 48-hour access link has been sent to ${lead.email}. Please check your inbox.`,
    });
  } catch (error: any) {
    console.error("Renew Access Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
