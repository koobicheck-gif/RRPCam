export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - /auth/* (authentication pages)
     * - /share/* (public share links)
     * - /api/auth/* (NextAuth endpoints)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt, etc.
     */
    "/((?!auth|share|api/auth|_next/static|_next/image|favicon.ico|robots.txt|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
