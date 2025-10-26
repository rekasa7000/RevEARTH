import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

/**
 * Generate a random token for email verification or password reset
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create token expiry date (default: 24 hours from now)
 */
export function createTokenExpiry(hours: number = 24): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/**
 * Generate and store email verification token
 */
export async function generateVerificationToken(userId: string, email: string) {
  const token = generateToken();

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken: token,
      isVerified: false,
    },
  });

  return token;
}

/**
 * Generate and store password reset token
 */
export async function generatePasswordResetToken(email: string) {
  const token = generateToken();
  const expires = createTokenExpiry(1); // 1 hour expiry for password reset

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: expires,
    },
  });

  return token;
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
    },
  });

  if (!user) {
    return { success: false, error: "Invalid verification token" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerified: new Date(),
      verificationToken: null,
    },
  });

  return { success: true, user };
}

/**
 * Verify password reset token
 */
export async function verifyResetToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  return { success: true, user };
}

/**
 * Clear password reset token
 */
export async function clearResetToken(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: null,
      resetTokenExpires: null,
    },
  });
}

/**
 * Get user session from better-auth
 */
export async function getUserSession(request: Request) {
  // This will be populated by better-auth middleware
  const sessionCookie = request.headers.get("cookie");

  if (!sessionCookie) {
    return null;
  }

  // Better-auth handles session validation automatically
  // You can access the session via better-auth's built-in methods
  return null; // Placeholder - better-auth handles this
}
