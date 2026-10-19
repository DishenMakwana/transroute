"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  X,
  ChevronDown,
  Check,
  Building2,
  Search,
  Hash,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CitySearchInputProps, LocationSuggestion } from "@/types";

export default function CitySearchInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  availableCities,
  availableLocations,
  theme,
}: CitySearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isOrange = theme === "orange";

  // Build uniform suggestion list from availableLocations (or fallback to availableCities)
  const allSuggestions: LocationSuggestion[] = useMemo(() => {
    if (availableLocations && availableLocations.length > 0) {
      return availableLocations;
    }
    return availableCities.map((c) => ({
      type: "city" as const,
      value: c,
      label: c,
      sublabel: "Verified Logistics Corridor",
      city: c,
      state: "",
    }));
  }, [availableLocations, availableCities]);

  // Filter suggestions based on typed input (supports City Name, PIN Code, Area, or State)
  const filteredSuggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return allSuggestions;

    const isNumeric = /^\d+$/.test(q);

    return allSuggestions.filter((item) => {
      if (item.type === "pincode") {
        if (isNumeric) {
          return item.value.startsWith(q) || item.value.includes(q);
        }
        return (
          item.city.toLowerCase().includes(q) ||
          item.sublabel.toLowerCase().includes(q)
        );
      }
      return (
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q)
      );
    });
  }, [value, allSuggestions]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (filteredSuggestions.length === 0) return;
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (filteredSuggestions.length === 0) return;
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSelect(filteredSuggestions[highlightedIndex].value);
        } else if (value.trim()) {
          handleSelect(value.trim());
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      }
      case "Tab": {
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      }
    }
  };

  const handleClear = () => {
    onChange("");
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Label above input */}
      <label
        htmlFor={id}
        className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center justify-between"
      >
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full shrink-0 ${
              isOrange
                ? "bg-orange-500 shadow-xs shadow-orange-500/80"
                : "bg-emerald-500 shadow-xs shadow-emerald-500/80"
            }`}
          />
          <span>{label}</span>
        </span>
        {value && (
          <span className="text-[10px] lowercase text-zinc-500 font-normal">
            active filter
          </span>
        )}
      </label>

      {/* Input container */}
      <div className="relative">
        {/* Left Icon */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {/^\d+$/.test(value.trim()) ? (
            <Hash
              className={`h-4 w-4 transition-colors ${
                isOpen || value ? "text-sky-400" : "text-zinc-500"
              }`}
            />
          ) : (
            <MapPin
              className={`h-4 w-4 transition-colors ${
                isOrange
                  ? isOpen || value
                    ? "text-orange-400"
                    : "text-zinc-500"
                  : isOpen || value
                    ? "text-emerald-400"
                    : "text-zinc-500"
              }`}
            />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-16 py-2.5 text-sm bg-zinc-950 border rounded-xl font-medium text-zinc-100 placeholder-zinc-500 transition-all outline-hidden ${
            isOpen
              ? isOrange
                ? "border-orange-500 ring-2 ring-orange-500/25 bg-zinc-950"
                : "border-emerald-500 ring-2 ring-emerald-500/25 bg-zinc-950"
              : "border-zinc-800 hover:border-zinc-700"
          }`}
        />

        {/* Right Action Buttons */}
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear location"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (!isOpen && inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title={
              isOpen ? "Close suggestions" : "Browse available hubs & PIN codes"
            }
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "transform rotate-180 text-zinc-200" : "text-zinc-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bespoke Dark Theme Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-zinc-900/95 border border-zinc-750/90 shadow-2xl shadow-black ring-1 ring-white/10 backdrop-blur-xl overflow-hidden"
          >
            {/* Dropdown Header */}
            <div className="px-3.5 py-2.5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1 rounded-md ${
                    isOrange
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  {isOrange
                    ? "Dispatch Hubs & PIN Codes"
                    : "Delivery Hubs & PIN Codes"}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                {filteredSuggestions.length}{" "}
                {filteredSuggestions.length === 1 ? "option" : "options"}
              </span>
            </div>

            {/* Suggestions List: Cities and PIN codes */}
            <div
              ref={listRef}
              role="listbox"
              className="max-h-64 overflow-y-auto p-1.5 space-y-1 overscroll-contain"
            >
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((item, idx) => {
                  const isSelected =
                    value.trim().toLowerCase() === item.value.toLowerCase();
                  const isHighlighted = idx === highlightedIndex;
                  const isPin = item.type === "pincode";

                  return (
                    <button
                      key={`${item.type}-${item.value}`}
                      type="button"
                      role="option"
                      data-index={idx}
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelect(item.value)}
                      className={`w-full px-3 py-2 text-left rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                        isSelected
                          ? isOrange
                            ? "bg-orange-500/15 border border-orange-500/40 text-orange-200"
                            : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-200"
                          : isHighlighted
                            ? "bg-zinc-800/90 border border-zinc-700/70 text-zinc-100"
                            : "border border-transparent text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
                      }`}
                    >
                      {/* Left: Icon, Name/PIN & Area sublabel */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                            isSelected
                              ? isOrange
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-emerald-500/20 text-emerald-400"
                              : isHighlighted
                                ? "bg-zinc-700 text-zinc-200"
                                : isPin
                                  ? "bg-sky-950/50 text-sky-400 border border-sky-800/60"
                                  : "bg-zinc-950 text-zinc-400 group-hover:text-zinc-200 border border-zinc-800"
                          }`}
                        >
                          {isPin ? (
                            <Hash className="h-3.5 w-3.5" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold truncate leading-tight ${isPin ? "font-mono font-bold tracking-wider text-zinc-100" : ""}`}
                          >
                            {item.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {item.sublabel}
                          </p>
                        </div>
                      </div>

                      {/* Right: Badge & Selected Check */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPin ? (
                          <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60">
                            PIN
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-400 border border-zinc-700/60">
                            City
                          </span>
                        )}
                        {isSelected && (
                          <Check
                            className={`h-4 w-4 ${
                              isOrange ? "text-orange-400" : "text-emerald-400"
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-5 text-center">
                  <div className="mx-auto w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-2">
                    <Search className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">
                    No registered hub or PIN code for &ldquo;{value}&rdquo;
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                    You can still search by pressing Enter or clicking below:
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelect(value)}
                    className={`mt-2.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isOrange
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    }`}
                  >
                    Use &ldquo;{value}&rdquo; as custom location or PIN
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="px-3.5 py-2 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[9px] text-zinc-300">
                  ↑↓
                </span>{" "}
                navigate
                <span className="ml-1.5 px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[9px] text-zinc-300">
                  ↵
                </span>{" "}
                select
              </span>
              <span>Search by City Name or 6-digit PIN code</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
