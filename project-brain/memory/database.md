# Memory — Database Schema

## Tables (`src/db/schema.ts`)
1. **`transports`**:
   - `id`: serial primary key
   - `name`: text, not null
   - `phone_number`: text, not null
   - `gst_number`: text, nullable
   - `is_verified`: boolean, default false
   - `created_at`, `updated_at`: timestamps
2. **`transport_locations`**:
   - `id`: serial primary key
   - `transport_id`: integer references `transports.id` (cascade delete)
   - `location_type`: enum (`office`, `pickup_only`, `dropoff_only`, `pickup_and_dropoff`)
   - `name`: text, not null
   - `address`: text, not null
   - `city`: text, not null
   - `state`: text, not null
   - `pin_code`: text, not null
   - `lat`, `lng`: double precision
   - `business_hours_start`, `business_hours_end`: text, not null
   - `contact_phone`: text
3. **`transport_pricing`**:
   - `id`: serial primary key
   - `transport_id`: integer references `transports.id` (cascade delete)
   - `pricing_type`: enum (`weight`, `box_size`)
   - `rate`: double precision, not null
   - `unit`: text, not null
   - `notes`: text
