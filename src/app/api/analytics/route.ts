import { NextRequest, NextResponse } from "next/server";
import { getAnalytics, invalidateCache } from "@/db/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldRefresh =
      searchParams.get("refresh") === "true" ||
      searchParams.get("clearCache") === "true";

    if (shouldRefresh) {
      invalidateCache();
    }

    const data = await getAnalytics(shouldRefresh);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Failed to generate analytics:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics summary" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    invalidateCache();
    const data = await getAnalytics(true);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Failed to refresh analytics:", error);
    return NextResponse.json(
      { error: "Failed to refresh analytics summary" },
      { status: 500 }
    );
  }
}
