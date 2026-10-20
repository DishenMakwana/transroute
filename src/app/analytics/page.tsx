"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  MapPin,
  Truck,
  Building2,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  Package,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomDropdown from "@/components/CustomDropdown";
import {
  AnalyticsSummary,
  AnalyticsFilterState,
  AnalyticsKpiCardProps,
  CustomTooltipProps,
  DropdownOption,
} from "@/types";

// Recharts theme colors tailored for high-contrast dark theme
const PIE_COLORS = [
  "#f97316",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#eab308",
];

function CustomAnalyticsTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/95 backdrop-blur-xl text-white p-3 rounded-xl border border-zinc-800 shadow-[0_12px_32px_rgba(0,0,0,0.85)] text-xs space-y-2 min-w-[175px]">
        {label && (
          <div className="font-bold text-zinc-200 border-b border-zinc-800/90 pb-1.5 text-xs tracking-tight">
            {label}
          </div>
        )}
        {payload.map((entry, index) => (
          <div
            key={`entry-${index}`}
            className="flex items-center justify-between gap-3 text-[11px]"
          >
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span
                className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {entry.name.toLowerCase().includes("rate") ||
              entry.name.toLowerCase().includes("₹")
                ? `₹${entry.value}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function KpiCard({
  title,
  value,
  subtext,
  icon,
  badge,
  accentColor = "orange",
  className = "",
}: AnalyticsKpiCardProps) {
  const accentClasses = {
    orange:
      "border-orange-500/30 bg-orange-500/10 text-orange-400 group-hover:border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.08)]",
    emerald:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.08)]",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400 group-hover:border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.08)]",
    purple:
      "border-purple-500/30 bg-purple-500/10 text-purple-400 group-hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.08)]",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 group-hover:border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.08)]",
    amber:
      "border-amber-500/30 bg-amber-500/10 text-amber-400 group-hover:border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.08)]",
  };

  const glowGradients = {
    orange: "from-orange-500/5 via-transparent to-transparent",
    emerald: "from-emerald-500/5 via-transparent to-transparent",
    blue: "from-blue-500/5 via-transparent to-transparent",
    purple: "from-purple-500/5 via-transparent to-transparent",
    cyan: "from-cyan-500/5 via-transparent to-transparent",
    amber: "from-amber-500/5 via-transparent to-transparent",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b ${glowGradients[accentColor]} bg-zinc-900/85 p-3.5 sm:p-4 lg:p-5 border border-zinc-800/90 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:border-zinc-700/80 backdrop-blur-sm flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${accentClasses[accentColor]}`}
          >
            {icon}
          </div>
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-zinc-300 border border-zinc-700/60 truncate">
              {badge}
            </span>
          )}
        </div>

        <div className="mt-3 sm:mt-4">
          <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-white font-mono leading-snug break-words">
            {value}
          </div>
        </div>
      </div>

      <p className="mt-2 text-[10px] sm:text-[11px] text-zinc-400 truncate">
        {subtext}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterState, setFilterState] = useState<AnalyticsFilterState>({
    selectedState: "all",
    selectedUnit: "all",
    selectedFacilityType: "all",
  });

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/analytics", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to load analytics");
      }
      const data: AnalyticsSummary = await res.json();
      setAnalytics(data);
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    const refreshOperation = (async () => {
      const [res] = await Promise.all([
        fetch("/api/analytics", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store" },
        }),
        // Ensure at least 650ms smooth spin animation & user feedback
        new Promise((resolve) => setTimeout(resolve, 650)),
      ]);

      if (!res.ok) throw new Error("Failed to load analytics");
      const data: AnalyticsSummary = await res.json();
      setAnalytics(data);
      return data;
    })();

    toast.promise(
      refreshOperation,
      {
        loading: "Recalculating logistics metrics from database...",
        success: "Analytics metrics refreshed from database!",
        error: "Failed to refresh analytics data",
      },
      {
        style: {
          background: "#18181b",
          color: "#f4f4f5",
          border: "1px solid #27272a",
        },
      }
    );

    try {
      await refreshOperation;
    } catch {
      // toast.promise displays error message automatically
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Available unique states for filtering
  const availableStates = useMemo(() => {
    if (!analytics?.stateCoverage) return [];
    return analytics.stateCoverage.map((s) => s.state);
  }, [analytics]);

  const stateOptions: DropdownOption<string>[] = useMemo(
    () => [
      { value: "all", label: `All States (${availableStates.length})` },
      ...availableStates.map((st) => ({
        value: st,
        label: st,
        badge: "State",
      })),
    ],
    [availableStates]
  );

  const unitOptions: DropdownOption<string>[] = useMemo(
    () => [
      { value: "all", label: "All Tariff Units", sublabel: "Weight & cartons" },
      {
        value: "kg",
        label: "Per Kg (₹/kg)",
        sublabel: "Standard road freight",
        badge: "Standard",
      },
      {
        value: "quintal",
        label: "Per Quintal (₹/100kg)",
        sublabel: "Commercial consignments",
      },
      {
        value: "small_box",
        label: "Small Box (₹/box)",
        sublabel: "Under 8kg cartons",
      },
      {
        value: "medium_box",
        label: "Medium Box (₹/box)",
        sublabel: "Standard trade cartons",
        badge: "Popular",
      },
      {
        value: "large_box",
        label: "Large Box (₹/box)",
        sublabel: "Bulk export cartons",
      },
    ],
    []
  );

  const facilityOptions: DropdownOption<string>[] = useMemo(
    () => [
      {
        value: "all",
        label: "All Facility Types",
        sublabel: "All hub facilities",
      },
      {
        value: "office",
        label: "Booking Office",
        sublabel: "Admin & booking counters",
      },
      {
        value: "pickup_and_dropoff",
        label: "Full Transit Hub",
        sublabel: "Pickup and dropoff",
      },
      {
        value: "pickup_only",
        label: "Dispatch Godown",
        sublabel: "Parcel dispatch terminals",
      },
      {
        value: "dropoff_only",
        label: "Inward Terminal",
        sublabel: "Delivery & inward depots",
      },
    ],
    []
  );

  // Filtered cities based on selected state
  const filteredCityData = useMemo(() => {
    if (!analytics?.topCities) return [];
    if (filterState.selectedState === "all") {
      return analytics.topCities.slice(0, 10).map((c) => ({
        city: c.city,
        "Logistics Hubs": c.hubCount,
        "Transporter Operators": c.transporterCount,
      }));
    }
    return analytics.topCities
      .filter(
        (c) => c.state.toLowerCase() === filterState.selectedState.toLowerCase()
      )
      .map((c) => ({
        city: c.city,
        "Logistics Hubs": c.hubCount,
        "Transporter Operators": c.transporterCount,
      }));
  }, [analytics, filterState.selectedState]);

  // Rate comparisons filtered by carrier / unit
  const carrierComparisonData = useMemo(() => {
    if (!analytics?.corridorComparisons) return [];
    return analytics.corridorComparisons.map((c) => ({
      name: c.name,
      "Per Kg Rate (₹)": c.perKgRate,
      "Medium Box Rate (₹)": c.mediumBoxRate,
    }));
  }, [analytics]);

  // Facility composition pie chart data
  const facilityChartData = useMemo(() => {
    if (!analytics?.facilityBreakdown) return [];
    if (filterState.selectedFacilityType === "all") {
      return analytics.facilityBreakdown.map((f) => ({
        name: f.label,
        value: f.count,
        percentage: f.percentage,
      }));
    }
    return analytics.facilityBreakdown
      .filter((f) => f.type === filterState.selectedFacilityType)
      .map((f) => ({
        name: f.label,
        value: f.count,
        percentage: f.percentage,
      }));
  }, [analytics, filterState.selectedFacilityType]);

  // Rate distributions table filtered by unit
  const filteredRateDistributions = useMemo(() => {
    if (!analytics?.rateDistributions) return [];
    if (filterState.selectedUnit === "all") return analytics.rateDistributions;
    return analytics.rateDistributions.filter(
      (d) => d.unit === filterState.selectedUnit
    );
  }, [analytics, filterState.selectedUnit]);

  // State-level volume data
  const stateVolumeData = useMemo(() => {
    if (!analytics?.stateCoverage) return [];
    return analytics.stateCoverage.slice(0, 8).map((s) => ({
      state: s.state,
      "Hub Count": s.hubCount,
      "Cities Covered": s.cityCount,
      Operators: s.transporterCount,
    }));
  }, [analytics]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/90 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-[1640px] mx-auto px-3.5 sm:px-6 lg:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm hover:shadow shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-orange-400" />
              <span className="hidden sm:inline">
                Back to Transport Directory
              </span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden md:block" />

            <div className="hidden md:flex items-center gap-2 min-w-0">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 truncate">
                Live Freight Intelligence & Market Benchmarks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {analytics && (
              <div className="hidden lg:flex items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 text-zinc-300 shadow-inner">
                  <Truck className="h-3.5 w-3.5 text-orange-400" />
                  <span className="font-bold text-zinc-100">
                    {analytics.totalTransporters}
                  </span>
                  <span className="text-zinc-400">Transporters</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 text-zinc-300 shadow-inner">
                  <Building2 className="h-3.5 w-3.5 text-sky-400" />
                  <span className="font-bold text-zinc-100">
                    {analytics.totalHubs}
                  </span>
                  <span className="text-zinc-400">Offices & Hubs</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 text-zinc-300 shadow-inner">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-bold text-zinc-100">
                    {analytics.citiesCount}
                  </span>
                  <span className="text-zinc-400">Key Cities</span>
                </div>
              </div>
            )}

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed ${
                isRefreshing
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                  : "bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700"
              }`}
              title="Clear cache and reload analytics metrics"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 transition-transform ${
                  isRefreshing
                    ? "animate-spin text-orange-400"
                    : "text-zinc-400"
                }`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </span>
            </button>
            <div className="hidden xs:inline-flex rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-orange-400 border border-orange-500/20 whitespace-nowrap">
              India Cargo
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-3.5 sm:px-6 lg:px-6 pt-4 sm:pt-8 pb-4 sm:pb-6 space-y-6 sm:space-y-8">
        {/* Page Title & Mission Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-4 sm:p-6 lg:p-8 border border-zinc-800/90 shadow-2xl">
          <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-orange-500/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-orange-400 border border-orange-500/20">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Comprehensive Transport Analytics Dashboard
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight">
              Indian Domestic Freight & Logistics Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
              Deep dive into multi-state tariff distributions, transit godown
              network coverage, operator density, and carton shipping cost
              benchmarks across major national manufacturing corridors.
            </p>
          </div>
        </div>

        {/* Executive KPI Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <KpiCard
            title="Total Carriers"
            value={analytics ? analytics.totalTransporters : "—"}
            subtext="Road freight operators"
            icon={<Truck className="h-4 w-4 sm:h-5 sm:w-5" />}
            badge="100% Verified"
            accentColor="orange"
          />
          <KpiCard
            title="Logistics Hubs"
            value={analytics ? analytics.totalHubs : "—"}
            subtext="Godowns, offices & docks"
            icon={<Building2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            badge="Pan-India"
            accentColor="emerald"
          />
          <KpiCard
            title="Cities Covered"
            value={analytics ? analytics.citiesCount : "—"}
            subtext="Active freight nodes"
            icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
            badge="Commercial hubs"
            accentColor="blue"
          />
          <KpiCard
            title="States & UTs"
            value={analytics ? analytics.statesCount : "—"}
            subtext="Regional connectivity"
            icon={<Compass className="h-4 w-4 sm:h-5 sm:w-5" />}
            badge="Coverage"
            accentColor="purple"
          />
          <KpiCard
            title="Median Tariff"
            value={
              analytics?.rateDistributions?.find((r) => r.unit === "kg")
                ?.avgRate
                ? `₹${analytics.rateDistributions.find((r) => r.unit === "kg")!.avgRate.toFixed(2)}`
                : "—"
            }
            subtext="Per kg average freight"
            icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
            badge="Standard LTL"
            accentColor="amber"
          />
          <KpiCard
            title="Top Corridor"
            value={
              analytics?.corridorBenchmarks?.[0] ? (
                <span className="block leading-snug">
                  <span>{analytics.corridorBenchmarks[0].origin}</span>
                  <span className="text-cyan-400 mx-1">⇄</span>
                  <span className="block text-base sm:text-lg lg:text-base xl:text-lg font-semibold text-zinc-200">
                    {analytics.corridorBenchmarks[0].destination}
                  </span>
                </span>
              ) : (
                "—"
              )
            }
            subtext={
              analytics?.corridorBenchmarks?.[0]
                ? `${analytics.corridorBenchmarks[0].origin} to ${analytics.corridorBenchmarks[0].destination}`
                : "Dynamic lane benchmark"
            }
            icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5" />}
            badge="Top Density"
            accentColor="cyan"
          />
        </div>

        {/* Interactive Filter Control Bar */}
        <div className="relative z-30 bg-zinc-900/80 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/90 shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-orange-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Analysis Dimensions & Scopes:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto items-center">
            {/* State Filter */}
            <div className="w-full sm:w-44 lg:w-52">
              <CustomDropdown<string>
                size="sm"
                icon={<Compass className="h-3.5 w-3.5 text-cyan-400" />}
                value={filterState.selectedState}
                options={stateOptions}
                onChange={(val) =>
                  setFilterState((prev) => ({ ...prev, selectedState: val }))
                }
                placeholder="All States"
                isActive={filterState.selectedState !== "all"}
              />
            </div>

            {/* Pricing Unit Filter */}
            <div className="w-full sm:w-44 lg:w-52">
              <CustomDropdown<string>
                size="sm"
                icon={<Package className="h-3.5 w-3.5 text-amber-400" />}
                value={filterState.selectedUnit}
                options={unitOptions}
                onChange={(val) =>
                  setFilterState((prev) => ({ ...prev, selectedUnit: val }))
                }
                placeholder="All Units"
                isActive={filterState.selectedUnit !== "all"}
              />
            </div>

            {/* Facility Type Filter */}
            <div className="w-full sm:w-44 lg:w-52">
              <CustomDropdown<string>
                size="sm"
                icon={<Building2 className="h-3.5 w-3.5 text-blue-400" />}
                value={filterState.selectedFacilityType}
                options={facilityOptions}
                onChange={(val) =>
                  setFilterState((prev) => ({
                    ...prev,
                    selectedFacilityType: val,
                  }))
                }
                placeholder="All Facility Types"
                isActive={filterState.selectedFacilityType !== "all"}
              />
            </div>

            {(filterState.selectedState !== "all" ||
              filterState.selectedUnit !== "all" ||
              filterState.selectedFacilityType !== "all") && (
              <button
                onClick={() =>
                  setFilterState({
                    selectedState: "all",
                    selectedUnit: "all",
                    selectedFacilityType: "all",
                  })
                }
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold px-2 py-1 col-span-full sm:col-auto text-left"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Main Charts Grid - Row 1: Freight Tariffs by Carrier & Hub Density by City */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Chart 1: Carrier Freight Tariff Comparison */}
          <div className="bg-zinc-900/90 p-4 sm:p-6 rounded-2xl border border-zinc-800/90 shadow-2xl flex flex-col backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-zinc-200 tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-400 shrink-0" />
                  Freight Tariff Comparison by Carrier
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
                  Comparative pricing per kg vs per standard medium box carton
                  (INR)
                </p>
              </div>
              <span className="self-start sm:self-center text-[10px] sm:text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 sm:py-1 rounded-lg border border-zinc-800">
                LTL Benchmarks
              </span>
            </div>

            <div className="h-72 sm:h-80 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={carrierComparisonData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#27272a"
                  />
                  <XAxis
                    dataKey="name"
                    height={55}
                    tick={{ fontSize: 9, fill: "#a1a1aa" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tickFormatter={(val: string) =>
                      val.length > 16 ? `${val.slice(0, 15)}…` : val
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#a1a1aa" }}
                    unit="₹"
                    stroke="#52525b"
                  />
                  <Tooltip
                    content={<CustomAnalyticsTooltip />}
                    cursor={{
                      fill: "rgba(39, 39, 42, 0.5)",
                      stroke: "rgba(63, 63, 70, 0.4)",
                      strokeWidth: 1,
                      rx: 8,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{
                      paddingBottom: "12px",
                      fontSize: "11px",
                      color: "#d4d4d8",
                    }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Per Kg Rate (₹)"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    activeBar={{
                      fill: "#fb923c",
                      stroke: "#fed7aa",
                      strokeWidth: 1,
                    }}
                  />
                  <Bar
                    dataKey="Medium Box Rate (₹)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    activeBar={{
                      fill: "#34d399",
                      stroke: "#a7f3d0",
                      strokeWidth: 1,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Hub and Operator Density by City */}
          <div className="bg-zinc-900/90 p-4 sm:p-6 rounded-2xl border border-zinc-800/90 shadow-2xl flex flex-col backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-zinc-200 tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                  Logistics Hub & Operator Density by City
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
                  Active transport terminals & operator presence in major
                  freight nodes
                </p>
              </div>
              <span className="self-start sm:self-center text-[10px] sm:text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 sm:py-1 rounded-lg border border-zinc-800">
                {filterState.selectedState === "all"
                  ? "Top 10 Cities"
                  : filterState.selectedState}
              </span>
            </div>

            <div className="h-72 sm:h-80 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredCityData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#27272a"
                  />
                  <XAxis
                    dataKey="city"
                    height={50}
                    tick={{ fontSize: 9, fill: "#a1a1aa" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tickFormatter={(val: string) =>
                      val.length > 14 ? `${val.slice(0, 13)}…` : val
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#a1a1aa" }}
                    stroke="#52525b"
                  />
                  <Tooltip
                    content={<CustomAnalyticsTooltip />}
                    cursor={{
                      fill: "rgba(39, 39, 42, 0.5)",
                      stroke: "rgba(63, 63, 70, 0.4)",
                      strokeWidth: 1,
                      rx: 8,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{
                      paddingBottom: "12px",
                      fontSize: "11px",
                      color: "#d4d4d8",
                    }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Logistics Hubs"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    activeBar={{
                      fill: "#60a5fa",
                      stroke: "#bfdbfe",
                      strokeWidth: 1,
                    }}
                  />
                  <Bar
                    dataKey="Transporter Operators"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    activeBar={{
                      fill: "#c084fc",
                      stroke: "#e9d5ff",
                      strokeWidth: 1,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Main Charts Grid - Row 2: Facility Composition (Donut) & State-Level Network Depth */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Donut Chart: Facility Infrastructure Ratio */}
          <div className="bg-zinc-900/90 p-4 sm:p-6 rounded-2xl border border-zinc-800/90 shadow-2xl flex flex-col backdrop-blur-sm lg:col-span-1 overflow-hidden">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-bold uppercase text-zinc-200 tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400 shrink-0" />
                Facility Composition
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
                Ratio of booking offices vs dispatch godowns
              </p>
            </div>

            <div className="h-56 sm:h-64 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Pie
                    data={facilityChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {facilityChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {analytics?.totalHubs ?? 0}
                </span>
                <span className="block text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">
                  Total Hubs
                </span>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 space-y-2 pt-3 border-t border-zinc-800/80">
              {analytics?.facilityBreakdown.map((item, idx) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-zinc-300 truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono shrink-0">
                    <span className="font-bold text-white">{item.count}</span>
                    <span className="text-zinc-400 text-[10px]">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Area Chart: State-Level Logistics Depth */}
          <div className="bg-zinc-900/90 p-4 sm:p-6 rounded-2xl border border-zinc-800/90 shadow-2xl flex flex-col backdrop-blur-sm lg:col-span-2 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-zinc-200 tracking-wider flex items-center gap-2">
                  <Compass className="h-4 w-4 text-cyan-400 shrink-0" />
                  State Logistics Network Distribution
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
                  Distribution of hubs, coverage cities, and operators by key
                  states
                </p>
              </div>
              <span className="self-start sm:self-center text-[10px] sm:text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 sm:py-1 rounded-lg border border-zinc-800">
                Regional Depth
              </span>
            </div>

            <div className="h-72 sm:h-80 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stateVolumeData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="hubGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="cityGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#27272a"
                  />
                  <XAxis
                    dataKey="state"
                    height={45}
                    tick={{ fontSize: 9, fill: "#a1a1aa" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    tickFormatter={(val: string) =>
                      val.length > 14 ? `${val.slice(0, 13)}…` : val
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#a1a1aa" }}
                    stroke="#52525b"
                  />
                  <Tooltip
                    content={<CustomAnalyticsTooltip />}
                    cursor={{
                      stroke: "#52525b",
                      strokeWidth: 1.5,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{
                      paddingBottom: "12px",
                      fontSize: "11px",
                      color: "#d4d4d8",
                    }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="Hub Count"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#hubGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Cities Covered"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#cityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 3: Interstate Freight Corridor Benchmarks */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-400 shrink-0" />
                Key Interstate Freight Corridors
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Benchmark road freight tariff rates for critical manufacturing
                and consumer trade lanes
              </p>
            </div>
            <span className="text-[11px] sm:text-xs font-mono text-zinc-400 self-start sm:self-center">
              {analytics?.corridorBenchmarks.length ?? 0} Active Corridors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {analytics?.corridorBenchmarks.map((corridor) => (
              <div
                key={corridor.corridor}
                className="group relative rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90 p-4 sm:p-5 border border-zinc-800/90 hover:border-orange-500/40 transition-all duration-300 shadow-xl hover:shadow-orange-500/5 backdrop-blur-sm hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-orange-400 border border-orange-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                        Lane Benchmark
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-300 transition-colors tracking-tight truncate">
                        {corridor.corridor}
                      </h4>
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-800/60 text-zinc-400 group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0">
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>

                  {/* 3-Value Stats Grid: Left-most, Center, Right-most */}
                  <div className="mt-3.5 grid grid-cols-3 items-center py-2.5 sm:py-3 px-3 sm:px-4 bg-zinc-950/75 rounded-xl border border-zinc-800/80 shadow-inner">
                    <div className="text-left flex flex-col items-start">
                      <span className="block text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                        Carriers
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-zinc-200 mt-0.5">
                        {corridor.carriersCount} Active
                      </span>
                    </div>
                    <div className="text-center flex flex-col items-center">
                      <span className="block text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                        Min / Kg
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                        ₹{corridor.minPerKg}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="block text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                        Min Box
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-orange-400 mt-0.5">
                        ₹{corridor.minBoxRate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 truncate font-medium text-zinc-300">
                    <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
                    <span className="truncate">
                      {corridor.origin} → {corridor.destination}
                    </span>
                  </span>
                  <span className="font-mono text-zinc-300 font-semibold shrink-0 ml-2">
                    Avg ₹{corridor.avgPerKg}/kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Freight Tariff Spread across Packaging & Weight Units */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800/90 p-4 sm:p-6 shadow-2xl backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-400 shrink-0" />
                Tariff Spread & Unit Dispersion
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Standardized market rates across billing units (Weight metrics
                and standard carton sizes)
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-400 self-start sm:self-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Verified Indian Carrier Quotes</span>
            </div>
          </div>

          {/* Mobile View: High-contrast Bento cards for each billing unit */}
          <div className="block sm:hidden space-y-3">
            {filteredRateDistributions.map((rate) => {
              const spread = rate.maxRate - rate.minRate;
              const spreadPct = Math.min(
                100,
                Math.max(15, (spread / (rate.maxRate || 1)) * 100)
              );
              return (
                <div
                  key={rate.unit}
                  className="rounded-xl bg-zinc-950/70 p-3.5 border border-zinc-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-100 capitalize">
                      {rate.unit.replace("_", " ")}
                    </span>
                    <span className="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] font-semibold text-zinc-300 border border-zinc-700/60">
                      {rate.count} quotes
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60 text-center">
                    <div>
                      <span className="block text-[9px] uppercase font-semibold text-zinc-400">
                        Min
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        ₹{rate.minRate}
                      </span>
                    </div>
                    <div className="border-x border-zinc-800/80">
                      <span className="block text-[9px] uppercase font-semibold text-zinc-400">
                        Avg
                      </span>
                      <span className="font-mono text-xs font-bold text-orange-400">
                        ₹{rate.avgRate}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-semibold text-zinc-400">
                        Max
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-200">
                        ₹{rate.maxRate}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Market Spread</span>
                      <span className="font-mono font-medium text-zinc-300">
                        ±₹{spread.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-orange-500 h-1.5 rounded-full"
                        style={{ width: `${spreadPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Billing Unit</th>
                  <th className="py-3 px-4">Sample Quotes</th>
                  <th className="py-3 px-4 font-mono">Min Rate</th>
                  <th className="py-3 px-4 font-mono">Average Rate</th>
                  <th className="py-3 px-4 font-mono">Max Rate</th>
                  <th className="py-3 px-4">Market Spread</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filteredRateDistributions.map((rate) => {
                  const spread = rate.maxRate - rate.minRate;
                  return (
                    <tr
                      key={rate.unit}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-zinc-200 capitalize">
                        {rate.unit.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        <span className="font-mono bg-zinc-800/70 px-2 py-0.5 rounded text-[11px] text-zinc-300">
                          {rate.count} carriers
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                        ₹{rate.minRate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-orange-400 font-bold">
                        ₹{rate.avgRate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        ₹{rate.maxRate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(15, (spread / (rate.maxRate || 1)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-400">
                            ±₹{spread.toFixed(0)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 sm:py-5 text-center text-xs text-zinc-400">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Transport Directory Feed
            </Link>
          </div>
          <p>
            © {new Date().getFullYear()} TransRoute Analytics Engine. Strictly
            Box Cargo & Road Freight Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
