"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  PackageX,
  RotateCcw,
  Truck,
  SlidersHorizontal,
  X,
  IndianRupee,
  Clock,
  Building2,
  Package,
  Scale,
} from "lucide-react";
import { TransportListProps } from "@/types";
import TransportCard, { TransportCardSkeleton } from "./TransportCard";
import Pagination from "./Pagination";
import { FACILITY_OPTIONS } from "./FilterModal";
import {
  formatCurrency,
  getWeightUnitLabel,
  getBoxUnitLabel,
} from "@/helpers/formatters";

export default function TransportList({
  transports,
  totalCount,
  isLoading,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenFilterModal,
  currentPage: controlledPage,
  pageSize: controlledPageSize,
  onPageChange: controlledOnPageChange,
  onPageSizeChange: controlledOnPageSizeChange,
}: TransportListProps) {
  // Compute how many non-default filters are active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters?.weightUnit) count++;
    if (filters?.boxSizeUnit) count++;
    if (filters?.maxPrice !== undefined && filters?.maxPrice > 0) count++;
    if (filters?.locationType && filters?.locationType !== "all") count++;
    if (filters?.openNow) count++;
    if (filters?.sortBy && filters?.sortBy !== "price_asc") count++;
    return count;
  }, [filters]);

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(10);
  const feedTopRef = useRef<HTMLDivElement>(null);

  const currentPage = controlledPage ?? internalPage;
  const pageSize = controlledPageSize ?? internalPageSize;

  // Auto-reset to page 1 whenever filters or query change (for uncontrolled usage)
  useEffect(() => {
    if (!controlledOnPageChange) {
      setInternalPage(1);
    }
  }, [filters, transports.length, controlledOnPageChange]);

  // Paginated slice
  const paginatedTransports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return transports.slice(startIndex, startIndex + pageSize);
  }, [transports, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (controlledOnPageChange) {
      controlledOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (controlledOnPageSizeChange) {
      controlledOnPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        {[1, 2, 3].map((n) => (
          <TransportCardSkeleton key={n} />
        ))}
      </div>
    );
  }

  if (transports.length === 0) {
    return (
      <div className="mt-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 p-8 sm:p-12 text-center shadow-2xl">
        <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-orange-950/50 border border-orange-800/60 flex items-center justify-center text-orange-400">
          <PackageX className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-zinc-100">
          No Transporters Found
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          We could not find any road transport operators matching your origin,
          destination, or active filter constraints.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
          {onOpenFilterModal && (
            <button
              type="button"
              onClick={onOpenFilterModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Adjust Filters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const weightLabel = filters?.weightUnit
    ? getWeightUnitLabel(filters.weightUnit).split(" (")[0]
    : "";
  const boxLabel = filters?.boxSizeUnit
    ? getBoxUnitLabel(filters.boxSizeUnit).split(" (")[0]
    : "";
  const facilityLabel = FACILITY_OPTIONS.find(
    (o) => o.value === filters?.locationType
  )?.label.split(" (")[0];

  return (
    <div ref={feedTopRef} className="relative z-0 mt-4 space-y-3 scroll-mt-24">
      {/* Sleek Results Header: Counts & Active Removable Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-400 font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-orange-400 shrink-0" />
            <span>
              Showing{" "}
              <strong className="text-zinc-100 font-bold">
                {transports.length}
              </strong>
              {totalCount > transports.length && (
                <span className="text-zinc-500 text-[11px]">
                  {" "}
                  of {totalCount}
                </span>
              )}{" "}
              available box transport options
            </span>
          </div>

          {/* Active Filter Pills (Removable directly) */}
          {filters?.weightUnit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 pl-2 pr-1.5 py-0.5 rounded-lg">
              <Scale className="h-3 w-3 shrink-0" />
              <span>{weightLabel || filters.weightUnit}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ weightUnit: undefined })}
                className="hover:bg-orange-500/20 rounded p-0.5 ml-0.5 cursor-pointer text-orange-300 hover:text-white"
                title="Remove weight filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters?.boxSizeUnit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 pl-2 pr-1.5 py-0.5 rounded-lg">
              <Package className="h-3 w-3 shrink-0" />
              <span>{boxLabel || filters.boxSizeUnit}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ boxSizeUnit: undefined })}
                className="hover:bg-orange-500/20 rounded p-0.5 ml-0.5 cursor-pointer text-orange-300 hover:text-white"
                title="Remove box size filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters?.maxPrice !== undefined && filters.maxPrice > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 pl-2 pr-1.5 py-0.5 rounded-lg">
              <IndianRupee className="h-3 w-3 shrink-0" />
              <span>≤ {formatCurrency(filters.maxPrice)}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ maxPrice: undefined })}
                className="hover:bg-orange-500/20 rounded p-0.5 ml-0.5 cursor-pointer text-orange-300 hover:text-white"
                title="Remove price limit"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters?.locationType && filters.locationType !== "all" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 pl-2 pr-1.5 py-0.5 rounded-lg">
              <Building2 className="h-3 w-3 shrink-0" />
              <span>{facilityLabel || filters.locationType}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ locationType: "all" })}
                className="hover:bg-orange-500/20 rounded p-0.5 ml-0.5 cursor-pointer text-orange-300 hover:text-white"
                title="Remove facility filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters?.openNow && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 pl-2 pr-1.5 py-0.5 rounded-lg">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Open Now</span>
              <button
                type="button"
                onClick={() => onFilterChange({ openNow: false })}
                className="hover:bg-emerald-500/20 rounded p-0.5 ml-0.5 cursor-pointer text-emerald-300 hover:text-white"
                title="Remove open now filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Cards Feed */}
      <div className="grid grid-cols-1 gap-3.5">
        {paginatedTransports.map((transport) => (
          <TransportCard key={transport.id} transport={transport} />
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 20, 50]}
        className="mt-5"
      />
    </div>
  );
}
