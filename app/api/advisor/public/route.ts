import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { advisors } from "@/lib/db/schema";
import { eq, ilike, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim();

    let selectedAdvisor = null;

    if (code) {
      const results = await db
        .select({
          id: advisors.id,
          fullName: advisors.fullName,
          email: advisors.email,
          phone: advisors.phone,
          advisorCode: advisors.advisorCode,
          title: advisors.title,
          avatarUrl: advisors.avatarUrl,
          isDefault: advisors.isDefault,
          calendlyUrl: advisors.calendlyUrl,
          linkedinUrl: advisors.linkedinUrl,
          status: advisors.status,
          role: advisors.role,
        })
        .from(advisors)
        .where(and(ilike(advisors.advisorCode, code), eq(advisors.status, "ACTIVE")))
        .limit(1);

      if (results.length > 0) {
        selectedAdvisor = results[0];
      }
    }

    // If no code provided or code not matched, fallback to default advisor
    if (!selectedAdvisor) {
      const defaultResults = await db
        .select({
          id: advisors.id,
          fullName: advisors.fullName,
          email: advisors.email,
          phone: advisors.phone,
          advisorCode: advisors.advisorCode,
          title: advisors.title,
          avatarUrl: advisors.avatarUrl,
          isDefault: advisors.isDefault,
          calendlyUrl: advisors.calendlyUrl,
          linkedinUrl: advisors.linkedinUrl,
          status: advisors.status,
          role: advisors.role,
        })
        .from(advisors)
        .where(and(eq(advisors.isDefault, true), eq(advisors.status, "ACTIVE")))
        .limit(1);

      if (defaultResults.length > 0) {
        selectedAdvisor = defaultResults[0];
      } else {
        // Fallback to first active advisor
        const fallbackResults = await db
          .select({
            id: advisors.id,
            fullName: advisors.fullName,
            email: advisors.email,
            phone: advisors.phone,
            advisorCode: advisors.advisorCode,
            title: advisors.title,
            avatarUrl: advisors.avatarUrl,
            isDefault: advisors.isDefault,
            calendlyUrl: advisors.calendlyUrl,
            linkedinUrl: advisors.linkedinUrl,
            status: advisors.status,
            role: advisors.role,
          })
          .from(advisors)
          .where(eq(advisors.status, "ACTIVE"))
          .limit(1);

        if (fallbackResults.length > 0) {
          selectedAdvisor = fallbackResults[0];
        }
      }
    }

    if (!selectedAdvisor) {
      return NextResponse.json({ error: "No active advisor available." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      advisor: selectedAdvisor,
    });
  } catch (error: any) {
    console.error("GET Public Advisor Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
