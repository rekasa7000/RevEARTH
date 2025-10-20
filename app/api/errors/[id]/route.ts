import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { resolveError } from "@/lib/services/error-logger";

/**
 * GET /api/errors/:id
 * Get single error log by ID
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    const error = await prisma.errorLog.findUnique({
      where: { id },
    });

    if (!error) {
      return NextResponse.json(
        { error: "Error log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error });
  } catch (error) {
    console.error("Get error log error:", error);
    return NextResponse.json(
      { error: "Failed to get error log" },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/errors/:id
 * Mark error as resolved
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { resolved } = body;

    if (typeof resolved !== "boolean") {
      return NextResponse.json(
        { error: "Resolved status must be a boolean" },
        { status: 400 }
      );
    }

    if (resolved) {
      await resolveError(id, user.id);
    } else {
      // Un-resolve error
      await prisma.errorLog.update({
        where: { id },
        data: {
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        },
      });
    }

    const updatedError = await prisma.errorLog.findUnique({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      error: updatedError,
    });
  } catch (error) {
    console.error("Update error log error:", error);
    return NextResponse.json(
      { error: "Failed to update error log" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/errors/:id
 * Delete error log
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    await prisma.errorLog.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Error log deleted successfully",
    });
  } catch (error) {
    console.error("Delete error log error:", error);
    return NextResponse.json(
      { error: "Failed to delete error log" },
      { status: 500 }
    );
  }
});
