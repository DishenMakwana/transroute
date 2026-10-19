"use client";

import { useMemo } from "react";
import { PaginationProps } from "@/types";

export default function Pagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // Generate windowed page numbers with ellipsis for large page sets
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  if (totalCount === 0) return null;

  return (
    <div
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xs px-3.5 sm:px-5 py-3 sm:py-3.5 text-xs text-zinc-400 select-none shadow-sm ${className}`}
    >
      {/* Mobile Layout (< sm): Preserved 100% as requested */}
      <div className="sm:hidden flex flex-col gap-3">
        {/* Row 1: Summary Counter & Page Size Selector */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <span>Showing</span>
            <span className="font-bold text-zinc-100">{startRecord}</span>
            <span>to</span>
            <span className="font-bold text-zinc-100">{endRecord}</span>
            <span>of</span>
            <span className="font-bold text-zinc-100">{totalCount}</span>
            <span>carriers</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 text-[11px] hidden xs:inline">
              Page Size:
            </span>
            <div className="flex items-center gap-1">
              {pageSizeOptions.map((size) => {
                const isActive = size === pageSize;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onPageSizeChange(size)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-950/80 border-emerald-500/70 text-emerald-400 shadow-xs ring-1 ring-emerald-500/20"
                        : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800"
                    }`}
                    title={`Show ${size} carriers per page`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Mobile Page Navigation */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-800/60">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex-1 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 transition-colors cursor-pointer text-center"
          >
            Previous
          </button>

          <span className="text-xs font-mono font-semibold text-zinc-300 px-2">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex-1 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 transition-colors cursor-pointer text-center"
          >
            Next
          </button>
        </div>
      </div>

      {/* Desktop / Full-Screen Layout (sm+): Left Counter, Centered Page Size Selector, Right Navigation */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:items-center gap-4">
        {/* Left: Summary Counter */}
        <div className="flex items-center gap-1 text-xs text-zinc-400 justify-self-start">
          <span>Showing</span>
          <span className="font-bold text-zinc-100">{startRecord}</span>
          <span>to</span>
          <span className="font-bold text-zinc-100">{endRecord}</span>
          <span>of</span>
          <span className="font-bold text-zinc-100">{totalCount}</span>
          <span>carriers</span>
        </div>

        {/* Center: Per-Page Record Selector */}
        <div className="flex items-center justify-center gap-2 justify-self-center">
          <span className="text-zinc-400 text-xs hidden md:inline">
            Page Size:
          </span>
          <div className="flex items-center gap-1">
            {pageSizeOptions.map((size) => {
              const isActive = size === pageSize;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-950/80 border-emerald-500/70 text-emerald-400 shadow-xs ring-1 ring-emerald-500/20"
                      : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800"
                  }`}
                  title={`Show ${size} carriers per page`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Desktop Page Navigation */}
        <div className="flex items-center justify-end gap-1.5 justify-self-end">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 transition-colors cursor-pointer text-center"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="px-1 text-zinc-500 font-mono select-none"
                  >
                    …
                  </span>
                );
              }
              const pageNum = p as number;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? "bg-emerald-950/80 border-emerald-500/70 text-emerald-400 shadow-xs ring-1 ring-emerald-500/20"
                      : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 transition-colors cursor-pointer text-center"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
