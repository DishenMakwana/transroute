import { NextResponse } from "next/server";
import { getAllTransportsWithDetails } from "@/db/storage";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await getAllTransportsWithDetails();

    // 1. Transporters Sheet
    const transportsSheetData = all.map((t) => ({
      "Transport ID": t.id,
      "Transport Name": t.name,
      "Phone Number": t.phoneNumber,
      "GST Number": t.gstNumber || "N/A",
      "Verified Operator": t.isVerified ? "Yes" : "No",
      "Total Facilities": t.locations.length,
      "Rate Tiers": t.pricing.length,
      "Currently Open": t.isOpenNow ? "Open" : "Closed",
    }));

    // 2. Locations Sheet
    const locationsSheetData = all.flatMap((t) =>
      t.locations.map((loc) => ({
        "Transport ID": t.id,
        "Transport Name": t.name,
        "Facility Name": loc.name,
        "Facility Type": loc.locationType,
        Address: loc.address,
        City: loc.city,
        State: loc.state,
        "PIN Code": loc.pinCode,
        Latitude: loc.lat ?? "N/A",
        Longitude: loc.lng ?? "N/A",
        "Business Hours Start": loc.businessHoursStart,
        "Business Hours End": loc.businessHoursEnd,
        "Direct Phone": loc.contactPhone || t.phoneNumber,
      }))
    );

    // 3. Pricing Sheet
    const pricingSheetData = all.flatMap((t) =>
      t.pricing.map((p) => ({
        "Transport ID": t.id,
        "Transport Name": t.name,
        "Pricing Type": p.pricingType,
        "Rate (INR)": p.rate,
        Unit: p.unit,
        Notes: p.notes || "",
      }))
    );

    const workbook = XLSX.utils.book_new();

    const wsTransports = XLSX.utils.json_to_sheet(transportsSheetData);
    const wsLocations = XLSX.utils.json_to_sheet(locationsSheetData);
    const wsPricing = XLSX.utils.json_to_sheet(pricingSheetData);

    XLSX.utils.book_append_sheet(workbook, wsTransports, "Transporters");
    XLSX.utils.book_append_sheet(workbook, wsLocations, "Offices & Godowns");
    XLSX.utils.book_append_sheet(workbook, wsPricing, "Rate Cards");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    }) as Buffer;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Indian_Box_Transport_Directory_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Failed to generate Excel export:", error);
    return NextResponse.json(
      { error: "Failed to export transport directory" },
      { status: 500 }
    );
  }
}
