import {
  getAllTransportsWithDetails,
  searchTransports,
  createTransport,
  updateTransport,
  deleteTransport,
  getAnalytics,
} from "./storage";
import * as XLSX from "xlsx";

async function runTests() {
  console.log("=== RUNNING TRANSROUTE SYSTEM TESTS ===");

  // 1. Initial Transports Load Test
  const all = await getAllTransportsWithDetails();
  console.log(`[PASS] Loaded initial transports count: ${all.length}`);
  if (all.length === 0) throw new Error("No transports loaded");

  // 2. Route Search Test (Ahmedabad -> Mumbai)
  const routeSearch = await searchTransports({
    source: "Ahmedabad",
    destination: "Mumbai",
  });
  console.log(
    `[PASS] Route search 'Ahmedabad -> Mumbai' found ${routeSearch.totalCount} carriers:`
  );
  routeSearch.transports.forEach((t) =>
    console.log(`       - ${t.name} (#${t.id})`)
  );
  if (routeSearch.totalCount === 0)
    throw new Error("Expected at least one Ahmedabad -> Mumbai carrier");

  // 3. Destination Only Search Test
  const destSearch = await searchTransports({
    destination: "Gandhidham",
  });
  console.log(
    `[PASS] Destination search 'Gandhidham' found ${destSearch.totalCount} carriers:`
  );
  destSearch.transports.forEach((t) =>
    console.log(`       - ${t.name} (#${t.id})`)
  );
  if (destSearch.totalCount === 0)
    throw new Error("Expected at least one Gandhidham carrier");

  // 4. Weight Unit Filter Test
  const tonneFilter = await searchTransports({
    weightUnit: "tonne",
  });
  console.log(
    `[PASS] Filter weightUnit='tonne' found ${tonneFilter.totalCount} bulk carriers`
  );
  if (tonneFilter.totalCount === 0)
    throw new Error("Expected bulk carriers with tonne rate");

  // 5. Create New Transport Test with Auto-Generated Serial ID
  const newTransport = await createTransport({
    name: "Gujarat Rapid Cargo Movers",
    phoneNumber: "+91 99000 88776",
    gstNumber: "24AAACG9999F1Z0",
    isVerified: true,
    locations: [
      {
        locationType: "office",
        name: "Surat Ring Road Booking Counter",
        address: "Shop 101, Textile Market, Ring Road",
        city: "Surat",
        state: "Gujarat",
        pinCode: "395002",
        businessHoursStart: "09:00",
        businessHoursEnd: "20:00",
      },
      {
        locationType: "dropoff_only",
        name: "Pune Hadapsar Godown",
        address: "Plot 12, Industrial Estate, Hadapsar",
        city: "Pune",
        state: "Maharashtra",
        pinCode: "411028",
        businessHoursStart: "08:30",
        businessHoursEnd: "19:30",
      },
    ],
    pricing: [
      {
        pricingType: "weight",
        rate: 8.2,
        unit: "kg",
        notes: "Test rapid rate",
      },
      {
        pricingType: "box_size",
        rate: 130,
        unit: "medium_box",
      },
    ],
  });
  const createdId = newTransport.id;
  console.log(
    `[PASS] Created new transport: ${newTransport.name} (Auto-assigned ID: #${createdId})`
  );

  // Verify it appears in search
  const verifyCreated = await searchTransports({
    source: "Surat",
    destination: "Pune",
  });
  const exists = verifyCreated.transports.some((t) => t.id === createdId);
  console.log(
    `[PASS] Verified created transport found on route Surat -> Pune: ${exists}`
  );
  if (!exists) throw new Error("Created transport not found on route");

  // 6. Update Transport Test
  const updated = await updateTransport(createdId, {
    id: createdId,
    name: "Gujarat Rapid Cargo Movers (Updated)",
  });
  console.log(`[PASS] Updated transport name: ${updated?.name}`);
  if (updated?.name !== "Gujarat Rapid Cargo Movers (Updated)")
    throw new Error("Update transport failed");

  // 7. Analytics Test
  const analytics = await getAnalytics();
  console.log(
    `[PASS] Analytics computed: ${analytics.totalTransporters} carriers, ${analytics.totalHubs} hubs in ${analytics.citiesCount} cities`
  );

  // 8. Excel Workbook Generation Test
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([
    { id: createdId, name: "Test Transport" },
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Transports");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  console.log(
    `[PASS] Excel buffer generated successfully: ${buf.length} bytes`
  );

  // 9. Delete Transport Test
  const deleted = await deleteTransport(createdId);
  console.log(`[PASS] Deleted test transport: ${deleted}`);
  if (!deleted) throw new Error("Delete failed");

  const verifyDeleted = await searchTransports({
    source: "Surat",
    destination: "Pune",
  });
  const stillExists = verifyDeleted.transports.some((t) => t.id === createdId);
  console.log(`[PASS] Verified transport no longer exists: ${!stillExists}`);
  if (stillExists) throw new Error("Deleted transport still found in search");

  console.log("\n=== ALL SYSTEM TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
