import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptSession } from "@/lib/auth-jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("advisor_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const sessionData = await decryptSession(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Verify session age (24 hours check)
    const isExpired = Date.now() - sessionData.createdAt > 60 * 60 * 24 * 1000;
    if (isExpired) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionData.id,
        email: sessionData.email,
        fullName: sessionData.fullName,
        role: sessionData.role,
        advisorCode: sessionData.advisorCode,
        isDefault: sessionData.isDefault,
      },
    });
  } catch (error: any) {
    console.error("Session verification API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
