"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CustomDropdownProps } from "@/types";

export default function CustomDropdown<T extends string = string>({
  label,
  icon,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  className = "",
  buttonClassName = "",
  isActive = false,
  size = "default",
  align = "left",
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Sync highlighted index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, selectedIndex]);

  // Click outside and global keyboard listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (options.length === 0) return;
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (options.length === 0) return;
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex].value);
        } else {
          setIsOpen(false);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        break;
      }
      case "Tab": {
        setIsOpen(false);
        break;
      }
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative ${isOpen ? "z-50" : "z-0"} ${className}`}
    >
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
          {icon && <span className="text-zinc-400">{icon}</span>}
          <span>{label}</span>
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full ${
          isSmall ? "h-9 px-3 text-xs" : "h-11 px-3.5 text-xs"
        } font-medium rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 text-left cursor-pointer select-none outline-hidden bg-zinc-950 text-zinc-100 ${
          isOpen
            ? "ring-2 ring-orange-500/20 border-orange-500/70 bg-zinc-950"
            : isActive
              ? "border-zinc-700 bg-zinc-900/40 text-zinc-100 hover:border-zinc-700/90"
              : "border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:bg-zinc-900/40"
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!label && icon && (
            <span className="shrink-0 text-zinc-400">{icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption?.badge && (
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "transform rotate-180 text-orange-400" : "text-zinc-500"
            }`}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute top-full mt-1.5 z-[100] ${
              align === "right"
                ? "right-0 min-w-[220px]"
                : "left-0 right-0 min-w-full sm:min-w-[220px]"
            } max-h-64 overflow-y-auto rounded-xl bg-zinc-900/98 border border-zinc-750/90 p-1.5 shadow-2xl shadow-black ring-1 ring-white/10 backdrop-blur-xl`}
          >
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  data-index={idx}
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-orange-500/15 text-orange-300 font-semibold border border-orange-500/30"
                      : isHighlighted
                        ? "bg-zinc-800/90 text-white border border-zinc-700/60"
                        : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="truncate leading-snug">
                      {option.label}
                    </span>
                    {option.sublabel && (
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 mt-0.5">
                        {option.sublabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                        {option.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
