import { db, pool } from "./db";
import { transports, transportLocations, transportPricing } from "./schema";
import { eq } from "drizzle-orm";
import {
  TransportWithDetails,
  CreateTransportInput,
  UpdateTransportInput,
  SearchFilters,
  SearchResult,
  AnalyticsSummary,
  RateDistribution,
  CityCoverageStat,
  StateCoverageStat,
  FacilityCompositionStat,
  CorridorRateComparison,
  CorridorBenchmark,
  LocationSuggestion,
} from "@/types";
import { initialTransportsData } from "./seed-data";
import { checkIsOpenNow } from "@/helpers/formatters";

// Fallback in-memory state with deep cloned seed data for zero-config local testing
let inMemoryTransports: TransportWithDetails[] = initialTransportsData.map(
  (t, tIdx) => {
    const tId = t.id ?? tIdx + 1;
    return {
      id: tId,
      name: t.name,
      phoneNumber: t.phoneNumber,
      gstNumber: t.gstNumber || null,
      isVerified: t.isVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
      locations: t.locations.map((loc, idx) => ({
        id: idx + 1,
        transportId: tId,
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
      })),
      pricing: t.pricing.map((p, idx) => ({
        id: idx + 1,
        transportId: tId,
        pricingType: p.pricingType,
        rate: p.rate,
        unit: p.unit,
        notes: p.notes ?? null,
      })),
    };
  }
);

let isDbAvailable: boolean | null = null;

async function checkDbConnection(): Promise<boolean> {
  if (isDbAvailable !== null) return isDbAvailable;
  try {
    const client = await pool.connect();
    client.release();
    isDbAvailable = true;
    return true;
  } catch {
    isDbAvailable = false;
    return false;
  }
}

// In-memory cache for ultra-fast sub-millisecond response times
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let cachedTransports: CacheEntry<TransportWithDetails[]> | null = null;
let cachedAnalytics: CacheEntry<AnalyticsSummary> | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function invalidateCache(): void {
  cachedTransports = null;
  cachedAnalytics = null;
}

export async function getAllTransportsWithDetails(
  bypassCache = false
): Promise<TransportWithDetails[]> {
  if (bypassCache) {
    invalidateCache();
  }
  const now = Date.now();
  if (
    !bypassCache &&
    cachedTransports &&
    now - cachedTransports.timestamp < CACHE_TTL_MS
  ) {
    return cachedTransports.data;
  }

  const hasDb = await checkDbConnection();

  if (hasDb) {
    // Zero sequential awaits: run parallel database queries
    const [transportsList, allLocations, allPricing] = await Promise.all([
      db.select().from(transports),
      db.select().from(transportLocations),
      db.select().from(transportPricing),
    ]);

    const mapped = transportsList.map((t) => {
      const locations = allLocations.filter((loc) => loc.transportId === t.id);
      const pricing = allPricing.filter((prc) => prc.transportId === t.id);

      const isOpenNow = locations.some((loc) =>
        checkIsOpenNow(loc.businessHoursStart, loc.businessHoursEnd)
      );

      return {
        id: t.id,
        name: t.name,
        phoneNumber: t.phoneNumber,
        gstNumber: t.gstNumber,
        isVerified: t.isVerified,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        locations: locations.map((loc) => ({
          ...loc,
          locationType:
            loc.locationType as TransportWithDetails["locations"][number]["locationType"],
        })),
        pricing: pricing.map((prc) => ({
          ...prc,
          rate: Number(prc.rate),
          pricingType:
            prc.pricingType as TransportWithDetails["pricing"][number]["pricingType"],
          unit: prc.unit as TransportWithDetails["pricing"][number]["unit"],
        })),
        isOpenNow,
      };
    });

    cachedTransports = { data: mapped, timestamp: now };
    return mapped;
  }

  // Fallback to in-memory store
  const fallbackMapped = inMemoryTransports.map((t) => ({
    ...t,
    isOpenNow: t.locations.some((loc) =>
      checkIsOpenNow(loc.businessHoursStart, loc.businessHoursEnd)
    ),
  }));

  cachedTransports = { data: fallbackMapped, timestamp: now };
  return fallbackMapped;
}

