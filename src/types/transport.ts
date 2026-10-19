import { TransportLocation, CreateLocationInput } from "./location";
import { TransportPricing, CreatePricingInput } from "./pricing";

interface Transport {
  id: number;
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
  id?: number;
  name: string;
  phoneNumber: string;
  gstNumber?: string | null;
  isVerified?: boolean;
  locations: CreateLocationInput[];
  pricing: CreatePricingInput[];
}

export interface UpdateTransportInput {
  id: number;
  name?: string;
  phoneNumber?: string;
  gstNumber?: string | null;
  isVerified?: boolean;
  locations?: CreateLocationInput[];
  pricing?: CreatePricingInput[];
}
