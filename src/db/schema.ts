import {
  pgSchema,
  text,
  boolean,
  timestamp,
  numeric,
  doublePrecision,
  index,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Schema namespace: "transport"
export const transportSchema = pgSchema("transport");

export const transports = transportSchema.table(
  "transports",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    gstNumber: text("gst_number"),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("idx_transports_name").on(table.name),
  })
);

export const transportLocations = transportSchema.table(
  "transport_locations",
  {
    id: serial("id").primaryKey(),
    transportId: integer("transport_id")
      .notNull()
      .references(() => transports.id, { onDelete: "cascade" }),
    locationType: text("location_type").notNull(), // 'office' | 'pickup_only' | 'dropoff_only' | 'pickup_and_dropoff'
    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    pinCode: text("pin_code").notNull(),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    businessHoursStart: text("business_hours_start").notNull(), // "HH:MM"
    businessHoursEnd: text("business_hours_end").notNull(), // "HH:MM"
    contactPhone: text("contact_phone"),
  },
  (table) => ({
    cityIdx: index("idx_locations_city").on(table.city),
    stateIdx: index("idx_locations_state").on(table.state),
    pinCodeIdx: index("idx_locations_pin_code").on(table.pinCode),
    transportIdIdx: index("idx_locations_transport_id").on(table.transportId),
  })
);

export const transportPricing = transportSchema.table(
  "transport_pricing",
  {
    id: serial("id").primaryKey(),
    transportId: integer("transport_id")
      .notNull()
      .references(() => transports.id, { onDelete: "cascade" }),
    pricingType: text("pricing_type").notNull(), // 'weight' | 'box_size'
    rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
    unit: text("unit").notNull(), // 'g'|'kg'|'quintal'|'tonne'|'small_box'|'medium_box'|'large_box'|'per_cft'|'per_cbm'
    notes: text("notes"),
  },
  (table) => ({
    transportIdIdx: index("idx_pricing_transport_id").on(table.transportId),
    unitIdx: index("idx_pricing_unit").on(table.unit),
  })
);

export const transportsRelations = relations(transports, ({ many }) => ({
  locations: many(transportLocations),
  pricing: many(transportPricing),
}));

export const transportLocationsRelations = relations(
  transportLocations,
  ({ one }) => ({
    transport: one(transports, {
      fields: [transportLocations.transportId],
      references: [transports.id],
    }),
  })
);

export const transportPricingRelations = relations(
  transportPricing,
  ({ one }) => ({
    transport: one(transports, {
      fields: [transportPricing.transportId],
      references: [transports.id],
    }),
  })
);
