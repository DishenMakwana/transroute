import { db, pool } from "./db";
import { transports, transportLocations, transportPricing } from "./schema";
import { initialTransportsData } from "./seed-data";

async function seed() {
  console.log("=== SEEDING POSTGRESQL DATABASE (SCHEMA: transport) ===");

  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL successfully.");

    // Ensure schema exists and reset tables + restart sequences from 1
    await client.query("CREATE SCHEMA IF NOT EXISTS transport;");
    try {
      await client.query(
        "TRUNCATE transport.transport_pricing, transport.transport_locations, transport.transports RESTART IDENTITY CASCADE;"
      );
      console.log("Existing tables truncated and sequences reset to 1.");
    } catch {
      console.log(
        "Tables empty or not yet created. Proceeding to insert seed records..."
      );
    }
    client.release();

    for (const t of initialTransportsData) {
      console.log(`Seeding transporter: ${t.name}...`);

      // Insert transport and retrieve auto-generated integer ID
      const [insertedTransport] = await db
        .insert(transports)
        .values({
          name: t.name,
          phoneNumber: t.phoneNumber,
          gstNumber: t.gstNumber || null,
          isVerified: t.isVerified ?? false,
        })
        .returning({ id: transports.id });

      const transportId = insertedTransport.id;
      console.log(`  -> Assigned Transporter ID: #${transportId}`);

      // Insert locations using auto-generated serial ID and foreign key transportId
      if (t.locations.length > 0) {
        await db.insert(transportLocations).values(
          t.locations.map((loc) => ({
            transportId,
            locationType: loc.locationType,
            name: loc.name,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            pinCode: loc.pinCode,
            lat: loc.lat ?? null,
            lng: loc.lng ?? null,
            businessHoursStart: loc.businessHoursStart,
            businessHoursEnd: loc.businessHoursEnd,
            contactPhone: loc.contactPhone ?? null,
          }))
        );
      }

      // Insert pricing using auto-generated serial ID and foreign key transportId
      if (t.pricing.length > 0) {
        await db.insert(transportPricing).values(
          t.pricing.map((p) => ({
            transportId,
            pricingType: p.pricingType,
            rate: p.rate.toString(),
            unit: p.unit,
            notes: p.notes ?? null,
          }))
        );
      }
    }

    const [tCount, lCount, pCount] = await Promise.all([
      db.select().from(transports),
      db.select().from(transportLocations),
      db.select().from(transportPricing),
    ]);

    console.log(`\n[SUCCESS] Seed complete!`);
    console.log(`  - Transporters in DB: ${tCount.length}`);
    console.log(`  - Facilities in DB: ${lCount.length}`);
    console.log(`  - Rate cards in DB: ${pCount.length}`);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
