import { db } from "./db";
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
  CacheEntry,
} from "@/types";
import { checkIsOpenNow } from "@/helpers/formatters";

let transportsCache: CacheEntry<TransportWithDetails[]> | null = null;
let analyticsCache: CacheEntry<AnalyticsSummary> | null = null;

function invalidateStorageCache(): void {
  transportsCache = null;
  analyticsCache = null;
}

export async function getAllTransportsWithDetails(): Promise<
  TransportWithDetails[]
> {
  const now = Date.now();
  if (transportsCache && transportsCache.expiresAt > now) {
    return transportsCache.data;
  }

  // Zero sequential awaits: run parallel database queries
  const [transportsList, allLocations, allPricing] = await Promise.all([
    db.select().from(transports),
    db.select().from(transportLocations),
    db.select().from(transportPricing),
  ]);

  const result: TransportWithDetails[] = transportsList.map((t) => {
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

  transportsCache = {
    data: result,
    expiresAt: now + 60_000,
  };

  return result;
}

export async function getTransportById(
  id: number
): Promise<TransportWithDetails | null> {
  // If cache is fresh, look up in-memory directly (<1ms)
  if (transportsCache && transportsCache.expiresAt > Date.now()) {
    return transportsCache.data.find((t) => t.id === id) || null;
  }

  // Otherwise run parallel queries for specific transport
  const [transportList, locations, pricing] = await Promise.all([
    db.select().from(transports).where(eq(transports.id, id)),
    db
      .select()
      .from(transportLocations)
      .where(eq(transportLocations.transportId, id)),
    db
      .select()
      .from(transportPricing)
      .where(eq(transportPricing.transportId, id)),
  ]);

  if (transportList.length === 0) return null;
  const t = transportList[0];

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
          const cityPrefixRegex = loc.city
            ? new RegExp(
                `^${loc.city.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s+`,
                "i"
              )
            : null;
          const area =
            (cityPrefixRegex
              ? loc.name.replace(cityPrefixRegex, "")
              : loc.name
            ).trim() || loc.city;
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
  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(transports)
      .values({
        name: input.name,
        phoneNumber: input.phoneNumber,
        gstNumber: input.gstNumber || null,
        isVerified: input.isVerified ?? false,
      })
      .returning();

    // Parallelize relational inserts via Promise.all
    const [insertedLocations, insertedPricing] = await Promise.all([
      input.locations && input.locations.length > 0
        ? tx
            .insert(transportLocations)
            .values(
              input.locations.map((loc) => ({
                transportId: inserted.id,
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
            .returning()
        : Promise.resolve([]),
      input.pricing && input.pricing.length > 0
        ? tx
            .insert(transportPricing)
            .values(
              input.pricing.map((prc) => ({
                transportId: inserted.id,
                pricingType: prc.pricingType,
                rate: prc.rate.toString(),
                unit: prc.unit,
                notes: prc.notes ?? null,
              }))
            )
            .returning()
        : Promise.resolve([]),
    ]);

    const isOpenNow = insertedLocations.some((loc) =>
      checkIsOpenNow(loc.businessHoursStart, loc.businessHoursEnd)
    );

    return {
      id: inserted.id,
      name: inserted.name,
      phoneNumber: inserted.phoneNumber,
      gstNumber: inserted.gstNumber,
      isVerified: inserted.isVerified,
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
      locations: insertedLocations.map((loc) => ({
        ...loc,
        locationType:
          loc.locationType as TransportWithDetails["locations"][number]["locationType"],
      })),
      pricing: insertedPricing.map((prc) => ({
        ...prc,
        rate: Number(prc.rate),
        pricingType:
          prc.pricingType as TransportWithDetails["pricing"][number]["pricingType"],
        unit: prc.unit as TransportWithDetails["pricing"][number]["unit"],
      })),
      isOpenNow,
    };
  });

  invalidateStorageCache();
  return result;
}

export async function updateTransport(
  id: number,
  input: UpdateTransportInput
): Promise<TransportWithDetails | null> {
  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(transports)
      .set({
        name: input.name,
        phoneNumber: input.phoneNumber,
        gstNumber: input.gstNumber,
        isVerified: input.isVerified,
        updatedAt: new Date(),
      })
      .where(eq(transports.id, id))
      .returning();

    if (!updated) return null;

    // Parallelize locations and pricing updates
    await Promise.all([
      (async () => {
        if (input.locations) {
          await tx
            .delete(transportLocations)
            .where(eq(transportLocations.transportId, id));

          if (input.locations.length > 0) {
            await tx.insert(transportLocations).values(
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
            );
          }
        }
      })(),
      (async () => {
        if (input.pricing) {
          await tx
            .delete(transportPricing)
            .where(eq(transportPricing.transportId, id));

          if (input.pricing.length > 0) {
            await tx.insert(transportPricing).values(
              input.pricing.map((prc) => ({
                transportId: id,
                pricingType: prc.pricingType,
                rate: prc.rate.toString(),
                unit: prc.unit,
                notes: prc.notes ?? null,
              }))
            );
          }
        }
      })(),
    ]);

    // Fetch fresh relations in parallel
    const [locations, pricing] = await Promise.all([
      tx
        .select()
        .from(transportLocations)
        .where(eq(transportLocations.transportId, id)),
      tx
        .select()
        .from(transportPricing)
        .where(eq(transportPricing.transportId, id)),
    ]);

    const isOpenNow = locations.some((loc) =>
      checkIsOpenNow(loc.businessHoursStart, loc.businessHoursEnd)
    );

    return {
      id: updated.id,
      name: updated.name,
      phoneNumber: updated.phoneNumber,
      gstNumber: updated.gstNumber,
      isVerified: updated.isVerified,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
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

  if (result) {
    invalidateStorageCache();
  }
  return result;
}

export async function deleteTransport(id: number): Promise<boolean> {
  const deleted = await db
    .delete(transports)
    .where(eq(transports.id, id))
    .returning({ id: transports.id });
  const success = deleted.length > 0;
  if (success) {
    invalidateStorageCache();
  }
  return success;
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const now = Date.now();
  if (analyticsCache && analyticsCache.expiresAt > now) {
    return analyticsCache.data;
  }

  const all = await getAllTransportsWithDetails();

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

  // Interstate trade corridor benchmarks derived dynamically from top cities
  const dynamicCorridors: {
    corridor: string;
    origin: string;
    destination: string;
  }[] = [];

  if (topCities.length >= 2) {
    for (let i = 0; i < topCities.length && dynamicCorridors.length < 6; i++) {
      for (
        let j = i + 1;
        j < topCities.length && dynamicCorridors.length < 6;
        j++
      ) {
        const originCity = topCities[i].city;
        const destCity = topCities[j].city;
        dynamicCorridors.push({
          corridor: `${originCity} ⇄ ${destCity}`,
          origin: originCity,
          destination: destCity,
        });
      }
    }
  }

  const corridorBenchmarks: CorridorBenchmark[] = dynamicCorridors.map((c) => {
    const originLower = c.origin.toLowerCase();
    const destLower = c.destination.toLowerCase();

    const matchingTransporters = all.filter((t) => {
      const cities = t.locations.map((loc) => loc.city.toLowerCase());
      const hasOrigin = cities.some((city) => city.includes(originLower));
      const hasDest = cities.some((city) => city.includes(destLower));
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

    const minPerKg = kgRates.length > 0 ? Math.min(...kgRates) : 0;
    const avgPerKg =
      kgRates.length > 0
        ? Number(
            (kgRates.reduce((a, b) => a + b, 0) / kgRates.length).toFixed(1)
          )
        : 0;
    const minBoxRate = boxRates.length > 0 ? Math.min(...boxRates) : 0;

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

  analyticsCache = {
    data: summary,
    expiresAt: now + 60_000,
  };

  return summary;
}
