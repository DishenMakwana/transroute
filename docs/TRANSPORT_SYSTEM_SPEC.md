# Transport Directory & Route Search System: Technical Specification & Research

## 1. Executive Summary

This document specifies the technical architecture, data model, search matching algorithms, UI/UX interaction design, and open data integrations for a full-stack road transport and box dispatch discovery application built specifically for the Indian logistics market.

The system empowers manufacturers, traders, wholesalers, and shippers across India to search, compare, filter, and manage transport operators specializing exclusively in dispatching **boxes, cartons, packages, and product cargo** (strictly excluding passenger bus transit).

---

## 2. Domain & Scope Boundaries

### 2.1 Exclusive Scope: Box & Product Cargo Dispatch (India Only)
- **Included**: Road freight operators, Less-Than-Truckload (LTL) parcel booking offices, carton/box dispatchers, industrial goods carriers, container freight godowns, and door/godown delivery networks.
- **Excluded**: Passenger bus networks (e.g., GSRTC, MSRTC, private intercity passenger sleepers), local auto/taxi passenger services, and international shipping.
- **Geography**: Exclusively domestic logistics within India (intra-state and inter-state trade corridors across Gujarat, Maharashtra, Rajasthan, Delhi NCR, Madhya Pradesh, Karnataka, Tamil Nadu, etc.).

### 2.2 Target Logistics Operators Pre-loaded
1. **Alpha Roadways (Alfa Roadways)**: Regional LTL parcel and box freight operator connecting Gujarat industrial zones (Vadodara, Ahmedabad, Rajkot, Surat) to Mumbai/Maharashtra.
2. **Jay Ganesh Transport Service**: Renowned transport provider centered in Maharashtra (Pune, Pimpri-Chinchwad, Mumbai) with regular parcel and carton lines to Gujarat.
3. **Mahavir Trans Services**: Heavy machinery, industrial carton movement, and parcel booking across Gujarat, Maharashtra, and North India.
4. **Samay Roadways (Samay Transport)**: Industrial textile and machinery transport anchored in Ahmedabad (Sarkhej, Aslali, Narol) connecting Morbi, Rajkot, Surat, and Mumbai.
5. **Naranji Peraj Transport Co. (NPT)**: Heritage fleet operator established across Mumbai (Dana Bandar, Masjid Bunder) and Gujarat hubs (Rajkot, Ahmedabad, Vadodara, Bhuj).
6. **Kutch Highway Transport**: Specialized carrier connecting Kutch industrial and port belts (Gandhidham, Kandla, Mundra, Bhuj) to mainland Gujarat, Maharashtra, and North India.

---

## 3. Technology Stack & Architectural Standards

