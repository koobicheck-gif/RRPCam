import { NextRequest, NextResponse } from "next/server";

// In demo/static-export mode, auth middleware is not needed.
// The NEXT_PUBLIC_DEMO_MODE check here is a build-time constant.
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function middleware(req: NextRequest) {
  if (isDemoMode) {
    return NextResponse.next();
  }

  // Dynamically import next-auth middleware only in server mode
  const { default: withAuth } = await import("next-auth/middleware");
  return (withAuth as (req: NextRequest) => Promise<NextResponse>)(req);
}

export const config = {
  matcher: [
    "/((?!auth|share|api/auth|_next/static|_next/image|favicon.ico|robots.txt|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
