"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  Clock,
  ShieldCheck,
  Copy,
  ExternalLink,
  Package,
  Weight,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  TransportLocation,
  TransportCardProps,
  TransportCardLocationTab,
} from "@/types";
import { formatCurrency, formatPinCode } from "@/helpers/formatters";

export default function TransportCard({ transport }: TransportCardProps) {
  const router = useRouter();
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [activeTab, setActiveTab] = useState<TransportCardLocationTab>("all");

  const isLocationDestinationMatch = (loc: TransportLocation) => {
    if (
      transport.matchedDestination &&
      loc.id === transport.matchedDestination.id
    ) {
      return true;
    }
    if (transport.matchedDestination) {
      const destCity = transport.matchedDestination.city.trim().toLowerCase();
      const destPin = transport.matchedDestination.pinCode?.trim();
      if (destCity && loc.city.trim().toLowerCase() === destCity) return true;
      if (destPin && loc.pinCode.trim() === destPin) return true;
    }
    return false;
  };

  const isLocationOriginMatch = (loc: TransportLocation) => {
    if (transport.matchedOrigin && loc.id === transport.matchedOrigin.id) {
      return true;
    }
    if (transport.matchedOrigin) {
      const origCity = transport.matchedOrigin.city.trim().toLowerCase();
      const origPin = transport.matchedOrigin.pinCode?.trim();
      if (origCity && loc.city.trim().toLowerCase() === origCity) return true;
      if (origPin && loc.pinCode.trim() === origPin) return true;
    }
    return false;
  };

  const sortLocationsWithMatchesFirst = (list: TransportLocation[]) => {
    return [...list].sort((a, b) => {
      // 1. Origin match first (Natural transit order: From -> To)
      const aOrig = isLocationOriginMatch(a) ? 1 : 0;
      const bOrig = isLocationOriginMatch(b) ? 1 : 0;
      if (aOrig !== bOrig) return bOrig - aOrig;

      // 2. Destination match second
      const aDest = isLocationDestinationMatch(a) ? 1 : 0;
      const bDest = isLocationDestinationMatch(b) ? 1 : 0;
      if (aDest !== bDest) return bDest - aDest;

      return 0;
    });
  };

  const sortedAllLocations = useMemo(
    () => sortLocationsWithMatchesFirst(transport.locations),
    [transport.locations, transport.matchedDestination, transport.matchedOrigin]
  );

  const offices = useMemo(
    () =>
      sortLocationsWithMatchesFirst(
        transport.locations.filter(
          (loc) =>
            loc.locationType === "office" || loc.locationType === "pickup_only"
        )
      ),
    [transport.locations, transport.matchedDestination, transport.matchedOrigin]
  );

  const godowns = useMemo(
    () =>
      sortLocationsWithMatchesFirst(
        transport.locations.filter(
          (loc) =>
            loc.locationType === "dropoff_only" ||
            loc.locationType === "pickup_and_dropoff"
        )
      ),
    [transport.locations, transport.matchedDestination, transport.matchedOrigin]
  );

  const displayedLocations =
    activeTab === "offices"
      ? offices
      : activeTab === "godowns"
        ? godowns
        : sortedAllLocations;

  const uniqueCities = useMemo(
    () => Array.from(new Set(transport.locations.map((l) => l.city))),
    [transport.locations]
  );

  const initials = useMemo(() => {
    const words = transport.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "TR";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }, [transport.name]);

  const visibleLocations = showAllLocations
    ? displayedLocations
    : displayedLocations.slice(0, 2);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const getCleanPhone = (phone: string) => phone.replace(/[^\d+]/g, "");

  const getWhatsAppLink = (phone: string, company: string) => {
    const clean = getCleanPhone(phone).replace(/^\+/, "");
    const msg = encodeURIComponent(
      `Hi, I found ${company} on TransRoute and want a quote for box/product parcel dispatch.`
    );
    return `https://wa.me/${clean}?text=${msg}`;
  };

  const getGoogleMapsLink = (loc: TransportLocation) => {
    if (loc.lat && loc.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${loc.address}, ${loc.city}, ${loc.state} ${loc.pinCode}`
    )}`;
  };

  return (
    <div
      onClick={() => router.push(`/transports/${transport.id}`)}
      className="group bg-zinc-900/90 rounded-2xl border border-zinc-800/90 hover:border-zinc-700/80 shadow-2xl hover:shadow-orange-500/5 transition-all duration-200 overflow-hidden flex flex-col backdrop-blur-xs cursor-pointer"
    >
      {/* Top Section: Carrier Identity, Pricing, and CTAs */}
      <div className="p-4 sm:p-5 pb-3.5 border-b border-zinc-800/70">
        {/* Identity & Right-Side Action Cluster */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Identity & Status */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Monogram Avatar */}
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-750 flex items-center justify-center font-extrabold text-orange-400 text-xs sm:text-sm shrink-0 ring-1 ring-orange-500/20 shadow-inner">
              {initials}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {/* Status Badges Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                  #{transport.id}
                </span>

                {transport.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-400 border border-sky-800/60">
                    <ShieldCheck className="h-3 w-3 text-sky-400" />
                    <span>Verified</span>
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    transport.isOpenNow
                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                      : "bg-zinc-850 text-zinc-400 border-zinc-750"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>{transport.isOpenNow ? "Open Now" : "Closed"}</span>
                </span>
              </div>

              {/* Carrier Name */}
              <div className="flex items-center gap-1.5 mt-1">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-orange-400 transition-colors tracking-tight truncate">
                  {transport.name}
                </h3>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>

              {/* GSTIN */}
              {transport.gstNumber && (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-400 font-mono">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">
                    GSTIN:
                  </span>
                  <span className="font-semibold text-zinc-300 text-[11px]">
                    {transport.gstNumber}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(transport.gstNumber!, "GSTIN");
                    }}
                    className="p-1 hover:text-orange-400 rounded transition-colors cursor-pointer text-zinc-500"
                    title="Copy GSTIN"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Matched Route Notice if Active */}
              {(transport.matchedOrigin || transport.matchedDestination) && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 w-fit max-w-full">
                  <span className="font-bold text-zinc-500 text-[9px] uppercase tracking-wider">
                    Route:
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {transport.matchedOrigin ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-orange-400">
                        <MapPin className="h-3 w-3" />
                        <span>{transport.matchedOrigin.city}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500 italic">Any Origin</span>
                    )}
                    <span className="text-zinc-500 font-bold px-0.5">→</span>
                    {transport.matchedDestination ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <MapPin className="h-3 w-3" />
                        <span>{transport.matchedDestination.city}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500 italic">
                        Any Destination
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs: Full-Size 50/50 on Mobile, Compact in Top-Right Corner on Desktop */}
          <div className="grid grid-cols-2 gap-2 w-full mt-3 sm:mt-0 sm:flex sm:w-auto sm:self-start sm:items-center sm:gap-2 shrink-0">
            <a
              href={`tel:${getCleanPhone(transport.phoneNumber)}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-8 px-3 text-xs font-semibold rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Call Carrier"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                Call<span className="hidden sm:inline"> Carrier</span>
              </span>
            </a>

            <a
              href={getWhatsAppLink(transport.phoneNumber, transport.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-8 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-950/40 border border-emerald-500/40 active:scale-95 cursor-pointer"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Elevated Freight Rates Strip */}
        {transport.pricing && transport.pricing.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold shrink-0">
              <Package className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Freight Rates:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {transport.pricing.map((p) => {
                const isWeight = p.pricingType === "weight";
                return (
                  <div
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-750 text-[11px] shadow-2xs whitespace-nowrap"
                    title={p.notes || undefined}
                  >
                    {isWeight ? (
                      <Weight className="h-3 w-3 text-orange-400 shrink-0" />
                    ) : (
                      <Layers className="h-3 w-3 text-sky-400 shrink-0" />
                    )}
                    <span className="font-bold text-zinc-100">
                      {formatCurrency(p.rate)}{" "}
                      <span className="font-normal text-zinc-400 text-[10px]">
                        / {p.unit.replace("_", " ")}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Facilities & Hubs Presence */}
      <div className="p-3.5 sm:p-4 bg-zinc-950/70 border-t border-zinc-800/80 text-xs space-y-2.5">
        {/* Coverage Cities Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs touch-pan-x">
          <span className="text-[10px] uppercase font-bold text-zinc-500 shrink-0 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
            <span>Hubs ({transport.locations.length}):</span>
          </span>
          {uniqueCities.map((city) => (
            <span
              key={city}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0"
            >
              {city}
            </span>
          ))}
        </div>

        {/* Tab Filters and Expand/Collapse Header */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-850/80">
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("all");
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-zinc-800 text-zinc-100 shadow-2xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({transport.locations.length})
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("offices");
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === "offices"
                  ? "bg-zinc-800 text-zinc-100 shadow-2xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Offices ({offices.length})
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("godowns");
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === "godowns"
                  ? "bg-zinc-800 text-zinc-100 shadow-2xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Godowns ({godowns.length})
            </button>
          </div>

          {displayedLocations.length > 2 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAllLocations(!showAllLocations);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 cursor-pointer shrink-0"
            >
              <span>
                {showAllLocations
                  ? "Collapse Hubs"
                  : `+${displayedLocations.length - 2} More Hubs`}
              </span>
              {showAllLocations ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        {/* Rendered Hub List: Side-by-Side Dual Hub Grid */}
        <div
          className={`grid gap-2 sm:gap-2.5 ${
            visibleLocations.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {visibleLocations.map((loc) => {
            const isOffice = loc.locationType === "office";
            const mapsUrl = getGoogleMapsLink(loc);
            const isDestMatch = isLocationDestinationMatch(loc);
            const isOrigMatch = isLocationOriginMatch(loc);

            return (
              <div
                key={loc.id}
                className={`p-2.5 sm:p-3 rounded-xl shadow-inner flex flex-col justify-between h-full transition-all ${
                  isDestMatch
                    ? "bg-gradient-to-b from-emerald-950/35 via-zinc-900/95 to-zinc-900/95 border-2 border-emerald-500/90 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : isOrigMatch
                      ? "bg-gradient-to-b from-orange-950/30 via-zinc-900/95 to-zinc-900/95 border-2 border-orange-500/80 shadow-orange-500/10 ring-1 ring-orange-500/30"
                      : "bg-zinc-900/90 border border-zinc-800/80"
                }`}
              >
                {/* Hub Details Header */}
                <div className="min-w-0">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <div
                      className={`p-1 rounded-md shrink-0 mt-0.5 ${
                        isDestMatch
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          : isOrigMatch
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                            : isOffice
                              ? "bg-sky-950/60 text-sky-400 border border-sky-850"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700/60"
                      }`}
                    >
                      {isOffice ? (
                        <Building2 className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                    </div>
                    <span
                      className="font-bold text-xs sm:text-sm text-zinc-200 leading-snug break-words"
                      title={loc.name}
                    >
                      {loc.name}
                    </span>
                  </div>

                  {/* Location Type & Origin / Destination Indicator Badges */}
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-400 border border-zinc-750 shrink-0">
                      {loc.locationType.replace(/_/g, " ")}
                    </span>
                    {isOrigMatch && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 shrink-0">
                        <MapPin className="h-2.5 w-2.5 text-orange-400 shrink-0" />
                        <span>Origin Hub</span>
                      </span>
                    )}
                    {isDestMatch && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                        <MapPin className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                        <span>Destination Hub</span>
                      </span>
                    )}
                  </div>

                  {/* Hub Address */}
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 leading-snug break-words">
                    {loc.address}, {loc.city} -{" "}
                    <span className="font-mono text-zinc-300">
                      {formatPinCode(loc.pinCode)}
                    </span>
                  </p>

                  {/* Operating Hours and Contact Phone */}
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 text-[9px] sm:text-[10px] text-zinc-400 mt-1.5 font-mono">
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="h-2.5 w-2.5 text-zinc-500 shrink-0" />
                      <span>
                        {loc.businessHoursStart} - {loc.businessHoursEnd}
                      </span>
                    </span>
                    {loc.contactPhone && (
                      <span className="truncate text-zinc-400">
                        <span className="hidden xs:inline text-zinc-600 font-bold select-none mr-1">
                          •
                        </span>
                        {loc.contactPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hub Action Buttons Pinned to Bottom */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 mt-2.5 border-t border-zinc-800/70">
                  {loc.contactPhone ? (
                    <a
                      href={`tel:${getCleanPhone(loc.contactPhone)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1 h-7 px-2 text-[10px] sm:text-[11px] font-semibold rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all active:scale-95 cursor-pointer"
                      title={`Call ${loc.name} at ${loc.contactPhone}`}
                    >
                      <Phone className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>Call</span>
                    </a>
                  ) : (
                    <div />
                  )}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-1 h-7 px-2 text-[10px] sm:text-[11px] font-semibold rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition-all active:scale-95 cursor-pointer"
                    title="Open in Google Maps"
                  >
                    <span>Directions</span>
                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
