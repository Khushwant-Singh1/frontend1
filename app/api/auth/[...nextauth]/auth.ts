import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient, Role } from "@/lib/generated/prisma/client";
import { z } from "zod";
import { comparePasswords } from "@/lib/auth/password-utils";

// Use PrismaClient as a global singleton to prevent multiple instances during hot reloading
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Define validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },      async authorize(credentials) {
        try {
          // Validate credentials with Zod
          const validatedCredentials = credentialsSchema.parse(credentials);
          
          console.log("Looking up user:", validatedCredentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: validatedCredentials.email }
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          console.log("Comparing passwords...");
          const isPasswordValid = await comparePasswords(
            validatedCredentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Authentication successful");

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          // If validation fails, error will be thrown and caught here
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "YOUR_FALLBACK_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION"
});