export type WeightUnit = "g" | "kg" | "quintal" | "tonne";
export type BoxSizeUnit =
  "small_box" | "medium_box" | "large_box" | "per_cft" | "per_cbm";
export type PricingType = "weight" | "box_size";

export interface TransportPricing {
  id: number;
  transportId: number;
  pricingType: PricingType;
  rate: number;
  unit: WeightUnit | BoxSizeUnit;
  notes: string | null;
}

export interface CreatePricingInput {
  pricingType: PricingType;
  rate: number;
  unit: WeightUnit | BoxSizeUnit;
  notes?: string | null;
}
