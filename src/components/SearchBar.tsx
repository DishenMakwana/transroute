"use client";

import { ArrowLeftRight, X, SlidersHorizontal } from "lucide-react";
import { SearchBarProps } from "@/types";
import CitySearchInput from "./CitySearchInput";

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
  isLoading = false,
}: SearchBarProps) {
  const hasActiveQuery = Boolean(source || destination);

  const popularCorridors =
    availableCities.length >= 2
      ? [
          { from: availableCities[0], to: availableCities[1] },
          ...(availableCities.length >= 3
            ? [{ from: availableCities[1], to: availableCities[2] }]
            : []),
          ...(availableCities.length >= 4
            ? [{ from: availableCities[0], to: availableCities[2] }]
            : []),
          ...(availableCities.length >= 4
            ? [{ from: availableCities[2], to: availableCities[3] }]
            : []),
          ...(availableCities.length >= 5
            ? [{ from: availableCities[3], to: availableCities[4] }]
            : []),
        ]
      : [];

  return (
    <div className="relative z-40 bg-zinc-900/90 rounded-2xl p-3.5 sm:p-4.5 border border-zinc-800/90 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3">
        {/* Source Input */}
        <div className="flex-1 min-w-0">
          <CitySearchInput
            id="source-input"
            label="Origin (Pickup City / PIN)"
            value={source}
            onChange={onSourceChange}
            placeholder="Search origin city, area or PIN code..."
            availableCities={availableCities}
            availableLocations={availableLocations}
            theme="orange"
          />
        </div>

        {/* Swap & Clear Action Center */}
        <div className="relative flex items-center justify-center -my-1 lg:my-0 lg:pt-5 z-10 shrink-0">
          <div
            className="absolute inset-0 flex items-center lg:hidden"
            aria-hidden="true"
          >
            <div className="w-full border-t border-zinc-800" />
          </div>
          <button
            type="button"
            onClick={onSwap}
            className="relative p-2 sm:p-2.5 rounded-full border border-zinc-750 bg-zinc-950 hover:bg-orange-950/50 hover:border-orange-700 hover:text-orange-400 text-zinc-300 transition-all cursor-pointer shadow-md active:scale-90"
            title="Swap Origin and Destination"
          >
            <ArrowLeftRight className="h-4 w-4 rotate-90 lg:rotate-0 transition-transform" />
          </button>

          {/* Mobile Clear Button */}
          {hasActiveQuery && (
            <button
              type="button"
              onClick={onClear}
              className="lg:hidden absolute right-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-rose-400 hover:bg-rose-950/50 border border-rose-800/60 bg-zinc-950 transition-colors cursor-pointer active:scale-95"
              title="Clear Route"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Destination Input */}
        <div className="flex-1 min-w-0">
          <CitySearchInput
            id="dest-input"
            label="Destination (Dropoff Hub / PIN)"
            value={destination}
            onChange={onDestinationChange}
            placeholder="Search destination city, area or PIN code..."
            availableCities={availableCities}
            availableLocations={availableLocations}
            theme="emerald"
          />
        </div>

        {/* Desktop Clear Search */}
        {hasActiveQuery && (
          <div className="hidden lg:flex items-center justify-center pt-5 shrink-0">
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

      {/* Trade Corridor Shortcut Chips & Filter button */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2.5">
        {popularCorridors.length > 0 ? (
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar scroll-smooth py-0.5 touch-pan-x">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              Popular Trade Corridors:
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0 sm:hidden">
              Routes:
            </span>
            {popularCorridors.map((c) => {
              const isSelected = source === c.from && destination === c.to;
              return (
                <button
                  key={`${c.from}-${c.to}`}
                  type="button"
                  onClick={() => {
                    onSourceChange(c.from);
                    onDestinationChange(c.to);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium whitespace-nowrap shrink-0 active:scale-95 ${
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
        ) : isLoading || availableCities.length === 0 ? (
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden py-0.5 animate-pulse">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0 hidden sm:inline">
              Popular Trade Corridors:
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0 sm:hidden">
              Routes:
            </span>
            <div className="h-6 w-24 sm:w-28 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0" />
            <div className="h-6 w-28 sm:w-32 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0" />
            <div className="h-6 w-24 sm:w-28 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0" />
            <div className="h-6 w-28 sm:w-32 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0 hidden md:block" />
          </div>
        ) : (
          <div />
        )}

        {onOpenFilterModal && (
          <button
            type="button"
            onClick={onOpenFilterModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 active:scale-95 ${
              activeFilterCount > 0
                ? "bg-orange-500/15 border-orange-500/40 text-orange-400 hover:bg-orange-500/25 shadow-sm shadow-orange-500/10"
                : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
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

export function SearchBarSkeleton() {
  return (
    <div className="relative z-40 bg-zinc-900/90 rounded-2xl p-3.5 sm:p-4.5 border border-zinc-800/90 shadow-2xl backdrop-blur-sm animate-pulse">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3">
        {/* Origin Input Skeleton */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-orange-500/50" />
            <div className="h-3 w-36 rounded bg-zinc-800" />
          </div>
          <div className="h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-zinc-800" />
            <div className="h-3 w-48 rounded bg-zinc-850" />
          </div>
        </div>

        {/* Swap Action Skeleton */}
        <div className="relative flex items-center justify-center -my-1 lg:my-0 lg:pt-5 z-10 shrink-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-zinc-750 bg-zinc-950" />
        </div>

        {/* Destination Input Skeleton */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
            <div className="h-3 w-44 rounded bg-zinc-800" />
          </div>
          <div className="h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-zinc-800" />
            <div className="h-3 w-52 rounded bg-zinc-850" />
          </div>
        </div>
      </div>

      {/* Trade Corridor Shortcut Chips & Filter button */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden py-0.5">
          <div className="h-3 w-32 rounded bg-zinc-800 shrink-0 hidden sm:block" />
          <div className="h-6 w-28 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0" />
          <div className="h-6 w-32 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0" />
          <div className="h-6 w-28 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0" />
          <div className="h-6 w-32 rounded-lg bg-zinc-800/90 border border-zinc-750/50 shrink-0 hidden md:block" />
        </div>

        <div className="h-8 w-20 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0" />
      </div>
    </div>
  );
}