export async function searchTransports(
  filters: SearchFilters
): Promise<SearchResult> {
  const allTransports = await getAllTransportsWithDetails();

  const sourceTerm = filters.source?.trim().toLowerCase();
  const destTerm = filters.destination?.trim().toLowerCase();

  let filtered = allTransports.map((t) => {
    let matchedOrigin = undefined;
    let matchedDestination = undefined;

    if (sourceTerm) {
      matchedOrigin = t.locations.find((loc) => {
        const canPickup =
          loc.locationType === "office" ||
          loc.locationType === "pickup_only" ||
          loc.locationType === "pickup_and_dropoff";
        if (!canPickup) return false;

        const str =
          `${loc.city} ${loc.state} ${loc.pinCode} ${loc.address}`.toLowerCase();
        return str.includes(sourceTerm);
      });
    }

    if (destTerm) {
      matchedDestination = t.locations.find((loc) => {
        const canDropoff =
          loc.locationType === "office" ||
          loc.locationType === "dropoff_only" ||
          loc.locationType === "pickup_and_dropoff";
        if (!canDropoff) return false;

        const str =
          `${loc.city} ${loc.state} ${loc.pinCode} ${loc.address}`.toLowerCase();
        return str.includes(destTerm);
      });
    }

    return {
      ...t,
      matchedOrigin,
      matchedDestination,
    };
  });

  // Filter: If source provided, must have matchedOrigin
  if (sourceTerm) {
    filtered = filtered.filter((t) => Boolean(t.matchedOrigin));
  }

  // Filter: If destination provided, must have matchedDestination
  if (destTerm) {
    filtered = filtered.filter((t) => Boolean(t.matchedDestination));
  }

  // Filter: General query across name, phone, city, pin, gstin, or address
  const queryTerm = filters.query?.trim().toLowerCase();
  if (queryTerm) {
    const rawDigits = queryTerm.replace(/\D/g, "");
    filtered = filtered.filter((t) => {
      if (t.name.toLowerCase().includes(queryTerm)) return true;
      if (t.gstNumber?.toLowerCase().includes(queryTerm)) return true;
      const phoneDigits = t.phoneNumber.replace(/\D/g, "");
      if (rawDigits && phoneDigits.includes(rawDigits)) return true;
      return t.locations.some((loc) => {
        if (loc.city.toLowerCase().includes(queryTerm)) return true;
        if (loc.pinCode.includes(queryTerm)) return true;
        if (loc.name.toLowerCase().includes(queryTerm)) return true;
        if (loc.state.toLowerCase().includes(queryTerm)) return true;
        if (loc.address.toLowerCase().includes(queryTerm)) return true;
        if (loc.contactPhone && rawDigits) {
          const locPhoneDigits = loc.contactPhone.replace(/\D/g, "");
          if (locPhoneDigits.includes(rawDigits)) return true;
        }
        return false;
      });
    });
  }

  // Filter: Operating Status (Open Now)
  if (filters.openNow) {
    filtered = filtered.filter((t) => t.isOpenNow);
  }

  // Filter: Location Type (all vs specific)
  if (filters.locationType && filters.locationType !== "all") {
    filtered = filtered.filter((t) =>
      t.locations.some((loc) => loc.locationType === filters.locationType)
    );
  }

  // Filter: Weight Unit
  if (filters.weightUnit) {
    filtered = filtered.filter((t) =>
      t.pricing.some(
        (p) => p.pricingType === "weight" && p.unit === filters.weightUnit
      )
    );
  }

  // Filter: Box Size Unit
  if (filters.boxSizeUnit) {
    filtered = filtered.filter((t) =>
      t.pricing.some(
        (p) => p.pricingType === "box_size" && p.unit === filters.boxSizeUnit
      )
    );
  }

  // Filter: Price Range
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((t) =>
      t.pricing.some((p) => p.rate >= (filters.minPrice ?? 0))
    );
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((t) =>
      t.pricing.some((p) => p.rate <= (filters.maxPrice ?? Infinity))
    );
  }

  // Sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aKg = a.pricing.find((p) => p.unit === "kg")?.rate ?? 999999;
      const bKg = b.pricing.find((p) => p.unit === "kg")?.rate ?? 999999;

      switch (filters.sortBy) {
        case "price_asc":
          return aKg - bKg;
        case "price_desc":
          return bKg - aKg;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "hours":
          return (b.isOpenNow ? 1 : 0) - (a.isOpenNow ? 1 : 0);
        default:
          return 0;
      }
    });
  }

  // Extract all unique cities and unique PIN codes for autocomplete suggestions
  const cityMap = new Map<string, { state: string; hubCount: number }>();
  const pinMap = new Map<
    string,
    { city: string; state: string; area: string }
  >();

  allTransports.forEach((t) => {
    t.locations.forEach((loc) => {
      if (loc.city) {
        const existing = cityMap.get(loc.city);
        if (existing) {
          existing.hubCount += 1;
        } else {
          cityMap.set(loc.city, { state: loc.state || "", hubCount: 1 });
        }
      }

      if (loc.pinCode) {
        const cleanPin = loc.pinCode.trim();
        if (cleanPin && !pinMap.has(cleanPin)) {
          // Extract meaningful area label
          const area =
            loc.name
              .replace(
                /^(Ahmedabad|Mumbai|Pune|Surat|Rajkot|Vadodara|Delhi|New Delhi|Jaipur|Indore|Bhuj|Gandhidham)\s+/i,
                ""
              )
              .trim() || loc.city;
          pinMap.set(cleanPin, {
            city: loc.city,
            state: loc.state || "",
            area,
          });
        }
      }
    });
  });

  const availableLocations: LocationSuggestion[] = [];

  // 1. Add City suggestions
  Array.from(cityMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([city, meta]) => {
      availableLocations.push({
        type: "city",
        value: city,
        label: city,
        sublabel: `${meta.state} • ${meta.hubCount} ${meta.hubCount === 1 ? "Hub" : "Hubs"}`,
        city,
        state: meta.state,
        hubCount: meta.hubCount,
      });
    });

  // 2. Add PIN Code suggestions
  Array.from(pinMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([pin, meta]) => {
      availableLocations.push({
        type: "pincode",
        value: pin,
        label: pin,
        sublabel: `${meta.area}, ${meta.city} (${meta.state})`,
        city: meta.city,
        state: meta.state,
        pinCode: pin,
      });
    });

  return {
    transports: filtered,
    totalCount: filtered.length,
    activeFilters: filters,
    availableCities: Array.from(cityMap.keys()).sort(),
    availableLocations,
  };
}

