export { default } from 'next-auth/middleware'

export const config = {
  // Protect everything except:
  // - /login  (auth page)
  // - /api/auth/* (NextAuth handlers)
  // - /_next/* (Next.js internals)
  // - /favicon.ico, /robots.txt (static assets)
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|robots\\.txt).*)',
  ],
}
