import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { getErrorStats } from "@/lib/services/error-logger";

/**
 * GET /api/errors/stats
 * Get error statistics
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request, { user: _user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = (searchParams.get("timeframe") as "day" | "week" | "month") || "day";

    const stats = await getErrorStats(timeframe);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Get error stats error:", error);
    return NextResponse.json(
      { error: "Failed to get error stats" },
      { status: 500 }
    );
  }
});
