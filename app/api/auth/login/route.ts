import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { advisors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth";
import { encryptSession } from "@/lib/auth-jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Find advisor by email
    const advisorList = await db.select().from(advisors).where(eq(advisors.email, email)).limit(1);
    if (advisorList.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const advisor = advisorList[0];

    // Check status
    if (advisor.status !== "ACTIVE") {
      return NextResponse.json({ error: "Your account is inactive. Please contact an administrator." }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, advisor.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Encrypt session data
    const sessionData = {
      id: advisor.id,
      email: advisor.email,
      fullName: advisor.fullName,
      role: advisor.role,
      advisorCode: advisor.advisorCode,
      isDefault: advisor.isDefault,
      createdAt: Date.now(),
    };
    const sessionToken = await encryptSession(sessionData);

    // Set secure HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: advisor.id,
        email: advisor.email,
        fullName: advisor.fullName,
        role: advisor.role,
        advisorCode: advisor.advisorCode,
        isDefault: advisor.isDefault,
      },
    });

    response.cookies.set("advisor_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
