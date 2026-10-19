import { TransportWithDetails } from "./transport";
import { LocationType } from "./location";
import { WeightUnit, BoxSizeUnit } from "./pricing";

export type SortOption =
  "price_asc" | "price_desc" | "name_asc" | "name_desc" | "hours";

export interface SearchFilters {
  source?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
  locationType?: LocationType | "all";
  weightUnit?: WeightUnit;
  boxSizeUnit?: BoxSizeUnit;
  sortBy?: SortOption;
}

export interface LocationSuggestion {
  type: "city" | "pincode";
  value: string;
  label: string;
  sublabel: string;
  city: string;
  state: string;
  pinCode?: string;
  hubCount?: number;
}

export interface SearchResult {
  transports: TransportWithDetails[];
  totalCount: number;
  activeFilters: SearchFilters;
  availableCities: string[];
  availableLocations?: LocationSuggestion[];
}

export const VALID_SORT_OPTIONS: SortOption[] = [
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
  "hours",
];

export const VALID_LOCATION_TYPES: (LocationType | "all")[] = [
  "all",
  "office",
  "pickup_and_dropoff",
];

export const VALID_WEIGHT_UNITS: WeightUnit[] = ["kg", "g", "quintal", "tonne"];

export const VALID_BOX_SIZES: BoxSizeUnit[] = [
  "small_box",
  "medium_box",
  "large_box",
  "per_cft",
  "per_cbm",
];
