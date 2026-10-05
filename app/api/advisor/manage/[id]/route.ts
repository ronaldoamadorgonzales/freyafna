import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { advisors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-advisor-role");
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { fullName, email, phone, advisorCode, title, avatarUrl, isDefault, calendlyUrl, linkedinUrl, status, password, role: newRole } = body;

    // Check if advisor exists
    const existing = await db.select().from(advisors).where(eq(advisors.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Advisor not found." }, { status: 404 });
    }

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (email) {
      // Check if email is taken by another advisor
      const emailCheck = await db.select().from(advisors).where(eq(advisors.email, email)).limit(1);
      if (emailCheck.length > 0 && emailCheck[0].id !== id) {
        return NextResponse.json({ error: "Email is already taken." }, { status: 400 });
      }
      updateData.email = email;
    }
    if (advisorCode !== undefined) {
      if (advisorCode) {
        const codeCheck = await db.select().from(advisors).where(eq(advisors.advisorCode, advisorCode)).limit(1);
        if (codeCheck.length > 0 && codeCheck[0].id !== id) {
          return NextResponse.json({ error: "Advisor code is already taken." }, { status: 400 });
        }
      }
      updateData.advisorCode = advisorCode || null;
    }
    if (title !== undefined) updateData.title = title;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
    if (isDefault !== undefined) {
      if (isDefault) {
        // Unset any other default
        await db.update(advisors).set({ isDefault: false });
      }
      updateData.isDefault = !!isDefault;
    }
    if (calendlyUrl !== undefined) updateData.calendlyUrl = calendlyUrl || null;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl || null;
    if (phone !== undefined) updateData.phone = phone;
    if (status) updateData.status = status;
    if (newRole) updateData.role = newRole;
    if (password) {
      updateData.passwordHash = hashPassword(password);
    }

    await db.update(advisors).set(updateData).where(eq(advisors.id, id));

    return NextResponse.json({ success: true, message: "Advisor updated successfully." });
  } catch (error: any) {
    console.error("PUT Update Advisor error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = request.headers.get("x-advisor-role");
    const currentAdvisorId = request.headers.get("x-advisor-id");
    
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === currentAdvisorId) {
      return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
    }

    // Check if advisor exists
    const existing = await db.select().from(advisors).where(eq(advisors.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Advisor not found." }, { status: 404 });
    }

    await db.delete(advisors).where(eq(advisors.id, id));

    return NextResponse.json({ success: true, message: "Advisor deleted successfully." });
  } catch (error: any) {
    console.error("DELETE Advisor error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
