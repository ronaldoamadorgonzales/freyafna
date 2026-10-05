import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { leads, financialProfiles, fnaModulesResponses, leadAssignments, advisors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const advisorIdHeader = request.headers.get("x-advisor-id");

    if (!advisorIdHeader) {
      return NextResponse.json({ error: "Unauthorized. Missing x-advisor-id header." }, { status: 401 });
    }

    let query = db
      .select({
        lead: leads,
        profile: financialProfiles,
        assignment: leadAssignments,
        advisor: advisors,
      })
      .from(leads)
      .leftJoin(financialProfiles, eq(financialProfiles.leadId, leads.id))
      .leftJoin(leadAssignments, eq(leadAssignments.leadId, leads.id))
      .leftJoin(advisors, eq(advisors.id, leadAssignments.advisorId));

    if (advisorIdHeader !== "admin") {
      query = query.where(eq(leadAssignments.advisorId, advisorIdHeader)) as any;
    }

    const rawLeads = await query;

    // Fetch all module responses for these leads and group them
    const allResponses = await db.select().from(fnaModulesResponses);

    const formattedLeads = rawLeads.map((row) => {
      const responses = allResponses.filter((res) => res.leadId === row.lead.id);
      return {
        ...row.lead,
        profile: row.profile,
        assignment: row.assignment ? {
          ...row.assignment,
          advisorName: row.advisor?.fullName || "Unassigned"
        } : null,
        responses,
      };
    });

    // Also fetch all advisors list to return as helper for advisor switcher
    const allAdvisors = await db.select().from(advisors);

    return NextResponse.json({ 
      success: true, 
      leads: formattedLeads,
      advisors: allAdvisors
    });
  } catch (error: any) {
    console.error("Fetch Leads Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}
