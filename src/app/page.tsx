"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  Zap,
  BarChart3,
  Building2,
  Map as MapIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FilterModal from "@/components/FilterModal";
import TransportList from "@/components/TransportList";
import TransportModal from "@/components/TransportModal";
import UniversalSearchModal from "@/components/UniversalSearchModal";
import {
  TransportWithDetails,
  SearchFilters,
  SearchResult,
  AnalyticsSummary,
  CreateTransportInput,
  LocationType,
  WeightUnit,
  BoxSizeUnit,
  SortOption,
  VALID_SORT_OPTIONS,
  VALID_LOCATION_TYPES,
  VALID_WEIGHT_UNITS,
  VALID_BOX_SIZES,
  LocationSuggestion,
} from "@/types";

const searchClientCache = new Map<
  string,
  { data: SearchResult; timestamp: number }
>();

function HomePageContent() {
  const searchParams = useSearchParams();

  // Parse initial state from URL query parameters
  const initialParams = useMemo(() => {
    const src = searchParams.get("source") || "";
    const dest = searchParams.get("destination") || "";
    const queryP = searchParams.get("query") || searchParams.get("q") || "";
    const openNow = searchParams.get("openNow") === "true";
    const minP = searchParams.get("minPrice");
    const maxP = searchParams.get("maxPrice");
    const locType = searchParams.get("locationType");
    const wUnit = searchParams.get("weightUnit");
    const bUnit = searchParams.get("boxSizeUnit");
    const sort = searchParams.get("sortBy");

    const parsedFilters: SearchFilters = {
      query: queryP || undefined,
      openNow: openNow || undefined,
      minPrice: minP && !isNaN(Number(minP)) ? Number(minP) : undefined,
      maxPrice: maxP && !isNaN(Number(maxP)) ? Number(maxP) : undefined,
      locationType:
        locType && (VALID_LOCATION_TYPES as readonly string[]).includes(locType)
          ? (locType as LocationType | "all")
          : undefined,
      weightUnit:
        wUnit && (VALID_WEIGHT_UNITS as readonly string[]).includes(wUnit)
          ? (wUnit as WeightUnit)
          : undefined,
      boxSizeUnit:
        bUnit && (VALID_BOX_SIZES as readonly string[]).includes(bUnit)
          ? (bUnit as BoxSizeUnit)
          : undefined,
      sortBy:
        sort && (VALID_SORT_OPTIONS as readonly string[]).includes(sort)
          ? (sort as SortOption)
          : "price_asc",
    };

    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const parsedPage =
      pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0
        ? Number(pageParam)
        : 1;
    const parsedPageSize =
      pageSizeParam && [10, 20, 50].includes(Number(pageSizeParam))
        ? Number(pageSizeParam)
        : 10;

    return {
      source: src,
      destination: dest,
      filters: parsedFilters,
      page: parsedPage,
      pageSize: parsedPageSize,
    };
  }, [searchParams]);

  const [transports, setTransports] = useState<TransportWithDetails[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<
    LocationSuggestion[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter State initialized from URL params
  const [source, setSource] = useState<string>(initialParams.source);
  const [destination, setDestination] = useState<string>(
    initialParams.destination
  );
  const [filters, setFilters] = useState<SearchFilters>(initialParams.filters);
  const [currentPage, setCurrentPage] = useState<number>(initialParams.page);
  const [pageSize, setPageSize] = useState<number>(initialParams.pageSize);

  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Global keyboard shortcut (⌘K / Ctrl+K) to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Synchronize state changes to the browser URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.query?.trim()) params.set("q", filters.query.trim());
    if (source.trim()) params.set("source", source.trim());
    if (destination.trim()) params.set("destination", destination.trim());
    if (filters.openNow) params.set("openNow", "true");
    if (filters.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters.locationType && filters.locationType !== "all") {
      params.set("locationType", filters.locationType);
    }
    if (filters.weightUnit) params.set("weightUnit", filters.weightUnit);
    if (filters.boxSizeUnit) params.set("boxSizeUnit", filters.boxSizeUnit);
    if (filters.sortBy && filters.sortBy !== "price_asc") {
      params.set("sortBy", filters.sortBy);
    }
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }
    if (pageSize !== 10) {
      params.set("pageSize", String(pageSize));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    const currentQuery = window.location.search.replace(/^\?/, "");

    if (currentQuery !== queryString) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [source, destination, filters, currentPage, pageSize]);

  // Synchronize browser history navigation (Back / Forward)
  useEffect(() => {
    const handlePopState = () => {
      const current = new URLSearchParams(window.location.search);
      const src = current.get("source") || "";
      const dest = current.get("destination") || "";
      const queryParam = current.get("q") || current.get("query") || "";
      const openNow = current.get("openNow") === "true";
      const minP = current.get("minPrice");
      const maxP = current.get("maxPrice");
      const locType = current.get("locationType");
      const wUnit = current.get("weightUnit");
      const bUnit = current.get("boxSizeUnit");
      const sort = current.get("sortBy");
      const pageParam = current.get("page");
      const pageSizeParam = current.get("pageSize");

      setSource(src);
      setDestination(dest);
      setFilters({
        query: queryParam || undefined,
        openNow: openNow || undefined,
        minPrice: minP && !isNaN(Number(minP)) ? Number(minP) : undefined,
        maxPrice: maxP && !isNaN(Number(maxP)) ? Number(maxP) : undefined,
        locationType:
          locType &&
          (VALID_LOCATION_TYPES as readonly string[]).includes(locType)
            ? (locType as LocationType | "all")
            : undefined,
        weightUnit:
          wUnit && (VALID_WEIGHT_UNITS as readonly string[]).includes(wUnit)
            ? (wUnit as WeightUnit)
            : undefined,
        boxSizeUnit:
          bUnit && (VALID_BOX_SIZES as readonly string[]).includes(bUnit)
            ? (bUnit as BoxSizeUnit)
            : undefined,
        sortBy:
          sort && (VALID_SORT_OPTIONS as readonly string[]).includes(sort)
            ? (sort as SortOption)
            : "price_asc",
      });
      setCurrentPage(
        pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0
          ? Number(pageParam)
          : 1
      );
      setPageSize(
        pageSizeParam && [10, 20, 50].includes(Number(pageSizeParam))
          ? Number(pageSizeParam)
          : 10
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const fetchTransports = useCallback(async () => {
    const params = new URLSearchParams();

    if (filters.query?.trim()) params.append("query", filters.query.trim());
    if (source.trim()) params.append("source", source.trim());
    if (destination.trim()) params.append("destination", destination.trim());
    if (filters.openNow) params.append("openNow", "true");
    if (filters.minPrice !== undefined)
      params.append("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined)
      params.append("maxPrice", String(filters.maxPrice));
    if (filters.locationType && filters.locationType !== "all") {
      params.append("locationType", filters.locationType);
    }
    if (filters.weightUnit) params.append("weightUnit", filters.weightUnit);
    if (filters.boxSizeUnit) params.append("boxSizeUnit", filters.boxSizeUnit);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const queryString = params.toString();
    const cached = searchClientCache.get(queryString);
    const now = Date.now();
    if (cached && now - cached.timestamp < 30_000) {
      setTransports(cached.data.transports);
      setTotalCount(cached.data.totalCount);
      if (
        cached.data.availableCities &&
        cached.data.availableCities.length > 0
      ) {
        setAvailableCities(cached.data.availableCities);
      }
      if (
        cached.data.availableLocations &&
        cached.data.availableLocations.length > 0
      ) {
        setAvailableLocations(cached.data.availableLocations);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/transports?${queryString}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        toast.error("Failed to load transports");
        return;
      }

      const data = (await res.json()) as SearchResult;
      searchClientCache.set(queryString, { data, timestamp: Date.now() });
      setTransports(data.transports);
      setTotalCount(data.totalCount);
      if (data.availableCities && data.availableCities.length > 0) {
        setAvailableCities(data.availableCities);
      }
      if (data.availableLocations && data.availableLocations.length > 0) {
        setAvailableLocations(data.availableLocations);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch transports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [source, destination, filters]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as AnalyticsSummary;
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  }, []);

  // Fetch analytics once on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Fetch transports when search/filters change
  useEffect(() => {
    fetchTransports();
  }, [fetchTransports]);

  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSource("");
    setDestination("");
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSource("");
    setDestination("");
    setFilters({ sortBy: "price_asc" });
    setCurrentPage(1);
  };

  const handleFilterChange = (partial: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query?.trim()) count++;
    if (filters.weightUnit) count++;
    if (filters.boxSizeUnit) count++;
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) count++;
    if (filters.locationType && filters.locationType !== "all") count++;
    if (filters.openNow) count++;
    if (filters.sortBy && filters.sortBy !== "price_asc") count++;
    return count;
  }, [filters]);

  const handleOpenAdd = () => {
    setIsModalOpen(true);
  };

  const handleSaveTransport = async (
    data: CreateTransportInput,
    isEdit: boolean
  ) => {
    const url = isEdit ? `/api/transports/${data.id}` : "/api/transports";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Save failed");
    }

    searchClientCache.clear();
    await Promise.all([fetchTransports(), fetchAnalytics()]);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      toast.loading("Generating Excel Rate Sheet...", { id: "excel-export" });
      const res = await fetch("/api/export");
      if (!res.ok) {
        toast.error("Failed to export Excel file", { id: "excel-export" });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Indian_Transport_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Excel directory downloaded!", { id: "excel-export" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel file", { id: "excel-export" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top Navigation & App Bar */}
      <Header
        analytics={analytics}
        onOpenAddModal={handleOpenAdd}
        onExportExcel={handleExportExcel}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        isExporting={isExporting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-6 py-6">
        {/* Search Hero with Route & Destination inputs */}
        <SearchBar
          source={source}
          destination={destination}
          onSourceChange={(val) => {
            setSource(val);
            setCurrentPage(1);
          }}
          onDestinationChange={(val) => {
            setDestination(val);
            setCurrentPage(1);
          }}
          onSwap={handleSwap}
          onClear={handleClear}
          availableCities={availableCities}
          availableLocations={availableLocations}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Results Feed with integrated compact filter & sort toolbar */}
        <TransportList
          transports={transports}
          totalCount={totalCount}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Market Intelligence Route Discovery Card */}
        <section className="mt-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 border border-zinc-800/80 shadow-2xl relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 border border-orange-500/20">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Market Intelligence Hub</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Indian Road Freight Tariffs & Logistics Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Looking for macro trends? Explore our dedicated analytics
                dashboard covering carrier tariff spreads, multi-state godown
                network distribution, facility composition ratios, and national
                corridor rate benchmarks.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Interstate Corridors</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                  <BarChart3 className="h-3 w-3 text-sky-400" />
                  <span>Per Kg vs Box Spread</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                  <Building2 className="h-3 w-3 text-emerald-400" />
                  <span>Facility Breakdown</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                  <MapIcon className="h-3 w-3 text-purple-400" />
                  <span>State Network Depth</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/analytics"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>View Full Freight Analytics</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-900 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} TransRoute. Specialized in Domestic Box
            & Product Cargo Transport in India.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
            <Link
              href="/analytics"
              className="hover:text-orange-400 transition-colors"
            >
              Freight Analytics & Intelligence
            </Link>
            <span>•</span>
            <span>Strictly Road Freight & LTL Box Dispatch</span>
          </div>
        </div>
      </footer>

      {/* Add Transport Modal */}
      <TransportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTransport}
        editTransport={null}
      />

      {/* Filter Modal Popup */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalCount={totalCount}
      />

      {/* Universal Search Modal (Spotlight ⌘K) */}
      <UniversalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        transports={transports}
        onFilterDirectory={(keyword) => {
          setFilters((prev) => ({ ...prev, query: keyword }));
          setCurrentPage(1);
        }}
      />
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 animate-pulse">
      <div className="h-16 border-b border-zinc-800 bg-zinc-950" />
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-6 py-6 space-y-6">
        <div className="h-32 rounded-2xl bg-zinc-900/60 border border-zinc-800/80" />
        <div className="h-28 rounded-2xl bg-zinc-900/40 border border-zinc-800/80" />
        <div className="h-96 rounded-2xl bg-zinc-900/30 border border-zinc-800/60" />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
