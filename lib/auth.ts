import { prisma } from "./prisma"
import NextAuth, { Session } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcryptjs from "bcryptjs"
import { JWT } from "next-auth/jwt"
import { Role } from "./generated/prisma/client"

// Define validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

// Define User type
type User = {
  id: string
  name: string
  email: string
  role: Role
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate credentials with Zod
          const validatedCredentials = credentialsSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({
            where: { email: validatedCredentials.email }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcryptjs.compare(
            validatedCredentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: User }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "YOUR_FALLBACK_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION"
}