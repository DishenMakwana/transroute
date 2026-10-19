import "dotenv/config";
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
  const initial = await getAllTransportsWithDetails();
  console.log(
    `[PASS] Successfully queried database transports count: ${initial.length}`
  );

  // 5. Create New Transport Test with Auto-Generated Serial ID
  const newTransport = await createTransport({
    name: "Test Freight Line",
    phoneNumber: "+91 99000 88776",
    gstNumber: "99AAACG9999F1Z0",
    isVerified: true,
    locations: [
      {
        locationType: "office",
        name: "Test Origin Dispatch Hub",
        address: "Plot 101, Industrial Area",
        city: "TestCityA",
        state: "StateA",
        pinCode: "100001",
        businessHoursStart: "09:00",
        businessHoursEnd: "20:00",
      },
      {
        locationType: "dropoff_only",
        name: "Test Destination Terminal",
        address: "Plot 12, Terminal Area",
        city: "TestCityB",
        state: "StateB",
        pinCode: "200002",
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
    source: "TestCityA",
    destination: "TestCityB",
  });
  const exists = verifyCreated.transports.some((t) => t.id === createdId);
  console.log(
    `[PASS] Verified created transport found on route TestCityA -> TestCityB: ${exists}`
  );
  if (!exists) throw new Error("Created transport not found on route");

  // 6. Update Transport Test
  const updated = await updateTransport(createdId, {
    id: createdId,
    name: "Test Freight Line (Updated)",
  });
  console.log(`[PASS] Updated transport name: ${updated?.name}`);
  if (updated?.name !== "Test Freight Line (Updated)")
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
    source: "TestCityA",
    destination: "TestCityB",
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
