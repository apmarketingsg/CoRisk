import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Access Code',
      credentials: {
        code: { label: 'Access Code', type: 'password', placeholder: 'Enter access code' },
      },
      async authorize(credentials) {
        const inviteCode = process.env.INVITE_CODE
        if (!inviteCode) {
          throw new Error('INVITE_CODE environment variable is not set')
        }
        if (credentials?.code === inviteCode) {
          // Return a minimal user object — no real user DB needed
          return { id: 'analyst', name: 'Analyst', email: 'analyst@corisk.ai' }
        }
        return null
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string
      return session
    },
  },
}
