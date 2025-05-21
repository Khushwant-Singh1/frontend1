import { PrismaClient } from "@/lib/generated/prisma/client"

// Use PrismaClient as a global singleton to prevent multiple instances during hot reloading
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export { prisma }
