import { NextRequest, NextResponse } from "next/server";
import {
  updateTransport,
  deleteTransport,
  getTransportById,
} from "@/db/storage";
import { UpdateTransportInput } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json(
        { error: "Invalid transport ID" },
        { status: 400 }
      );
    }

    const found = await getTransportById(numId);

    if (!found) {
      return NextResponse.json(
        { error: "Transport not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(found, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Failed to get transport:", error);
    return NextResponse.json(
      { error: "Failed to fetch transport" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json(
        { error: "Invalid transport ID" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateTransportInput;
    body.id = numId;

    const updated = await updateTransport(numId, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Transport not found to update" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update transport:", error);
    return NextResponse.json(
      { error: "Failed to update transport" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json(
        { error: "Invalid transport ID" },
        { status: 400 }
      );
    }

    const success = await deleteTransport(numId);
    if (!success) {
      return NextResponse.json(
        { error: "Transport not found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Transport deleted successfully",
      id: numId,
    });
  } catch (error) {
    console.error("Failed to delete transport:", error);
    return NextResponse.json(
      { error: "Failed to delete transport" },
      { status: 500 }
    );
  }
}
