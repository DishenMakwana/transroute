import { NextResponse } from "next/server";
import { getAnalytics } from "@/db/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to generate analytics:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics summary" },
      { status: 500 }
    );
  }
}
