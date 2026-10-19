"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Building2,
  MapPin,
  Package,
  ShieldCheck,
  IndianRupee,
  Scale,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import CustomDropdown from "./CustomDropdown";
import {
  CreateLocationInput,
  CreatePricingInput,
  LocationType,
  PricingType,
  TransportModalProps,
  DropdownOption,
} from "@/types";

const FACILITY_OPTIONS: DropdownOption<LocationType>[] = [
  {
    value: "office",
    label: "Booking Office",
    sublabel: "Administrative & LR booking counters",
  },
  {
    value: "pickup_and_dropoff",
    label: "Pickup & Dropoff Hub",
    sublabel: "Full loading and delivery terminals",
  },
  {
    value: "dropoff_only",
    label: "Delivery Godown",
    sublabel: "Consignment unloading depots",
  },
  {
    value: "pickup_only",
    label: "Pickup Counter Only",
    sublabel: "Origin parcel acceptance points",
  },
];

const PRICING_BASIS_OPTIONS: DropdownOption<PricingType>[] = [
  {
    value: "weight",
    label: "Per Weight",
    sublabel: "Charged per kg, tonne, or quintal",
    badge: "Weight",
  },
  {
    value: "box_size",
    label: "Per Box / Size",
    sublabel: "Charged per carton or volume",
    badge: "Carton",
  },
];

const WEIGHT_UNITS_OPTIONS: DropdownOption<string>[] = [
  {
    value: "kg",
    label: "Per Kilogram (kg)",
    sublabel: "Standard per-kg parcel dispatch",
    badge: "Standard",
  },
  {
    value: "g",
    label: "Per Gram (g)",
    sublabel: "Lightweight samples & small packets",
  },
  {
    value: "quintal",
    label: "Per Quintal (100 kg)",
    sublabel: "Commercial trade consignments",
  },
  {
    value: "tonne",
    label: "Per Tonne (MT)",
    sublabel: "Bulk industrial full truck load",
  },
];

const BOX_UNITS_OPTIONS: DropdownOption<string>[] = [
  {
    value: "small_box",
    label: "Per Small Box (<8 kg)",
    sublabel: "Shoebox & sample cartons",
  },
  {
    value: "medium_box",
    label: "Per Medium Box (<25 kg)",
    sublabel: "Standard trade cartons",
    badge: "Standard",
  },
  {
    value: "large_box",
    label: "Per Large Box (<50 kg)",
    sublabel: "Master export cartons",
  },
  {
    value: "per_cft",
    label: "Per Cubic Foot (CFT)",
    sublabel: "Volumetric rate for lightweight cargo",
  },
  {
    value: "per_cbm",
    label: "Per Cubic Meter (CBM)",
    sublabel: "Palletized consolidated shipments",
  },
];

const DEFAULT_LOCATION: CreateLocationInput = {
  locationType: "office",
  name: "Head Booking Office",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  lat: null,
  lng: null,
  businessHoursStart: "09:00",
  businessHoursEnd: "20:00",
  contactPhone: "",
};

const DEFAULT_PRICING_WEIGHT: CreatePricingInput = {
  pricingType: "weight",
  rate: 0,
  unit: "kg",
  notes: "Standard parcel booking rate",
};