export async function createTransport(
  input: CreateTransportInput
): Promise<TransportWithDetails> {
  const hasDb = await checkDbConnection();

  let assignedId: number;

  if (hasDb) {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(transports)
        .values({
          name: input.name,
          phoneNumber: input.phoneNumber,
          gstNumber: input.gstNumber || null,
          isVerified: input.isVerified ?? false,
        })
        .returning({ id: transports.id });

      assignedId = inserted.id;

      // Parallel database inserts using Promise.all
      const insertTasks: Promise<unknown>[] = [];

      if (input.locations && input.locations.length > 0) {
        insertTasks.push(
          tx.insert(transportLocations).values(
            input.locations.map((loc) => ({
              transportId: assignedId,
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
          )
        );
      }

      if (input.pricing && input.pricing.length > 0) {
        insertTasks.push(
          tx.insert(transportPricing).values(
            input.pricing.map((prc) => ({
              transportId: assignedId,
              pricingType: prc.pricingType,
              rate: prc.rate.toString(),
              unit: prc.unit,
              notes: prc.notes ?? null,
            }))
          )
        );
      }

      if (insertTasks.length > 0) {
        await Promise.all(insertTasks);
      }
    });
  } else {
    assignedId = (inMemoryTransports[0]?.id ?? 0) + 1;
  }

  const newTransport: TransportWithDetails = {
    id: assignedId!,
    name: input.name,
    phoneNumber: input.phoneNumber,
    gstNumber: input.gstNumber || null,
    isVerified: input.isVerified ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
    locations: input.locations.map((loc, idx) => ({
      id: idx + 1,
      transportId: assignedId!,
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
    })),
    pricing: input.pricing.map((p, idx) => ({
      id: idx + 1,
      transportId: assignedId!,
      pricingType: p.pricingType,
      rate: Number(p.rate),
      unit: p.unit,
      notes: p.notes ?? null,
    })),
    isOpenNow: input.locations.some((loc) =>
      checkIsOpenNow(loc.businessHoursStart, loc.businessHoursEnd)
    ),
  };

  // Always keep in-memory sync
  inMemoryTransports.unshift(newTransport);
  invalidateCache();
  return newTransport;
}

export async function updateTransport(
  id: number,
  input: UpdateTransportInput
): Promise<TransportWithDetails | null> {
  const hasDb = await checkDbConnection();

  if (hasDb) {
    await db.transaction(async (tx) => {
      await tx
        .update(transports)
        .set({
          name: input.name,
          phoneNumber: input.phoneNumber,
          gstNumber: input.gstNumber,
          isVerified: input.isVerified,
          updatedAt: new Date(),
        })
        .where(eq(transports.id, id));

      // Parallel cleanup of existing relations
      const deleteTasks: Promise<unknown>[] = [];
      if (input.locations) {
        deleteTasks.push(
          tx
            .delete(transportLocations)
            .where(eq(transportLocations.transportId, id))
        );
      }
      if (input.pricing) {
        deleteTasks.push(
          tx
            .delete(transportPricing)
            .where(eq(transportPricing.transportId, id))
        );
      }
      if (deleteTasks.length > 0) {
        await Promise.all(deleteTasks);
      }

      // Parallel insertion of updated relations
      const insertTasks: Promise<unknown>[] = [];
      if (input.locations && input.locations.length > 0) {
        insertTasks.push(
          tx.insert(transportLocations).values(
            input.locations.map((loc) => ({
              transportId: id,
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
          )
        );
      }

      if (input.pricing && input.pricing.length > 0) {
        insertTasks.push(
          tx.insert(transportPricing).values(
            input.pricing.map((prc) => ({
              transportId: id,
              pricingType: prc.pricingType,
              rate: prc.rate.toString(),
              unit: prc.unit,
              notes: prc.notes ?? null,
            }))
          )
        );
      }

      if (insertTasks.length > 0) {
        await Promise.all(insertTasks);
      }
    });
  }

  const existingIdx = inMemoryTransports.findIndex((t) => t.id === id);
  if (existingIdx === -1) {
    const all = await getAllTransportsWithDetails();
    invalidateCache();
    return all.find((t) => t.id === id) || null;
  }

  const existing = inMemoryTransports[existingIdx];

  const updated: TransportWithDetails = {
    ...existing,
    name: input.name ?? existing.name,
    phoneNumber: input.phoneNumber ?? existing.phoneNumber,
    gstNumber:
      input.gstNumber !== undefined ? input.gstNumber : existing.gstNumber,
    isVerified: input.isVerified ?? existing.isVerified,
    updatedAt: new Date(),
    locations: input.locations
      ? input.locations.map((loc, idx) => ({
          id: idx + 1,
          transportId: id,
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
      : existing.locations,
    pricing: input.pricing
      ? input.pricing.map((p, idx) => ({
          id: idx + 1,
          transportId: id,
          pricingType: p.pricingType,
          rate: Number(p.rate),
          unit: p.unit,
          notes: p.notes ?? null,
        }))
      : existing.pricing,
  };

  inMemoryTransports[existingIdx] = updated;
  invalidateCache();
  return updated;
}

export async function deleteTransport(id: number): Promise<boolean> {
  const hasDb = await checkDbConnection();

  if (hasDb) {
    await db.delete(transports).where(eq(transports.id, id));
  }

  inMemoryTransports = inMemoryTransports.filter((t) => t.id !== id);
  invalidateCache();
  return true;
}

export async function getAnalytics(
  bypassCache = false
): Promise<AnalyticsSummary> {
  if (bypassCache) {
    invalidateCache();
  }
  const now = Date.now();
  if (
    !bypassCache &&
    cachedAnalytics &&
    now - cachedAnalytics.timestamp < CACHE_TTL_MS
  ) {
    return cachedAnalytics.data;
  }

  const all = await getAllTransportsWithDetails(bypassCache);

  // Aggregate rates by unit
  const unitMap: Record<string, number[]> = {};
  all.forEach((t) => {
    t.pricing.forEach((p) => {
      if (!unitMap[p.unit]) unitMap[p.unit] = [];
      unitMap[p.unit].push(p.rate);
    });
  });

  const rateDistributions: RateDistribution[] = Object.entries(unitMap).map(
    ([unit, rates]) => {
      const min = Math.min(...rates);
      const max = Math.max(...rates);
      const avg = rates.reduce((sum, r) => sum + r, 0) / rates.length;
      return {
        unit,
        minRate: Number(min.toFixed(2)),
        maxRate: Number(max.toFixed(2)),
        avgRate: Number(avg.toFixed(2)),
        count: rates.length,
      };
    }
  );

  // Top cities and states by hub count
  const cityCountMap: Record<
    string,
    { state: string; count: number; transporters: Set<number> }
  > = {};
  const stateCountMap: Record<
    string,
    { count: number; cities: Set<string>; transporters: Set<number> }
  > = {};
  const facilityCountMap: Record<string, number> = {
    office: 0,
    pickup_only: 0,
    dropoff_only: 0,
    pickup_and_dropoff: 0,
  };
  let totalHubs = 0;

  all.forEach((t) => {
    t.locations.forEach((loc) => {
      totalHubs++;

      // City mapping
      if (!cityCountMap[loc.city]) {
        cityCountMap[loc.city] = {
          state: loc.state,
          count: 0,
          transporters: new Set(),
        };
      }
      cityCountMap[loc.city].count++;
      cityCountMap[loc.city].transporters.add(t.id);

      // State mapping
      if (!stateCountMap[loc.state]) {
        stateCountMap[loc.state] = {
          count: 0,
          cities: new Set(),
          transporters: new Set(),
        };
      }
      stateCountMap[loc.state].count++;
      stateCountMap[loc.state].cities.add(loc.city);
      stateCountMap[loc.state].transporters.add(t.id);

      // Facility type mapping
      if (loc.locationType in facilityCountMap) {
        facilityCountMap[loc.locationType]++;
      } else {
        facilityCountMap[loc.locationType] =
          (facilityCountMap[loc.locationType] || 0) + 1;
      }
    });
  });

  const topCities: CityCoverageStat[] = Object.entries(cityCountMap)
    .map(([city, data]) => ({
      city,
      state: data.state,
      hubCount: data.count,
      transporterCount: data.transporters.size,
    }))
    .sort((a, b) => b.hubCount - a.hubCount)
    .slice(0, 10);

  const stateCoverage: StateCoverageStat[] = Object.entries(stateCountMap)
    .map(([state, data]) => ({
      state,
      hubCount: data.count,
      cityCount: data.cities.size,
      transporterCount: data.transporters.size,
    }))
    .sort((a, b) => b.hubCount - a.hubCount);

  const facilityTypeLabels: Record<string, string> = {
    office: "Booking & Admin Office",
    pickup_and_dropoff: "Full Hub (Pickup & Drop)",
    pickup_only: "Dispatch Godown (Pickup)",
    dropoff_only: "Inward Terminal (Dropoff)",
  };

  const facilityBreakdown: FacilityCompositionStat[] = Object.entries(
    facilityCountMap
  )
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type,
      label: facilityTypeLabels[type] || type,
      count,
      percentage:
        totalHubs > 0 ? Number(((count / totalHubs) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Key corridor comparisons
  const corridorComparisons: CorridorRateComparison[] = all
    .slice(0, 8)
    .map((t) => {
      const kg = t.pricing.find((p) => p.unit === "kg")?.rate ?? 0;
      const med = t.pricing.find((p) => p.unit === "medium_box")?.rate ?? 0;
      return {
        name: t.name,
        perKgRate: kg,
        mediumBoxRate: med,
        verified: t.isVerified,
      };
    });

  // Interstate trade corridor benchmarks
  const definedCorridors = [
    {
      corridor: "Delhi NCR ⇄ Mumbai MMR",
      origin: "Delhi NCR",
      destination: "Mumbai",
      originMatch: ["delhi", "new delhi", "noida", "gurugram", "faridabad"],
      destMatch: ["mumbai", "navi mumbai", "thane", "bhiwandi"],
    },
    {
      corridor: "Mumbai MMR ⇄ Bengaluru",
      origin: "Mumbai",
      destination: "Bengaluru",
      originMatch: ["mumbai", "pune", "thane", "bhiwandi"],
      destMatch: ["bengaluru", "bangalore", "hosur"],
    },
    {
      corridor: "Ahmedabad ⇄ Surat (Gujarat Line)",
      origin: "Ahmedabad",
      destination: "Surat",
      originMatch: ["ahmedabad", "gandhinagar"],
      destMatch: ["surat", "vadodara", "ankleshwar"],
    },
    {
      corridor: "Bengaluru ⇄ Chennai (South Express)",
      origin: "Bengaluru",
      destination: "Chennai",
      originMatch: ["bengaluru", "bangalore"],
      destMatch: ["chennai", "sriperumbudur"],
    },
    {
      corridor: "Delhi NCR ⇄ Kolkata (East-West Trunk)",
      origin: "Delhi NCR",
      destination: "Kolkata",
      originMatch: ["delhi", "new delhi", "noida"],
      destMatch: ["kolkata", "howrah"],
    },
    {
      corridor: "Mumbai ⇄ Hyderabad",
      origin: "Mumbai",
      destination: "Hyderabad",
      originMatch: ["mumbai", "pune"],
      destMatch: ["hyderabad", "secunderabad"],
    },
  ];

  const corridorBenchmarks: CorridorBenchmark[] = definedCorridors.map((c) => {
    const matchingTransporters = all.filter((t) => {
      const cities = t.locations.map((loc) => loc.city.toLowerCase());
      const hasOrigin = c.originMatch.some((om) =>
        cities.some((city) => city.includes(om))
      );
      const hasDest = c.destMatch.some((dm) =>
        cities.some((city) => city.includes(dm))
      );
      return hasOrigin || hasDest;
    });

    const carriers =
      matchingTransporters.length > 0 ? matchingTransporters : all.slice(0, 3);
    const kgRates = carriers
      .map((t) => t.pricing.find((p) => p.unit === "kg")?.rate)
      .filter((r): r is number => r !== undefined && r > 0);
    const boxRates = carriers
      .map((t) => t.pricing.find((p) => p.unit === "medium_box")?.rate)
      .filter((r): r is number => r !== undefined && r > 0);

    const minPerKg = kgRates.length > 0 ? Math.min(...kgRates) : 8;
    const avgPerKg =
      kgRates.length > 0
        ? Number(
            (kgRates.reduce((a, b) => a + b, 0) / kgRates.length).toFixed(1)
          )
        : 14;
    const minBoxRate = boxRates.length > 0 ? Math.min(...boxRates) : 250;

    return {
      corridor: c.corridor,
      origin: c.origin,
      destination: c.destination,
      carriersCount: carriers.length,
      minPerKg,
      avgPerKg,
      minBoxRate,
    };
  });

  const summary: AnalyticsSummary = {
    totalTransporters: all.length,
    totalHubs,
    citiesCount: Object.keys(cityCountMap).length,
    statesCount: Object.keys(stateCountMap).length,
    rateDistributions,
    topCities,
    stateCoverage,
    facilityBreakdown,
    corridorComparisons,
    corridorBenchmarks,
  };

  cachedAnalytics = { data: summary, timestamp: now };
  return summary;
}
