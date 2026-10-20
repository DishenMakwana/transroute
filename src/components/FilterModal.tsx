"use client";

import { useEffect } from "react";
import { SlidersHorizontal, X, RotateCcw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FilterModalProps,
  WeightUnit,
  BoxSizeUnit,
  SortOption,
  LocationType,
  DropdownOption,
} from "@/types";

const WEIGHT_OPTIONS: DropdownOption<string>[] = [
  { value: "", label: "All Weight Units" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "quintal", label: "Quintal (100 kg)" },
  { value: "tonne", label: "Metric Tonne (MT)" },
];

const BOX_OPTIONS: DropdownOption<string>[] = [
  { value: "", label: "All Box Sizes" },
  { value: "small_box", label: "Small Box (<8 kg)" },
  { value: "medium_box", label: "Medium Box (<25 kg)" },
  { value: "large_box", label: "Large Master Box (<50 kg)" },
  { value: "per_cft", label: "Per Cubic Foot (CFT)" },
  { value: "per_cbm", label: "Per Cubic Meter (CBM)" },
];

export const FACILITY_OPTIONS: DropdownOption<string>[] = [
  { value: "all", label: "All Facilities" },
  { value: "office", label: "Booking Office" },
  { value: "pickup_and_dropoff", label: "Pickup & Dropoff Hub" },
  { value: "dropoff_only", label: "Delivery Godown" },
  { value: "pickup_only", label: "Pickup Counter" },
];

const OPERATING_STATUS_OPTIONS: DropdownOption<string>[] = [
  { value: "all", label: "All Operating Hours" },
  { value: "open_now", label: "Open Now Only (IST)" },
];

const SORT_OPTIONS: DropdownOption<string>[] = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Transporter Name: A to Z" },
  { value: "name_desc", label: "Transporter Name: Z to A" },
];