export default function TransportModal({
  isOpen,
  onClose,
  onSubmit,
  editTransport,
}: TransportModalProps) {
  const isEdit = Boolean(editTransport);

  const [id, setId] = useState<number | undefined>(undefined);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [locations, setLocations] = useState<CreateLocationInput[]>([
    DEFAULT_LOCATION,
  ]);
  const [pricing, setPricing] = useState<CreatePricingInput[]>([
    DEFAULT_PRICING_WEIGHT,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editTransport) {
      setId(editTransport.id);
      setName(editTransport.name);
      setPhoneNumber(editTransport.phoneNumber);
      setGstNumber(editTransport.gstNumber || "");
      setIsVerified(editTransport.isVerified);
      setLocations(
        editTransport.locations.map((loc) => ({
          locationType: loc.locationType,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          pinCode: loc.pinCode,
          lat: loc.lat,
          lng: loc.lng,
          businessHoursStart: loc.businessHoursStart,
          businessHoursEnd: loc.businessHoursEnd,
          contactPhone: loc.contactPhone || "",
        }))
      );
      setPricing(
        editTransport.pricing.map((p) => ({
          pricingType: p.pricingType,
          rate: p.rate,
          unit: p.unit,
          notes: p.notes || "",
        }))
      );
    } else {
      setId(undefined);
      setName("");
      setPhoneNumber("+91 ");
      setGstNumber("");
      setIsVerified(false);
      setLocations([DEFAULT_LOCATION]);
      setPricing([DEFAULT_PRICING_WEIGHT]);
    }
  }, [editTransport, isOpen]);

  if (!isOpen) return null;

  const handleAddLocation = () => {
    setLocations([
      ...locations,
      {
        ...DEFAULT_LOCATION,
        name: `Branch / Godown ${locations.length + 1}`,
        locationType: "pickup_and_dropoff",
      },
    ]);
  };

  const handleRemoveLocation = (index: number) => {
    if (locations.length === 1) {
      toast.error("At least one location is required");
      return;
    }
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleLocationChange = (
    index: number,
    field: keyof CreateLocationInput,
    value: string | number | null
  ) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [field]: value };
    setLocations(updated);
  };

  const handleAddPricing = () => {
    setPricing([
      ...pricing,
      {
        pricingType: "box_size",
        rate: 150,
        unit: "medium_box",
        notes: "Carton booking rate",
      },
    ]);
  };

  const handleRemovePricing = (index: number) => {
    if (pricing.length === 1) {
      toast.error("At least one pricing tier is recommended");
      return;
    }
    setPricing(pricing.filter((_, i) => i !== index));
  };

  const handlePricingChange = (
    index: number,
    field: keyof CreatePricingInput,
    value: string | number | null
  ) => {
    const updated = [...pricing];
    updated[index] = { ...updated[index], [field]: value };
    setPricing(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Transport company name is required");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    // Verify at least one location has city and address
    for (let i = 0; i < locations.length; i++) {
      if (!locations[i].city.trim() || !locations[i].address.trim()) {
        toast.error(`Please provide city and address for Location #${i + 1}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit(
        {
          ...(id !== undefined ? { id } : {}),
          name,
          phoneNumber,
          gstNumber: gstNumber.trim() ? gstNumber.trim().toUpperCase() : null,
          isVerified,
          locations,
          pricing,
        },
        isEdit
      );
      toast.success(
        isEdit
          ? "Transport updated successfully!"
          : "Transport added successfully!"
      );
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to save transport"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[92vh] text-zinc-100"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {isEdit ? "Edit Transport Option" : "Add New Transport Option"}
              </h2>
              <p className="text-xs text-zinc-400">
                Add road operator details, booking offices, parcel godowns, and
                rate cards
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto p-6 space-y-6 flex-1"
          >
            {/* 1. Basic Transporter Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 pb-1 border-b border-zinc-800 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-orange-400" />
                1. Operator Identification & Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Carrier ID (Database)
                  </label>
                  <div className="w-full h-10 px-3 flex items-center bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs font-semibold text-zinc-300 select-none">
                    {isEdit && id ? (
                      <span className="text-orange-400">#{id}</span>
                    ) : (
                      <span className="text-zinc-500 italic">
                        Auto-assigned (1 to ∞)
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Transport Company Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Alpha Roadways / Samay Roadways"
                    className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-zinc-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Primary Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    placeholder="+91 98250 12345"
                    className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-zinc-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    GST Number (GSTIN)
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 24AAACA1234D1Z8"
                    maxLength={15}
                    className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono font-medium text-zinc-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center pt-5">
                  <label className="relative flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="h-4 w-4 rounded bg-zinc-950 text-orange-600 border-zinc-700 focus:ring-orange-500"
                    />
                    <ShieldCheck className="h-4 w-4 text-sky-400" />
                    <span>Verified Road Transport Carrier</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Offices & Pickup/Dropoff Locations */}
            <div className="space-y-4 relative z-20">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  2. Offices & Pickup / Dropoff Points ({locations.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Point</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {locations.map((loc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 relative space-y-3"
                    style={{ zIndex: (locations.length - idx) * 10 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">
                          {idx + 1}
                        </span>
                        <span>Facility #{idx + 1}</span>
                      </span>

                      {locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(idx)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Remove this point"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      <div>
                        <CustomDropdown<LocationType>
                          label="Facility Type *"
                          icon={
                            <Building2 className="h-3.5 w-3.5 text-blue-400" />
                          }
                          value={loc.locationType}
                          options={FACILITY_OPTIONS}
                          onChange={(val) =>
                            handleLocationChange(idx, "locationType", val)
                          }
                          placeholder="Select Facility Type"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Facility Name / Label *
                        </label>
                        <input
                          type="text"
                          value={loc.name}
                          onChange={(e) =>
                            handleLocationChange(idx, "name", e.target.value)
                          }
                          placeholder="e.g. Central Godown Hub"
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Direct Contact Phone
                        </label>
                        <input
                          type="text"
                          value={loc.contactPhone || ""}
                          onChange={(e) =>
                            handleLocationChange(
                              idx,
                              "contactPhone",
                              e.target.value
                            )
                          }
                          placeholder="+91 98251 00000"
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Full Street Address *
                        </label>
                        <input
                          type="text"
                          value={loc.address}
                          onChange={(e) =>
                            handleLocationChange(idx, "address", e.target.value)
                          }
                          placeholder="Shop / Plot / Street, Industrial Estate"
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          value={loc.city}
                          onChange={(e) =>
                            handleLocationChange(idx, "city", e.target.value)
                          }
                          placeholder="Enter city"
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          State *
                        </label>
                        <input
                          type="text"
                          value={loc.state}
                          onChange={(e) =>
                            handleLocationChange(idx, "state", e.target.value)
                          }
                          placeholder="Enter state"
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-medium text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          value={loc.pinCode}
                          onChange={(e) =>
                            handleLocationChange(idx, "pinCode", e.target.value)
                          }
                          placeholder="e.g. 382427"
                          maxLength={6}
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Latitude (for Maps)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={loc.lat ?? ""}
                          onChange={(e) =>
                            handleLocationChange(
                              idx,
                              "lat",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          placeholder="e.g. 23.0225"
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Longitude (for Maps)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={loc.lng ?? ""}
                          onChange={(e) =>
                            handleLocationChange(
                              idx,
                              "lng",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          placeholder="e.g. 72.5714"
                          className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Business Hours (Start - End) *
                        </label>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <input
                            type="time"
                            value={loc.businessHoursStart}
                            onChange={(e) =>
                              handleLocationChange(
                                idx,
                                "businessHoursStart",
                                e.target.value
                              )
                            }
                            className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={loc.businessHoursEnd}
                            onChange={(e) =>
                              handleLocationChange(
                                idx,
                                "businessHoursEnd",
                                e.target.value
                              )
                            }
                            className="w-full h-11 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-zinc-100 hover:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Pricing & Rates */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-sky-400" />
                  3. Pricing & Freight Rate Cards ({pricing.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddPricing}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Rate</span>
                </button>
              </div>

              <div className="space-y-3">
                {pricing.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col md:flex-row items-stretch md:items-end gap-3 relative"
                    style={{ zIndex: (pricing.length - idx) * 10 }}
                  >
                    <div className="w-full md:w-56">
                      <CustomDropdown<PricingType>
                        label="Pricing Basis"
                        icon={<Coins className="h-3.5 w-3.5 text-amber-400" />}
                        value={p.pricingType}
                        options={PRICING_BASIS_OPTIONS}
                        onChange={(newType) => {
                          handlePricingChange(idx, "pricingType", newType);
                          handlePricingChange(
                            idx,
                            "unit",
                            newType === "weight" ? "kg" : "medium_box"
                          );
                        }}
                        placeholder="Select Basis"
                      />
                    </div>

                    <div className="w-full md:w-36">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5 text-sky-400" />
                        <span>Rate (₹ INR) *</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 font-semibold text-xs">
                          ₹
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={p.rate}
                          onChange={(e) =>
                            handlePricingChange(
                              idx,
                              "rate",
                              Number(e.target.value)
                            )
                          }
                          className="w-full h-11 pl-7 pr-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl font-bold text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-64">
                      <CustomDropdown<string>
                        label="Measurement Unit *"
                        icon={<Scale className="h-3.5 w-3.5 text-orange-400" />}
                        value={p.unit}
                        options={
                          p.pricingType === "weight"
                            ? WEIGHT_UNITS_OPTIONS
                            : BOX_UNITS_OPTIONS
                        }
                        onChange={(val) =>
                          handlePricingChange(idx, "unit", val)
                        }
                        placeholder="Select Unit"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Terms / Conditions (Optional)
                      </label>
                      <input
                        type="text"
                        value={p.notes || ""}
                        onChange={(e) =>
                          handlePricingChange(idx, "notes", e.target.value)
                        }
                        placeholder="e.g. Min 20 kg consignment"
                        className="w-full h-11 text-xs px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    {pricing.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePricing(idx)}
                        className="h-11 px-3 self-stretch md:self-end flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
                        title="Remove rate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Update Transporter"
                    : "Save Transporter"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
