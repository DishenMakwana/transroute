"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  Share2,
  ShieldCheck,
  Clock,
  Copy,
  MapPin,
  Building2,
  ExternalLink,
  Package,
  Weight,
  Layers,
  Search,
  Calculator,
  Truck,
  CheckCircle2,
  RefreshCw,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";
import TransportModal from "@/components/TransportModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import CustomDropdown from "@/components/CustomDropdown";
import {
  TransportWithDetails,
  TransportLocation,
  CreateTransportInput,
  FacilityTabFilter,
  FreightEstimatorState,
  DropdownOption,
} from "@/types";

const transportDetailClientCache = new Map<
  string,
  { data: TransportWithDetails; timestamp: number }
>();

export default function TransportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [transport, setTransport] = useState<TransportWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Facility filter & search state
  const [facilityTab, setFacilityTab] = useState<FacilityTabFilter>("all");
  const [facilitySearch, setFacilitySearch] = useState("");

  // Freight Cost Estimator state
  const [estimator, setEstimator] = useState<FreightEstimatorState>({
    unit: "",
    quantity: 10,
  });

  const fetchTransport = useCallback(
    async (isManualRefresh = false) => {
      if (!id) return;

      const now = Date.now();
      const cached = transportDetailClientCache.get(id);
      if (!isManualRefresh && cached && now - cached.timestamp < 60_000) {
        setTransport(cached.data);
        if (cached.data.pricing && cached.data.pricing.length > 0) {
          setEstimator((prev) => ({
            ...prev,
            unit: prev.unit || cached.data.pricing[0].unit,
          }));
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch(`/api/transports/${id}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store" },
        });
        if (!res.ok) {
          if (res.status === 404) {
            setTransport(null);
            transportDetailClientCache.delete(id);
            return;
          }
          throw new Error("Failed to load transport details");
        }
        const data: TransportWithDetails = await res.json();
        transportDetailClientCache.set(id, { data, timestamp: Date.now() });
        setTransport(data);

        // Initialize estimator with first pricing rule if available
        if (data.pricing && data.pricing.length > 0) {
          setEstimator((prev) => ({
            ...prev,
            unit: prev.unit || data.pricing[0].unit,
          }));
        }

        if (isManualRefresh) {
          toast.success("Carrier details reloaded");
        }
      } catch {
        toast.error("Failed to load carrier details");
      } finally {
        setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchTransport();
  }, [fetchTransport]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const getCleanPhone = (phone: string) => phone.replace(/[^\d+]/g, "");

  const getWhatsAppLink = (
    phone: string,
    company: string,
    extraNote?: string
  ) => {
    const clean = getCleanPhone(phone).replace(/^\+/, "");
    const msgText = extraNote
      ? `Hi, I saw ${company} on TransRoute. ${extraNote}`
      : `Hi, I found ${company} on TransRoute and want a quote for box/product parcel dispatch.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(msgText)}`;
  };

  const getGoogleMapsLink = (loc: TransportLocation) => {
    if (loc.lat && loc.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${loc.address}, ${loc.city}, ${loc.state} ${loc.pinCode}`
    )}`;
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      copyToClipboard(window.location.href, "Carrier profile link");
    }
  };

  const handleSaveTransport = async (
    data: CreateTransportInput,
    _isEdit: boolean
  ) => {
    if (!transport) return;
    try {
      const res = await fetch(`/api/transports/${transport.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update carrier");
      }

      toast.success("Carrier updated successfully!");
      setIsEditModalOpen(false);
      transportDetailClientCache.delete(transport.id.toString());
      fetchTransport(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update carrier";
      toast.error(msg);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!transport) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transports/${transport.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete carrier");
      }

      toast.success(`Deleted ${transport.name}`);
      transportDetailClientCache.delete(transport.id.toString());
      setIsDeleteModalOpen(false);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete carrier";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Facilities breakdown
  const offices = useMemo(
    () =>
      transport?.locations.filter(
        (loc) =>
          loc.locationType === "office" || loc.locationType === "pickup_only"
      ) || [],
    [transport]
  );
  const godowns = useMemo(
    () =>
      transport?.locations.filter(
        (loc) => loc.locationType === "dropoff_only"
      ) || [],
    [transport]
  );
  const fullHubs = useMemo(
    () =>
      transport?.locations.filter(
        (loc) => loc.locationType === "pickup_and_dropoff"
      ) || [],
    [transport]
  );

  // Filtered facilities list based on active tab and search query
  const filteredFacilities = useMemo(() => {
    if (!transport?.locations) return [];
    let list = transport.locations;

    if (facilityTab === "office") {
      list = offices;
    } else if (facilityTab === "godown") {
      list = godowns;
    } else if (facilityTab === "pickup_and_dropoff") {
      list = fullHubs;
    }

    if (facilitySearch.trim()) {
      const term = facilitySearch.toLowerCase().trim();
      list = list.filter((loc) => {
        const fullStr =
          `${loc.name} ${loc.city} ${loc.state} ${loc.pinCode} ${loc.address}`.toLowerCase();
        return fullStr.includes(term);
      });
    }

    return list;
  }, [transport, facilityTab, facilitySearch, offices, godowns, fullHubs]);

  // Unique cities & states covered
  const uniqueCities = useMemo(() => {
    if (!transport?.locations) return [];
    return Array.from(
      new Set(transport.locations.map((loc) => loc.city))
    ).sort();
  }, [transport]);

  const uniqueStates = useMemo(() => {
    if (!transport?.locations) return [];
    return Array.from(
      new Set(transport.locations.map((loc) => loc.state))
    ).sort();
  }, [transport]);

  // Rates breakdown
  const weightPricing = useMemo(
    () => transport?.pricing.filter((p) => p.pricingType === "weight") || [],
    [transport]
  );
  const boxPricing = useMemo(
    () => transport?.pricing.filter((p) => p.pricingType === "box_size") || [],
    [transport]
  );

  const minWeightRate = useMemo(() => {
    if (weightPricing.length === 0) return null;
    return Math.min(...weightPricing.map((p) => p.rate));
  }, [weightPricing]);

  const minBoxRate = useMemo(() => {
    if (boxPricing.length === 0) return null;
    return Math.min(...boxPricing.map((p) => p.rate));
  }, [boxPricing]);

  // Estimator selected pricing rule
  const selectedEstimatorPricing = useMemo(() => {
    if (!transport?.pricing || !estimator.unit) return null;
    return (
      transport.pricing.find((p) => p.unit === estimator.unit) ||
      transport.pricing[0]
    );
  }, [transport, estimator.unit]);

  const estimatedTotalCost = useMemo(() => {
    if (!selectedEstimatorPricing) return 0;
    return selectedEstimatorPricing.rate * (Number(estimator.quantity) || 0);
  }, [selectedEstimatorPricing, estimator.quantity]);

  const pricingOptions: DropdownOption<string>[] = useMemo(() => {
    if (!transport?.pricing) return [];
    return transport.pricing.map((p) => ({
      value: p.unit,
      label: p.unit.replace("_", " "),
      sublabel:
        p.notes ||
        (p.pricingType === "weight" ? "Weight cargo" : "Carton cargo"),
      badge: `₹${p.rate}`,
    }));
  }, [transport]);

  // Facility live status calculation helper
  const isFacilityOpenNow = (start: string, end: string) => {
    try {
      const now = new Date();
      const istHours =
        (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) %
        24;
      const istMinutes = (now.getUTCMinutes() + 30) % 60;
      const currentTotal = istHours * 60 + istMinutes;

      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (startTotal <= endTotal) {
        return currentTotal >= startTotal && currentTotal <= endTotal;
      }
      return currentTotal >= startTotal || currentTotal <= endTotal;
    } catch {
      return true;
    }
  };

  const jsonLdTransport = useMemo(() => {
    if (!transport) return null;
    const primaryLoc = transport.locations[0];
    return {
      "@context": "https://schema.org",
      "@type": "LogisticsService",
      name: transport.name,
      description: `Verified domestic LTL parcel freight operator and carton dispatch godowns serving ${transport.locations.map((l) => l.city).join(", ")}.`,
      telephone: transport.phoneNumber,
      identifier: transport.gstNumber || undefined,
      provider: {
        "@type": "LocalBusiness",
        name: transport.name,
        telephone: transport.phoneNumber,
        address: primaryLoc
          ? {
              "@type": "PostalAddress",
              streetAddress: primaryLoc.address,
              addressLocality: primaryLoc.city,
              addressRegion: primaryLoc.state,
              postalCode: primaryLoc.pinCode,
              addressCountry: "IN",
            }
          : undefined,
        geo:
          primaryLoc?.lat && primaryLoc?.lng
            ? {
                "@type": "GeoCoordinates",
                latitude: primaryLoc.lat,
                longitude: primaryLoc.lng,
              }
            : undefined,
      },
      areaServed: Array.from(new Set(transport.locations.map((l) => l.city))),
    };
  }, [transport]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans animate-pulse">
        <div className="h-16 border-b border-zinc-800 bg-zinc-950/80" />
        <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-6 pt-4 sm:pt-8 pb-4 sm:pb-6 space-y-6">
          <div className="h-44 rounded-3xl bg-zinc-900/60 border border-zinc-800/80" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-zinc-900/40 border border-zinc-800/60"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 rounded-2xl bg-zinc-900/30 border border-zinc-800/60" />
            <div className="h-80 rounded-2xl bg-zinc-900/30 border border-zinc-800/60" />
          </div>
        </main>
      </div>
    );
  }

  // Not Found State
  if (!transport) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-2xl shadow-orange-600/20 ring-1 ring-orange-500/30 bg-zinc-900 flex items-center justify-center p-1.5 mb-4">
          <Image
            src="/logo.svg"
            alt="TransRoute Logo"
            width={72}
            height={72}
            priority
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Carrier Record Not Found
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          The requested carrier ID #{id} does not exist in the TransRoute
          domestic directory or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-orange-500/20 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Transport Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {jsonLdTransport && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTransport) }}
        />
      )}
      {/* Sticky Top App Bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/90 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm hover:shadow"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-orange-400" />
              <span className="hidden sm:inline">Back to Directory</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span className="hover:text-zinc-200 transition-colors">
                Directory
              </span>
              <span>/</span>
              <span className="text-zinc-200 font-semibold truncate max-w-[280px]">
                {transport.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareProfile}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              title="Share profile link"
            >
              <Share2 className="h-3.5 w-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Share Profile</span>
            </button>

            <button
              onClick={async () => {
                if (isReloading) return;
                setIsReloading(true);
                await Promise.all([
                  fetchTransport(true),
                  new Promise((r) => setTimeout(r, 600)),
                ]);
                setIsReloading(false);
              }}
              disabled={isReloading}
              className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed ${
                isReloading
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
              }`}
              title="Reload carrier details"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 transition-transform ${isReloading ? "animate-spin text-orange-400" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-3.5 sm:px-6 lg:px-6 pt-4 sm:pt-8 pb-4 sm:pb-6 space-y-4 sm:space-y-8">
        {/* Dribbble Bento Hero Header */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-4 sm:p-8 border border-zinc-800/90 shadow-xl sm:shadow-2xl backdrop-blur-md">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Badges strip */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-zinc-950 text-zinc-200 border border-zinc-800">
                  Carrier #{transport.id}
                </span>

                {transport.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-sky-950/70 text-sky-400 border border-sky-800/70">
                    <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-sky-400 shrink-0" />
                    <span>Verified Domestic Carrier</span>
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border ${
                    transport.isOpenNow
                      ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/70"
                      : "bg-zinc-800/70 text-zinc-400 border-zinc-700/70"
                  }`}
                >
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span>
                    {transport.isOpenNow ? "Hubs Open Now" : "Currently Closed"}
                  </span>
                </span>
              </div>

              {/* Carrier Title */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight break-words">
                {transport.name}
              </h1>

              {/* GSTIN & Primary Phone */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-zinc-400 font-mono pt-0.5 sm:pt-1">
                {transport.gstNumber && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-zinc-800 text-[11px] sm:text-xs">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-500">
                      GSTIN:
                    </span>
                    <span className="font-semibold text-zinc-200">
                      {transport.gstNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(transport.gstNumber!, "GSTIN")
                      }
                      className="p-1 hover:text-orange-400 rounded transition-colors cursor-pointer text-zinc-500"
                      title="Copy GSTIN"
                    >
                      <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-zinc-800 text-[11px] sm:text-xs">
                  <Phone className="h-3 w-3 text-zinc-400" />
                  <span className="font-semibold text-zinc-200">
                    {transport.phoneNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Cluster */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t border-zinc-800/60 lg:border-t-0">
              {/* Primary Contact Actions */}
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                {/* Call */}
                <a
                  href={`tel:${getCleanPhone(transport.phoneNumber)}`}
                  className="inline-flex items-center justify-center gap-2 h-11 sm:h-auto px-3.5 py-2.5 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Call Carrier</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={getWhatsAppLink(transport.phoneNumber, transport.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 sm:h-auto px-3.5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>WhatsApp Quote</span>
                </a>
              </div>

              {/* Administrative Actions */}
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                {/* Edit */}
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 h-10 sm:h-auto px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                  title="Edit Carrier Details"
                >
                  <Pencil className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>Edit</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="h-10 sm:h-auto px-3.5 py-2.5 rounded-xl bg-zinc-900 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-900 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Delete Carrier"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="sm:hidden text-xs font-semibold">
                    Delete
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6-Item KPI Bento Strip */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          <div className="rounded-xl sm:rounded-2xl bg-zinc-900/80 p-3.5 sm:p-5 border border-zinc-800/90 shadow-md sm:shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Total Hubs
              </span>
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-white">
              {transport.locations.length}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-zinc-400">
              Offices & Godowns
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-zinc-900/80 p-3.5 sm:p-5 border border-zinc-800/90 shadow-md sm:shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Cities
              </span>
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-white">
              {uniqueCities.length}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-zinc-400">
              Active Terminals
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-zinc-900/80 p-3.5 sm:p-5 border border-zinc-800/90 shadow-md sm:shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider">
                States
              </span>
              <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-white">
              {uniqueStates.length}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-zinc-400">
              Regional Footprint
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-zinc-900/80 p-3.5 sm:p-5 border border-zinc-800/90 shadow-md sm:shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Min Weight Rate
              </span>
              <Weight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              {minWeightRate !== null ? `₹${minWeightRate}` : "—"}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-zinc-400">
              Starting per kg
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-zinc-900/80 p-3.5 sm:p-5 border border-zinc-800/90 shadow-md sm:shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Min Box Rate
              </span>
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-orange-400">
              {minBoxRate !== null ? `₹${minBoxRate}` : "—"}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-zinc-400">
              Starting per carton
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-zinc-900/80 p-3.5 sm:p-5 border border-zinc-800/90 shadow-md sm:shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Facility Ratio
              </span>
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-white">
              {offices.length}:{godowns.length + fullHubs.length}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-zinc-400">
              Offices vs Depots
            </p>
          </div>
        </section>

        {/* Middle Section: Freight Tariffs Matrix & Interactive Live Estimator */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Full Rate Card (Weight & Carton Box) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="rounded-2xl bg-zinc-900/90 p-4 sm:p-6 border border-zinc-800/90 shadow-xl backdrop-blur-sm space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-400 shrink-0" />
                    <span>Freight Tariff Schedule & Rates</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Official billing units, rate tiers, and consignment handling
                    notes
                  </p>
                </div>
                <span className="text-[11px] sm:text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 shrink-0">
                  {transport.pricing.length} Rules Active
                </span>
              </div>

              {/* Weight Pricing Tiers */}
              {weightPricing.length > 0 && (
                <div className="space-y-2.5 sm:space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Weight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <span>Weight-Based Freight Rates</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {weightPricing.map((prc) => (
                      <div
                        key={prc.id}
                        className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-300 capitalize">
                            Per {prc.unit.replace("_", " ")}
                          </span>
                          <span className="font-mono text-base font-bold text-emerald-400">
                            ₹{prc.rate}
                          </span>
                        </div>
                        {prc.notes ? (
                          <p className="text-[11px] text-zinc-400 leading-snug">
                            {prc.notes}
                          </p>
                        ) : (
                          <p className="text-[11px] text-zinc-500 italic">
                            Standard parcel tariff rate
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Box / Volumetric Pricing Tiers */}
              {boxPricing.length > 0 && (
                <div className="space-y-2.5 sm:space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span>Box Size & Volumetric Freight Rates</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {boxPricing.map((prc) => (
                      <div
                        key={prc.id}
                        className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-300 capitalize">
                            Per {prc.unit.replace("_", " ")}
                          </span>
                          <span className="font-mono text-base font-bold text-orange-400">
                            ₹{prc.rate}
                          </span>
                        </div>
                        {prc.notes ? (
                          <p className="text-[11px] text-zinc-400 leading-snug">
                            {prc.notes}
                          </p>
                        ) : (
                          <p className="text-[11px] text-zinc-500 italic">
                            Standard carton tariff
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Live Freight Cost Estimator */}
          <div className="lg:col-span-1">
            <div className="relative z-20 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 p-4 sm:p-6 border border-orange-500/30 sm:border-zinc-800/90 shadow-xl backdrop-blur-sm space-y-4 sm:space-y-5 sticky top-20 sm:top-24">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                <Calculator className="h-4 w-4 text-orange-400 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                  Instant Freight Estimator
                </h3>
              </div>

              <div className="space-y-3.5 sm:space-y-4 text-xs">
                {/* Select Rate Unit */}
                <div>
                  <CustomDropdown<string>
                    label="Select Billing Basis:"
                    icon={
                      selectedEstimatorPricing?.pricingType === "weight" ? (
                        <Weight className="h-3.5 w-3.5 text-orange-400" />
                      ) : (
                        <Package className="h-3.5 w-3.5 text-sky-400" />
                      )
                    }
                    value={estimator.unit}
                    options={pricingOptions}
                    onChange={(val) =>
                      setEstimator((prev) => ({ ...prev, unit: val }))
                    }
                    placeholder="Select Billing Basis"
                  />
                </div>

                {/* Input Quantity / Weight */}
                <div>
                  <label
                    htmlFor="estimator-quantity-input"
                    className="block text-zinc-400 font-medium mb-1.5"
                  >
                    Quantity / Weight ({estimator.unit.replace("_", " ")}):
                  </label>
                  <input
                    id="estimator-quantity-input"
                    type="number"
                    min="1"
                    step="1"
                    value={estimator.quantity}
                    onChange={(e) =>
                      setEstimator((prev) => ({
                        ...prev,
                        quantity: Math.max(1, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full h-11 sm:h-auto bg-zinc-950 text-xs font-mono font-bold text-white border border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500/60"
                    placeholder="Enter quantity or weight..."
                  />
                </div>

                {/* Cost Summary Box */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Base Tariff Rate</span>
                    <span className="font-mono text-zinc-200">
                      ₹{selectedEstimatorPricing?.rate ?? 0} /{" "}
                      {estimator.unit.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Consignment Volume</span>
                    <span className="font-mono text-zinc-200">
                      {estimator.quantity} {estimator.unit.replace("_", " ")}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="font-bold text-zinc-200">
                      Estimated Freight
                    </span>
                    <span className="text-xl font-bold font-mono text-orange-400">
                      ₹{estimatedTotalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 leading-tight">
                  *Indicative base freight charge. Docket fees, LR charges, and
                  local delivery handling may apply.
                </p>

                {/* Direct Action via WhatsApp with pre-filled estimate */}
                <a
                  href={getWhatsAppLink(
                    transport.phoneNumber,
                    transport.name,
                    `I estimated a freight cost of ₹${estimatedTotalCost} for ${estimator.quantity} ${estimator.unit.replace(
                      "_",
                      " "
                    )} and would like to confirm booking details.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 sm:h-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>Enquire for this Cargo Quote</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Lower Section: Facilities & Godown Network Directory */}
        <section className="space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-orange-400 shrink-0" />
                <span>Network Facilities, Booking Offices & Godowns</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                All physical logistics counters, parcel intake points, and
                unloading godowns for {transport.name}
              </p>
            </div>
            <span className="text-[11px] sm:text-xs font-mono text-zinc-400">
              Showing {filteredFacilities.length} of{" "}
              {transport.locations.length} Facilities
            </span>
          </div>

          {/* Facility Controls Bar */}
          <div className="bg-zinc-900/80 p-2.5 sm:p-3 rounded-2xl border border-zinc-800/90 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 backdrop-blur-sm">
            {/* Filter Tabs - Horizontal Scroll on Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
              <button
                type="button"
                onClick={() => setFacilityTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  facilityTab === "all"
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All Facilities ({transport.locations.length})
              </button>
              <button
                type="button"
                onClick={() => setFacilityTab("office")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  facilityTab === "office"
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Offices ({offices.length})
              </button>
              <button
                type="button"
                onClick={() => setFacilityTab("pickup_and_dropoff")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  facilityTab === "pickup_and_dropoff"
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Full Hubs ({fullHubs.length})
              </button>
              <button
                type="button"
                onClick={() => setFacilityTab("godown")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  facilityTab === "godown"
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Godowns ({godowns.length})
              </button>
            </div>

            {/* Local Search Input */}
            <div className="relative w-full md:w-auto md:min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search facility by city or address..."
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                className="w-full h-10 sm:h-auto pl-9 pr-3 py-2 sm:py-1.5 text-xs bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-xl focus:outline-none focus:border-orange-500/60 placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Facility Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredFacilities.map((loc) => {
              const isOffice = loc.locationType === "office";
              const isOpen = isFacilityOpenNow(
                loc.businessHoursStart,
                loc.businessHoursEnd
              );
              const mapsUrl = getGoogleMapsLink(loc);

              return (
                <div
                  key={loc.id}
                  className="rounded-2xl bg-zinc-900/90 p-4 sm:p-5 border border-zinc-800/90 shadow-xl backdrop-blur-sm flex flex-col justify-between space-y-3 sm:space-y-4 hover:border-zinc-700/80 transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Header: Name & Type Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isOffice
                              ? "bg-sky-950/70 text-sky-400 border border-sky-850"
                              : "bg-emerald-950/70 text-emerald-400 border border-emerald-850"
                          }`}
                        >
                          {isOffice ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-zinc-100 leading-snug break-words">
                            {loc.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 uppercase shrink-0">
                              {loc.locationType.replace(/_/g, " ")}
                            </span>
                            <span className="text-[11px] font-medium text-orange-400">
                              {loc.city}, {loc.state}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Live Open / Closed Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                          isOpen
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                            : "bg-zinc-800/60 text-zinc-400 border-zinc-700/60"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{isOpen ? "Open" : "Closed"}</span>
                      </span>
                    </div>

                    {/* Full Address */}
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/70 text-xs text-zinc-300 flex items-start justify-between gap-2">
                      <p className="leading-relaxed break-words flex-1">
                        {loc.address}, {loc.city}, {loc.state} -{" "}
                        <span className="font-mono font-semibold text-zinc-100">
                          {loc.pinCode}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `${loc.name}, ${loc.address}, ${loc.city}, ${loc.state} ${loc.pinCode}`,
                            "Facility address"
                          )
                        }
                        className="p-1 hover:text-orange-400 text-zinc-500 rounded transition-colors cursor-pointer shrink-0"
                        title="Copy full address"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Business Hours & Contact Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span>
                          Hours: {loc.businessHoursStart} -{" "}
                          {loc.businessHoursEnd}
                        </span>
                      </div>
                      {loc.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <a
                            href={`tel:${getCleanPhone(loc.contactPhone)}`}
                            className="font-mono text-zinc-300 hover:text-orange-400 transition-colors"
                          >
                            {loc.contactPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar - Touch-Friendly on Mobile */}
                  <div className="pt-3 border-t border-zinc-800/80 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      PIN: {loc.pinCode}
                    </span>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full xs:w-auto">
                      {loc.contactPhone && (
                        <a
                          href={getWhatsAppLink(
                            loc.contactPhone,
                            transport.name,
                            `Enquiry for ${loc.name} (${loc.city})`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-auto px-3 py-1.5 text-xs font-semibold rounded-xl sm:rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-1.5 h-9 sm:h-auto px-3 py-1.5 text-xs font-semibold rounded-xl sm:rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer ${
                          !loc.contactPhone ? "col-span-2 sm:col-span-1" : ""
                        }`}
                      >
                        <span>Directions</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Route Connectivity Summary */}
        <section className="rounded-2xl bg-zinc-900/80 p-4 sm:p-6 border border-zinc-800/90 shadow-xl backdrop-blur-sm space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-400 shrink-0" />
              <span>Operational Network Cities ({uniqueCities.length})</span>
            </h3>
            <span className="text-[11px] sm:text-xs font-mono text-zinc-400">
              Direct Delivery & Booking Points
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {uniqueCities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] sm:text-xs font-medium text-zinc-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{city}</span>
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 sm:py-5 text-center text-xs text-zinc-500">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <Link
            href="/"
            className="text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Transport Directory
          </Link>
          <p>
            © {new Date().getFullYear()} TransRoute Carrier Profile. Dedicated
            Road Cargo & Box Shipping.
          </p>
        </div>
      </footer>

      {/* Edit Transport Modal */}
      <TransportModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveTransport}
        editTransport={transport}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        transport={transport}
        isDeleting={isDeleting}
      />
    </div>
  );
}
