"use client";

import { ArrowLeftRight, X, SlidersHorizontal } from "lucide-react";
import { SearchBarProps } from "@/types";
import CitySearchInput from "./CitySearchInput";

const POPULAR_CORRIDORS = [
  { from: "Ahmedabad", to: "Mumbai" },
  { from: "Pune", to: "Surat" },
  { from: "Rajkot", to: "Gandhidham" },
  { from: "New Delhi", to: "Ahmedabad" },
  { from: "Vadodara", to: "Mumbai" },
];

export default function SearchBar({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  onSwap,
  onClear,
  availableCities,
  availableLocations,
  onOpenFilterModal,
  activeFilterCount = 0,
}: SearchBarProps) {
  const hasActiveQuery = Boolean(source || destination);

  return (
    <div className="relative z-40 bg-zinc-900/90 rounded-2xl p-4 sm:p-4.5 border border-zinc-800/90 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Source Input */}
        <CitySearchInput
          id="source-input"
          label="Dispatch Origin / Pickup City or PIN"
          value={source}
          onChange={onSourceChange}
          placeholder="e.g. Ahmedabad, 382427, Aslali..."
          availableCities={availableCities}
          availableLocations={availableLocations}
          theme="orange"
        />

        {/* Swap Button */}
        <div className="flex items-center justify-center pt-5">
          <button
            type="button"
            onClick={onSwap}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-orange-950/50 hover:border-orange-700 hover:text-orange-400 text-zinc-300 transition-all cursor-pointer shadow-inner"
            title="Swap Source and Destination"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        {/* Destination Input */}
        <CitySearchInput
          id="dest-input"
          label="Delivery Destination / Dropoff Hub"
          value={destination}
          onChange={onDestinationChange}
          placeholder="e.g. Mumbai, Bhiwandi, 400009..."
          availableCities={availableCities}
          availableLocations={availableLocations}
          theme="emerald"
        />

        {/* Clear Search */}
        {hasActiveQuery && (
          <div className="flex items-center justify-center pt-5">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/50 border border-rose-800/60 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Trade Corridor Shortcut Chips & Filter button on right */}
      <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Popular Trade Corridors:
          </span>
          {POPULAR_CORRIDORS.map((c) => {
            const isSelected = source === c.from && destination === c.to;
            return (
              <button
                key={`${c.from}-${c.to}`}
                type="button"
                onClick={() => {
                  onSourceChange(c.from);
                  onDestinationChange(c.to);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  isSelected
                    ? "bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30"
                    : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-100"
                }`}
              >
                {c.from} <span className="text-zinc-500">→</span> {c.to}
              </button>
            );
          })}
        </div>

        {onOpenFilterModal && (
          <button
            type="button"
            onClick={onOpenFilterModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ml-auto ${
              activeFilterCount > 0
                ? "bg-orange-500/15 border-orange-500/40 text-orange-400 hover:bg-orange-500/25 shadow-sm shadow-orange-500/10"
                : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-orange-500 text-zinc-950 text-[10px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
