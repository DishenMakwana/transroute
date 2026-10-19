import { NextRequest, NextResponse } from "next/server";
import {
  searchTransports,
  createTransport,
  invalidateCache,
} from "@/db/storage";
import { SearchFilters, CreateTransportInput } from "@/types";

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

    const queryParam = searchParams.get("query") || searchParams.get("q");

    const filters: SearchFilters = {
      query: queryParam ? queryParam.trim() : undefined,
      source: searchParams.get("source") || undefined,
      destination: searchParams.get("destination") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      openNow: searchParams.get("openNow") === "true",
      locationType:
        (searchParams.get("locationType") as SearchFilters["locationType"]) ||
        undefined,
      weightUnit:
        (searchParams.get("weightUnit") as SearchFilters["weightUnit"]) ||
        undefined,
      boxSizeUnit:
        (searchParams.get("boxSizeUnit") as SearchFilters["boxSizeUnit"]) ||
        undefined,
      sortBy:
        (searchParams.get("sortBy") as SearchFilters["sortBy"]) || undefined,
    };

    const results = await searchTransports(filters);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to query transports:", error);
    return NextResponse.json(
      { error: "Internal server error while searching transports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTransportInput;

    if (!body.name || !body.phoneNumber) {
      return NextResponse.json(
        { error: "Transport name and phone number are required" },
        { status: 400 }
      );
    }

    if (!body.locations || body.locations.length === 0) {
      return NextResponse.json(
        { error: "At least one office or pickup/dropoff location is required" },
        { status: 400 }
      );
    }

    const created = await createTransport(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create transport:", error);
    return NextResponse.json(
      { error: "Failed to create transport option" },
      { status: 500 }
    );
  }
}
