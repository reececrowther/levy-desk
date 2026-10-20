import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Nodemailer from 'next-auth/providers/nodemailer'
import Credentials from 'next-auth/providers/credentials'
import { db } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    ...(process.env.EMAIL_SERVER
      ? [
          Nodemailer({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM ?? 'Levy Desk <noreply@levydesk.local>',
          }),
        ]
      : []),
    // Dev-only bypass — never active in production
    ...(process.env.NODE_ENV === 'development'
      ? [
          Credentials({
            id: 'dev',
            name: 'Dev bypass',
            credentials: { email: { label: 'Email', type: 'email' } },
            async authorize(credentials) {
              const email =
                typeof credentials?.email === 'string' ? credentials.email.trim() : null
              if (!email) return null
              // Return only serialisable fields — no Date objects
              return db.user.upsert({
                where: { email },
                update: {},
                create: { email },
                select: { id: true, email: true, name: true, image: true },
              })
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/verify',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
})