### 3.1 Technology Stack
* **Framework**: Next.js 16+ (App Router) with React 19 and TypeScript (Strict mode enabled, zero `any` allowed).
* **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`.
* **Database**: PostgreSQL with connection pooling (`pg` and `@neondatabase/serverless`).
* **ORM & Migrations**: Drizzle ORM (`drizzle-orm/node-postgres`, `drizzle-kit`).
* **Data Visualization**: Recharts (with custom SVG tooltips and y-axis padding).
* **UI & Animation**: Lucide React (`lucide-react`), Framer Motion (`framer-motion`), React Hot Toast (`react-hot-toast`), Geist font (`geist`).
* **File & Data Parsing**: `xlsx` (Excel export and bulk ingestion), `axios` (HTTP requests).

### 3.2 Architectural Invariants & Code Standards
1. **Database Singleton**: Implement a pooled Drizzle client in `src/db/db.ts` using `pg.Pool` with global reuse during development to prevent connection leakage across Next.js Fast Refresh cycles.
2. **Centralized Types**: All interfaces, schemas, and domain types reside in `src/types/` organized by domain (e.g. `src/types/transport.ts`, `src/types/location.ts`, `src/types/pricing.ts`, `src/types/search.ts`, `src/types/analytics.ts`). **Zero local component interfaces** are allowed; every component imports its contracts from `@/types`.
3. **Async Concurrency**: Zero sequential database awaits; execute independent database operations and lookups concurrently using `Promise.all([ ... ])`.
4. **Imports**: Strictly top-level static imports.

---

## 4. Database Schema & Data Models (PostgreSQL & Drizzle ORM)

### 4.1 Relational Architecture

```mermaid
erDiagram
    TRANSPORTS ||--o{ TRANSPORT_LOCATIONS : "operates"
    TRANSPORTS ||--o{ TRANSPORT_PRICING : "charges"

    TRANSPORTS {
        text id PK "Unique identifier (e.g. TRP-101)"
        text name "Company / Transporter Name"
        text phone_number "Phone / WhatsApp contact"
        text gst_number "15-digit Indian GSTIN"
        boolean is_verified "Verification Status"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Update timestamp"
    }

    TRANSPORT_LOCATIONS {
        text id PK "UUID"
        text transport_id FK "References transports.id"
        text location_type "office | pickup_only | dropoff_only | pickup_and_dropoff"
        text name "Branch / Godown Label"
        text address "Street address"
        text city "City (e.g. Ahmedabad)"
        text state "State (e.g. Gujarat)"
        text pin_code "6-digit Indian PIN code"
        doublePrecision lat "Latitude"
        doublePrecision lng "Longitude"
        text business_hours_start "HH:MM (e.g. 09:00)"
        text business_hours_end "HH:MM (e.g. 20:00)"
        text contact_phone "Direct branch phone"
    }

    TRANSPORT_PRICING {
        text id PK "UUID"
        text transport_id FK "References transports.id"
        text pricing_type "weight | box_size"
        numeric rate "Price in INR"
        text unit "g | kg | quintal | tonne | small_box | medium_box | large_box | per_cft | per_cbm"
        text notes "Terms or minimum billing"
    }
```

### 4.2 Drizzle ORM Schema (`src/db/schema.ts`)
```typescript
import { pgTable, text, boolean, timestamp, numeric, doublePrecision, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transports = pgTable("transports", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  gstNumber: text("gst_number"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transportLocations = pgTable("transport_locations", {
  id: text("id").primaryKey(),
  transportId: text("transport_id").notNull().references(() => transports.id, { onDelete: "cascade" }),
  locationType: text("location_type").notNull(), // 'office' | 'pickup_only' | 'dropoff_only' | 'pickup_and_dropoff'
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pinCode: text("pin_code").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  businessHoursStart: text("business_hours_start").notNull(),
  businessHoursEnd: text("business_hours_end").notNull(),
  contactPhone: text("contact_phone"),
}, (table) => ({
  cityIdx: index("idx_locations_city").on(table.city),
  stateIdx: index("idx_locations_state").on(table.state),
  pinCodeIdx: index("idx_locations_pin_code").on(table.pinCode),
  transportIdIdx: index("idx_locations_transport_id").on(table.transportId),
}));

export const transportPricing = pgTable("transport_pricing", {
  id: text("id").primaryKey(),
  transportId: text("transport_id").notNull().references(() => transports.id, { onDelete: "cascade" }),
  pricingType: text("pricing_type").notNull(), // 'weight' | 'box_size'
  rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // 'g'|'kg'|'quintal'|'tonne'|'small_box'|'medium_box'|'large_box'|'per_cft'|'per_cbm'
  notes: text("notes"),
}, (table) => ({
  transportPricingIdx: index("idx_pricing_transport_id").on(table.transportId),
}));

export const transportsRelations = relations(transports, ({ many }) => ({
  locations: many(transportLocations),
  pricing: many(transportPricing),
}));

export const transportLocationsRelations = relations(transportLocations, ({ one }) => ({
  transport: one(transports, {
    fields: [transportLocations.transportId],
    references: [transports.id],
  }),
}));

export const transportPricingRelations = relations(transportPricing, ({ one }) => ({
  transport: one(transports, {
    fields: [transportPricing.transportId],
    references: [transports.id],
  }),
}));
```

### 4.3 Database Client Singleton (`src/db/db.ts`)
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/db/schema";

const { Pool } = pg;

interface GlobalWithPool {
  pgPool?: pg.Pool;
}

const globalWithPool = globalThis as GlobalWithPool;

let pool: pg.Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  if (!globalWithPool.pgPool) {
    globalWithPool.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/transport_db",
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  pool = globalWithPool.pgPool;
}

export const db = drizzle(pool, { schema });
export { pool };
```

---

## 5. Centralized Domain Types (`src/types/`)

### `src/types/transport.ts`
```typescript
import { TransportLocation } from "./location";
import { TransportPricing } from "./pricing";

export interface Transport {
  id: string;
  name: string;
  phoneNumber: string;
  gstNumber: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransportWithDetails extends Transport {
  locations: TransportLocation[];
  pricing: TransportPricing[];
  matchedOrigin?: TransportLocation;
  matchedDestination?: TransportLocation;
  isOpenNow?: boolean;
}

export interface CreateTransportInput {
  id: string;
  name: string;
  phoneNumber: string;
  gstNumber?: string;
  isVerified?: boolean;
  locations: Omit<TransportLocation, "id" | "transportId">[];
  pricing: Omit<TransportPricing, "id" | "transportId">[];
}

export interface UpdateTransportInput extends Partial<CreateTransportInput> {
  id: string;
}
```

### `src/types/location.ts`
```typescript
export type LocationType = "office" | "pickup_only" | "dropoff_only" | "pickup_and_dropoff";

export interface TransportLocation {
  id: string;
  transportId: string;
  locationType: LocationType;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  lat: number | null;
  lng: number | null;
  businessHoursStart: string; // HH:MM
  businessHoursEnd: string;   // HH:MM
  contactPhone: string | null;
}
```

### `src/types/pricing.ts`
```typescript
export type WeightUnit = "g" | "kg" | "quintal" | "tonne";
export type BoxSizeUnit = "small_box" | "medium_box" | "large_box" | "per_cft" | "per_cbm";
export type PricingType = "weight" | "box_size";

export interface TransportPricing {
  id: string;
  transportId: string;
  pricingType: PricingType;
  rate: number;
  unit: WeightUnit | BoxSizeUnit;
  notes: string | null;
}
```

### `src/types/search.ts`
```typescript
import { TransportWithDetails } from "./transport";
import { LocationType } from "./location";
import { WeightUnit, BoxSizeUnit } from "./pricing";

export interface SearchFilters {
  source?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
  locationType?: LocationType | "all";
  weightUnit?: WeightUnit;
  boxSizeUnit?: BoxSizeUnit;
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "hours";
}

export interface SearchResult {
  transports: TransportWithDetails[];
  totalCount: number;
  activeFilters: SearchFilters;
}
```

### `src/types/analytics.ts`
```typescript
export interface RateDistribution {
  unit: string;
  minRate: number;
  maxRate: number;
  avgRate: number;
  count: number;
}

export interface CityCoverageStat {
  city: string;
  state: string;
  hubCount: number;
  transporterCount: number;
}
```

---

## 6. Search, Filter & Async Concurrency Architecture

### 6.1 Route Search Matching Rules
1. **Source $\to$ Destination Search**:
   - `Source` matches any location of type `office`, `pickup_only`, or `pickup_and_dropoff`.
   - `Destination` matches any location of type `office`, `dropoff_only`, or `pickup_and_dropoff`.
   - Matching is case-insensitive, trimming whitespace, and supports partial string matching on city, state, pin code, or street address.
2. **Specific Destination Search (Destination Only)**:
   - Evaluates any transport offering a dropoff hub or booking office in the target destination city/pincode.
3. **Async Concurrency Execution (`Promise.all`)**:
   - Transports, locations, pricing tables, and analytics stats are fetched concurrently via `Promise.all` rather than chaining sequential `await` statements.

---

## 7. Data Visualization Architecture (Recharts)

The application integrates Recharts for logistics intelligence:
- **Price Benchmarking by Weight Unit**: Bar chart comparing ₹/kg across operators on the selected route.
- **Carton/Box Size Pricing Comparison**: Categorical comparison for small, medium, and large boxes.
- **Geographic Network Coverage**: Horizontal bar chart showing top logistics gateway cities (Ahmedabad, Mumbai, Pune, Surat, Rajkot, etc.).
- **Chart Technical Standards**:
  - Custom SVG tooltips rendered with Tailwind typography and backdrop blur.
  - Generous y-axis padding (`domain={['auto', 'auto']}`) to prevent clipped labels.
  - Fully responsive containers (`<ResponsiveContainer width="100%" height={280}>`).

---

## 8. Free Data & API Research: Box & Product Freight Dispatch (India Only)

### 8.1 Evaluated Public Logistics Sources
1. **OpenStreetMap Overpass API**:
   - Free REST queries targeting `office=logistics`, `office=transport`, and `amenity=loading_dock`.
   - Zero bus data: completely separated from passenger stops.
2. **GST E-Way Bill System (`ewaybillgst.gov.in`)**:
   - 15-character TRANSIN transporter directory exclusively for commercial freight above ₹50,000.
3. **ONDC Logistics Protocol (`ONDC:LOG10` on GitHub)**:
   - Standardized schema for parcel/box delivery pricing based on weight (g/kg), dimensions (L/W/H), and volumetric CBM.
4. **India Post Parcel Service**:
   - Public tariff calculator API for domestic cartons up to 35 kg.
5. **Open Datasets on GitHub**:
   - Complete postal pincode mappings (`bilal-webdev/india-postal-pincode-dataset`).

---

## 9. Verification & Quality Assurance Strategy

1. **TypeScript Strict Type Check**: Run `tsc --noEmit` to ensure 0 type errors and 0 instances of `any`.
2. **Build Verification**: Run `next build` to verify server-side rendering, static imports, and route handlers.
3. **Database Integrity & Concurrent Operations**: Run test scripts verifying `Promise.all` queries, cascading deletes, and route search accuracy.
4. **Interactive UI Verification**: Test search by source/destination, modal form validation, delete confirmation prompt, Excel export via `xlsx`, and Recharts tooltips.
