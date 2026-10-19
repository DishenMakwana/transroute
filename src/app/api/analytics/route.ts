import { NextResponse } from "next/server";
import { getAnalytics } from "@/db/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAnalytics();
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
    const data = await getAnalytics();
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
