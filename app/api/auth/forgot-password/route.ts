import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/utils/auth-helpers";
import { sendPasswordResetEmail } from "@/lib/services/email";

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const token = await generatePasswordResetToken(email);

    // Send email with reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetLink, user.name || undefined);

    if (!emailSent) {
      console.warn(`Failed to send password reset email to ${email}`);
      // In development, log the link
      if (process.env.NODE_ENV === "development") {
        console.log("Password reset link:", resetLink);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to your email",
      // Include link in development for testing
      ...(process.env.NODE_ENV === "development" && { resetLink }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
