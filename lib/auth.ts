import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "./services/email";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled for MVP - enable when SMTP is configured
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
      // Send verification email using our email service
      const verificationUrl = url;
      await sendVerificationEmail(user.email, verificationUrl, user.name || undefined);
    },
  },
  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    // Add OAuth providers as needed
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    // },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (session will be updated if it's older than this)
  },
  advanced: {
    cookiePrefix: "revearth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;