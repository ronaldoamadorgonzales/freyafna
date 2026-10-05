import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { leadAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // id represents the leadId
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(leadAssignments)
      .where(eq(leadAssignments.leadId, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
    }

    await db
      .update(leadAssignments)
      .set({
        status,
        notes: notes ?? "",
        updatedAt: new Date(),
      })
      .where(eq(leadAssignments.leadId, id));

    return NextResponse.json({ success: true, message: "Assignment updated successfully." });
  } catch (error: any) {
    console.error("Update Assignment Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error." }, { status: 500 });
  }
}
