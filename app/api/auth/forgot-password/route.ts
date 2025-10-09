import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/utils/auth-helpers";

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

    // TODO: Send email with reset link
    // For now, we'll just return the token in development
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    console.log("Password reset link:", resetLink);

    // TODO: In production, send email via email service
    // await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to your email",
      // Remove this in production:
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
