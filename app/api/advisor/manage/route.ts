import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { advisors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const role = request.headers.get("x-advisor-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const allAdvisors = await db
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
        createdAt: advisors.createdAt,
      })
      .from(advisors);

    return NextResponse.json({ success: true, advisors: allAdvisors });
  } catch (error: any) {
    console.error("GET Advisors error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const role = request.headers.get("x-advisor-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, email, phone, advisorCode, title, avatarUrl, isDefault, calendlyUrl, linkedinUrl, status, password, role: newRole } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
    }

    // Check if advisor email already exists
    const existing = await db.select().from(advisors).where(eq(advisors.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An advisor with this email already exists." }, { status: 400 });
    }

    if (advisorCode) {
      const codeCheck = await db.select().from(advisors).where(eq(advisors.advisorCode, advisorCode)).limit(1);
      if (codeCheck.length > 0) {
        return NextResponse.json({ error: "Advisor code is already in use." }, { status: 400 });
      }
    }

    const passwordHash = hashPassword(password);

    if (isDefault) {
      await db.update(advisors).set({ isDefault: false });
    }

    const inserted = await db
      .insert(advisors)
      .values({
        fullName,
        email,
        phone: phone || null,
        advisorCode: advisorCode || null,
        title: title || "Licensed Financial Advisor",
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        isDefault: !!isDefault,
        calendlyUrl: calendlyUrl || null,
        linkedinUrl: linkedinUrl || null,
        status: status || "ACTIVE",
        role: newRole || "ADVISOR",
        passwordHash,
      })
      .returning({
        id: advisors.id,
        fullName: advisors.fullName,
        email: advisors.email,
        advisorCode: advisors.advisorCode,
        avatarUrl: advisors.avatarUrl,
      });

    return NextResponse.json({
      success: true,
      message: "Advisor created successfully.",
      advisor: inserted[0],
    });
  } catch (error: any) {
    console.error("POST Create Advisor error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
