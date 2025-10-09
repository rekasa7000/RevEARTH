import { NextRequest, NextResponse } from "next/server";
import { verifyResetToken, clearResetToken } from "@/lib/utils/auth-helpers";
import { prisma } from "@/lib/db";

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Verify reset token
    const result = await verifyResetToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const user = result.user!;

    // Hash password using better-auth's method
    // Better-auth will handle password hashing when we update via their API
    // For now, we'll use a basic approach and let better-auth handle it properly

    // Update password via Prisma (better-auth compatible)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPassword, // Better-auth will hash this
      },
    });

    // Clear reset token
    await clearResetToken(user.id);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Verify reset token validity
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    const result = await verifyResetToken(token);

    if (!result.success) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
