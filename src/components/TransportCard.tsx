"use client";

import { useState } from "react";
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
import { TransportLocation, TransportCardProps } from "@/types";
import { formatCurrency, formatPinCode } from "@/helpers/formatters";

export default function TransportCard({ transport }: TransportCardProps) {
  const router = useRouter();
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "offices" | "godowns">(
    "all"
  );

  const offices = transport.locations.filter(
    (loc) => loc.locationType === "office" || loc.locationType === "pickup_only"
  );
  const godowns = transport.locations.filter(
    (loc) =>
      loc.locationType === "dropoff_only" ||
      loc.locationType === "pickup_and_dropoff"
  );

  const displayedLocations =
    activeTab === "offices"
      ? offices
      : activeTab === "godowns"
        ? godowns
        : transport.locations;

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
      {/* Top Banner: Transporter Name, Badges & Freight Rates */}
      <div className="p-4 sm:p-5 pb-3.5 border-b border-zinc-800/70">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Left Column: Transporter Identity & Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800">
                #{transport.id}
              </span>

              {transport.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-400 border border-sky-800/60">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span>Verified Carrier</span>
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                  transport.isOpenNow
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                    : "bg-zinc-800/60 text-zinc-400 border-zinc-700/60"
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>
                  {transport.isOpenNow ? "Hubs Open Now" : "Currently Closed"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-orange-400 transition-colors tracking-tight truncate">
                {transport.name}
              </h3>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
            </div>

            {/* GSTIN badge with one-click copy */}
            {transport.gstNumber && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400 font-mono">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  GSTIN:
                </span>
                <span className="font-semibold text-zinc-300">
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

            {/* Matched Route Notice if Search Active */}
            {(transport.matchedOrigin || transport.matchedDestination) && (
              <div className="mt-2.5 p-2 rounded-xl bg-orange-950/40 border border-orange-800/60 text-xs text-orange-200 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                <div className="flex-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-orange-300">Route:</span>
                  {transport.matchedOrigin ? (
                    <span className="font-medium bg-zinc-950 px-1.5 py-0.5 rounded border border-orange-700 text-orange-100">
                      {transport.matchedOrigin.city} (
                      {transport.matchedOrigin.pinCode})
                    </span>
                  ) : (
                    <span className="text-zinc-400">Any Origin</span>
                  )}
                  <span className="text-orange-400">→</span>
                  {transport.matchedDestination ? (
                    <span className="font-medium bg-zinc-950 px-1.5 py-0.5 rounded border border-orange-700 text-orange-100">
                      {transport.matchedDestination.city} (
                      {transport.matchedDestination.pinCode})
                    </span>
                  ) : (
                    <span className="text-zinc-400">Any Destination</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quick Contact Actions & Freight Rates */}
          <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0">
            {/* Quick Contact & Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-end">
              {/* Direct Phone Call */}
              <a
                href={`tel:${getCleanPhone(transport.phoneNumber)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors shadow-2xs"
                title="Call Transporter"
              >
                <Phone className="h-3.5 w-3.5 text-zinc-300" />
                <span>Call</span>
              </a>

              {/* Direct WhatsApp Messaging */}
              <a
                href={getWhatsAppLink(transport.phoneNumber, transport.name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-600/25"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Freight Rate Chips */}
            {transport.pricing && transport.pricing.length > 0 && (
              <div className="space-y-1.5 md:text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1 md:justify-end">
                  <Package className="h-3 w-3 text-orange-400" />
                  <span>Freight Rates</span>
                </div>
                <div className="space-y-1.5">
                  {Array.from({
                    length: Math.ceil(transport.pricing.length / 4),
                  }).map((_, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex flex-wrap items-center gap-1.5 md:justify-end"
                    >
                      {transport.pricing
                        .slice(rowIdx * 4, rowIdx * 4 + 4)
                        .map((p) => {
                          const isWeight = p.pricingType === "weight";
                          return (
                            <div
                              key={p.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] shadow-inner whitespace-nowrap"
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facilities & Locations (Offices & Godowns) */}
      <div className="p-4 sm:p-5 pt-3 bg-zinc-950/70 border-t border-zinc-800/80 text-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
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
              All Hubs ({transport.locations.length})
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
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
            >
              <span>
                {showAllLocations
                  ? "Show Less"
                  : `+${displayedLocations.length - 2} More`}
              </span>
              {showAllLocations ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {visibleLocations.map((loc) => {
            const isOffice = loc.locationType === "office";
            const mapsUrl = getGoogleMapsLink(loc);

            return (
              <div
                key={loc.id}
                className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isOffice
                        ? "bg-sky-950/60 text-sky-400 border border-sky-850"
                        : "bg-emerald-950/60 text-emerald-400 border border-emerald-850"
                    }`}
                  >
                    {isOffice ? (
                      <Building2 className="h-3.5 w-3.5" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-zinc-200">
                        {loc.name}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                        {loc.locationType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      {loc.address}, {loc.city}, {loc.state} -{" "}
                      <span className="font-mono text-zinc-300">
                        {formatPinCode(loc.pinCode)}
                      </span>
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        {loc.businessHoursStart} - {loc.businessHoursEnd}
                      </span>
                      {loc.contactPhone && (
                        <span>• Phone: {loc.contactPhone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition-colors"
                  >
                    <span>Directions</span>
                    <ExternalLink className="h-3 w-3" />
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
