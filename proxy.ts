import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "./lib/auth-jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const isAdvisorPortalPage = pathname.startsWith("/portal") && pathname !== "/portal/login";
  const isAdvisorApi = pathname.startsWith("/api/advisor") && !pathname.startsWith("/api/advisor/public");

  if (isAdvisorPortalPage || isAdvisorApi) {
    const sessionToken = request.cookies.get("advisor_session")?.value;

    if (!sessionToken) {
      if (isAdvisorApi) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }

    const sessionData = await decryptSession(sessionToken);
    if (!sessionData) {
      if (isAdvisorApi) {
        return NextResponse.json({ error: "Unauthorized. Invalid session." }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL("/portal/login", request.url));
      response.cookies.delete("advisor_session");
      return response;
    }

    // Verify session age (24 hours check)
    const isExpired = Date.now() - sessionData.createdAt > 60 * 60 * 24 * 1000;
    if (isExpired) {
      if (isAdvisorApi) {
        return NextResponse.json({ error: "Unauthorized. Session expired." }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL("/portal/login", request.url));
      response.cookies.delete("advisor_session");
      return response;
    }

    // Check admin-only routes
    const isAdminApi = pathname.startsWith("/api/advisor/manage");
    if (isAdminApi && sessionData.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // Inject session info into requests by headers so the route handler doesn't have to decrypt again
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-advisor-id", sessionData.id);
    requestHeaders.set("x-advisor-email", sessionData.email);
    requestHeaders.set("x-advisor-role", sessionData.role);
    requestHeaders.set("x-advisor-name", sessionData.fullName);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/api/advisor/:path*"],
};
