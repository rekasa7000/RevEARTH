import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Optimize for serverless environments (Vercel)
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Optimize for serverless: disconnect after each request in production
// This prevents connection exhaustion in Vercel's serverless functions
if (process.env.NODE_ENV === "production") {
  // Clean up connections on serverless function shutdown
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