const PRICE_PRESETS = [
  { label: "Any Budget", value: undefined },
  { label: "≤ ₹15", value: 15 },
  { label: "≤ ₹25", value: 25 },
  { label: "≤ ₹50", value: 50 },
  { label: "≤ ₹100", value: 100 },
  { label: "≤ ₹250", value: 250 },
];

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
}: FilterModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const activeCount = [
    Boolean(filters.openNow),
    Boolean(filters.weightUnit),
    Boolean(filters.boxSizeUnit),
    Boolean(filters.locationType && filters.locationType !== "all"),
    filters.maxPrice !== undefined,
    Boolean(filters.sortBy && filters.sortBy !== "price_asc"),
  ].filter(Boolean).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden sm:overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-zinc-950 rounded-none sm:rounded-2xl border-0 sm:border border-zinc-800/90 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] text-zinc-100"
          >
            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60 sm:bg-zinc-900/40 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-zinc-100">
                      Filter Transporters
                    </h2>
                    {activeCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {activeCount} active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1">
                    Select cargo weights, box cartons, budget constraints, and
                    facilities
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer shrink-0 ml-2"
                title="Close filters"
              >
                <X className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Modal Body: Cards on Mobile, Pill Lists on Desktop */}
            <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-5 flex-1 overscroll-contain">
              {/* Section 1: Weight Unit */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/45 border border-zinc-800/70 shadow-xs sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none space-y-2.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Weight Unit
                  </span>
                  <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                    Single Select
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                  {WEIGHT_OPTIONS.map((opt) => {
                    const isSelected =
                      (!filters.weightUnit && opt.value === "") ||
                      filters.weightUnit === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            weightUnit: (opt.value as WeightUnit) || undefined,
                          })
                        }
                        className={`text-xs px-3.5 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 rounded-xl sm:rounded-full border transition-all cursor-pointer font-medium flex items-center justify-center text-center ${
                          opt.value === "" ? "col-span-2 sm:col-span-1" : ""
                        } ${
                          isSelected
                            ? "bg-orange-500/15 border-orange-500 text-orange-400 font-semibold ring-1 ring-orange-500/30 shadow-xs"
                            : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Box / Carton Size */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/45 border border-zinc-800/70 shadow-xs sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none space-y-2.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Box / Carton Size
                  </span>
                  <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                    Single Select
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                  {BOX_OPTIONS.map((opt) => {
                    const isSelected =
                      (!filters.boxSizeUnit && opt.value === "") ||
                      filters.boxSizeUnit === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            boxSizeUnit:
                              (opt.value as BoxSizeUnit) || undefined,
                          })
                        }
                        className={`text-xs px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 rounded-xl sm:rounded-full border transition-all cursor-pointer font-medium flex items-center justify-center text-center leading-snug ${
                          opt.value === "" ? "col-span-2 sm:col-span-1" : ""
                        } ${
                          isSelected
                            ? "bg-orange-500/15 border-orange-500 text-orange-400 font-semibold ring-1 ring-orange-500/30 shadow-xs"
                            : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Maximum Budget Rate (₹) */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/45 border border-zinc-800/70 shadow-xs sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none space-y-2.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Max Rate (₹)
                  </span>
                  <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                    Filter Limit
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-0">
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                    {PRICE_PRESETS.map((preset) => {
                      const isSelected =
                        (preset.value === undefined &&
                          filters.maxPrice === undefined) ||
                        filters.maxPrice === preset.value;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            onFilterChange({
                              maxPrice: preset.value,
                            })
                          }
                          className={`text-xs px-2.5 py-2 sm:px-3.5 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-xl sm:rounded-full border transition-all cursor-pointer font-medium flex items-center justify-center text-center ${
                            isSelected
                              ? "bg-orange-500/15 border-orange-500 text-orange-400 font-semibold ring-1 ring-orange-500/30 shadow-xs"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-900"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}

                    {/* Custom Rate Input */}
                    <div className="col-span-3 sm:col-span-1 w-full mt-2 sm:mt-0 sm:w-auto sm:ml-1 relative flex items-center">
                      <span className="text-xs text-zinc-500 mr-2 shrink-0">
                        Custom:
                      </span>
                      <div className="relative flex-1 sm:w-28">
                        <span className="absolute inset-y-0 left-0 pl-3 sm:pl-2.5 flex items-center pointer-events-none text-zinc-400 text-xs font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={filters.maxPrice ?? ""}
                          onChange={(e) =>
                            onFilterChange({
                              maxPrice: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="e.g. 35"
                          className={`w-full h-10 sm:h-8 pl-7 sm:pl-6 pr-7 sm:pr-6 text-xs bg-zinc-900 border rounded-xl sm:rounded-full font-medium text-zinc-100 placeholder-zinc-500 transition-all focus:outline-hidden ${
                            filters.maxPrice !== undefined &&
                            !PRICE_PRESETS.some(
                              (p) => p.value === filters.maxPrice
                            )
                              ? "border-orange-500 bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30"
                              : "border-zinc-800 hover:border-zinc-700 focus:border-orange-500"
                          }`}
                        />
                        {filters.maxPrice !== undefined && (
                          <button
                            type="button"
                            onClick={() =>
                              onFilterChange({ maxPrice: undefined })
                            }
                            className="absolute inset-y-0 right-0 pr-2.5 sm:pr-2 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer"
                            title="Clear rate"
                          >
                            <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Facility Type */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/45 border border-zinc-800/70 shadow-xs sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none space-y-2.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Facility Type
                  </span>
                  <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                    Single Select
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                  {FACILITY_OPTIONS.map((opt) => {
                    const isSelected =
                      (!filters.locationType && opt.value === "all") ||
                      filters.locationType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            locationType: opt.value as LocationType | "all",
                          })
                        }
                        className={`text-xs px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 rounded-xl sm:rounded-full border transition-all cursor-pointer font-medium flex items-center justify-center text-center leading-snug ${
                          opt.value === "all" ? "col-span-2 sm:col-span-1" : ""
                        } ${
                          isSelected
                            ? "bg-orange-500/15 border-orange-500 text-orange-400 font-semibold ring-1 ring-orange-500/30 shadow-xs"
                            : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Operating Status */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/45 border border-zinc-800/70 shadow-xs sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none space-y-2.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Operating Status
                  </span>
                  <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                    Single Select
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                  {OPERATING_STATUS_OPTIONS.map((opt) => {
                    const isSelected =
                      (opt.value === "all" && !filters.openNow) ||
                      (opt.value === "open_now" && Boolean(filters.openNow));
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            openNow: opt.value === "open_now",
                          })
                        }
                        className={`text-xs px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 rounded-xl sm:rounded-full border transition-all cursor-pointer font-medium flex items-center justify-center text-center ${
                          isSelected
                            ? opt.value === "open_now"
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold ring-1 ring-emerald-500/30 shadow-xs"
                              : "bg-orange-500/15 border-orange-500 text-orange-400 font-semibold ring-1 ring-orange-500/30 shadow-xs"
                            : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 6: Sort Order */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/45 border border-zinc-800/70 shadow-xs sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none space-y-2.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Sort Order
                  </span>
                  <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                    Single Select
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected =
                      (!filters.sortBy && opt.value === "price_asc") ||
                      filters.sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            sortBy: opt.value as SortOption,
                          })
                        }
                        className={`text-xs px-3 py-2 sm:py-1.5 min-h-[42px] sm:min-h-0 rounded-xl sm:rounded-full border transition-all cursor-pointer font-medium flex items-center justify-center text-center leading-snug ${
                          isSelected
                            ? "bg-orange-500/15 border-orange-500 text-orange-400 font-semibold ring-1 ring-orange-500/30 shadow-xs"
                            : "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer: Clear All & Apply Action */}
            <div className="px-4.5 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-800/80 bg-zinc-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 pb-safe">
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors cursor-pointer flex items-center gap-1.5 py-1.5 px-1 min-h-[40px] sm:min-h-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear all</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-zinc-950 shadow-lg shadow-orange-500/20 transition-all cursor-pointer active:scale-95 min-h-[42px] sm:min-h-0"
              >
                <Check className="h-4 w-4" />
                <span>Show {totalCount} results</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
