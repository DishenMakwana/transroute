import "dotenv/config";
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

const START_TIME = Date.now();

export async function GET() {
  let dbStatus = "disconnected";
  try {
    const client = await pool.connect();
    client.release();
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);

  return NextResponse.json(
    {
      status: "healthy",
      service: "transroute",
      version: "1.0.0",
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || "development",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
