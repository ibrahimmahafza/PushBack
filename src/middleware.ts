import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Guard: if Supabase env vars are missing, skip auth and pass through.
  // This prevents MIDDLEWARE_INVOCATION_FAILED on Vercel when env vars
  // aren't configured yet.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn("[middleware] Supabase env vars missing — skipping auth");
    return NextResponse.next();
  }

  try {
    const { supabase, response } = await createMiddlewareClient(request);

    // Always call getUser() to refresh the session JWT via the Supabase
    // Auth server — do NOT rely on getSession() which only reads storage.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error && process.env.NODE_ENV === "development") {
      console.log("[middleware] Auth check error:", error.message);
    }

    // Protect /dashboard routes — redirect to /login if not authenticated
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[middleware] Redirecting unauthenticated user from ${request.nextUrl.pathname} to /login`
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    // If middleware crashes for any reason, don't block the request
    console.error("[middleware] Error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
