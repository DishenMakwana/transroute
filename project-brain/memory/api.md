# Memory — API Contracts

## `GET /api/transports`
- **Query Params**:
  - `source`: origin city, area, state, or PIN code
  - `destination`: delivery city, area, state, or PIN code
  - `weightUnit`: `kg`, `g`, `quintal`, `tonne`
  - `boxSizeUnit`: `small_box`, `medium_box`, `large_box`, `per_cft`, `per_cbm`
  - `minPrice`: minimum rate
  - `maxPrice`: maximum rate
  - `locationType`: `office`, `pickup_and_dropoff`, `dropoff_only`, `pickup_only`, `all`
  - `openNow`: `true` | `false`
  - `sortBy`: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `hours`
- **Response**: `SearchResult` (`transports`, `totalCount`, `activeFilters`, `availableCities`, `availableLocations`).

## `POST /api/transports`
- **Body**: `CreateTransportInput` (`name`, `phoneNumber`, `gstNumber?`, `isVerified?`, `locations[]`, `pricing[]`).
- **Response**: `201 Created` with `TransportWithDetails`.
