export type LocationType =
  "office" | "pickup_only" | "dropoff_only" | "pickup_and_dropoff";

export interface TransportLocation {
  id: number;
  transportId: number;
  locationType: LocationType;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  lat: number | null;
  lng: number | null;
  businessHoursStart: string; // HH:MM (e.g. "09:00")
  businessHoursEnd: string; // HH:MM (e.g. "20:00")
  contactPhone: string | null;
}

export interface CreateLocationInput {
  locationType: LocationType;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  lat?: number | null;
  lng?: number | null;
  businessHoursStart: string;
  businessHoursEnd: string;
  contactPhone?: string | null;
}
