"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Phone,
  MessageCircle,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Clock,
  Building2,
  Filter,
} from "lucide-react";
import { UniversalSearchModalProps, SearchScope } from "@/types";

export default function UniversalSearchModal({
  isOpen,
  onClose,
  transports,
  onFilterDirectory,
}: UniversalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");

  // Auto-focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setScope("all");
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const getCleanPhone = (phone: string) => phone.replace(/[^\d+]/g, "");

  const getWhatsAppLink = (phone: string, company: string) => {
    const clean = getCleanPhone(phone).replace(/^\+/, "");
    const msg = encodeURIComponent(
      `Hi, I found ${company} on TransRoute and want to inquire about parcel dispatch.`
    );
    return `https://wa.me/${clean}?text=${msg}`;
  };

  // Perform multi-attribute matching
  const matchingTransports = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transports.slice(0, 6); // show first 6 when empty

    const rawDigits = q.replace(/\D/g, "");

    return transports.filter((t) => {
      const nameMatch = t.name.toLowerCase().includes(q);
      const gstinMatch = t.gstNumber?.toLowerCase().includes(q) ?? false;
      const phoneClean = t.phoneNumber.replace(/\D/g, "");
      const phoneMatch = rawDigits ? phoneClean.includes(rawDigits) : false;

      const cityMatch = t.locations.some((loc) =>
        loc.city.toLowerCase().includes(q)
      );
      const pinMatch = t.locations.some((loc) => loc.pinCode.includes(q));
      const locPhoneMatch = t.locations.some((loc) => {
        if (!loc.contactPhone || !rawDigits) return false;
        return loc.contactPhone.replace(/\D/g, "").includes(rawDigits);
      });

      switch (scope) {
        case "name":
          return nameMatch || gstinMatch;
        case "phone":
          return phoneMatch || locPhoneMatch;
        case "city":
          return cityMatch;
        case "pin":
          return pinMatch;
        case "all":
        default:
          return (
            nameMatch ||
            gstinMatch ||
            phoneMatch ||
            cityMatch ||
            pinMatch ||
            locPhoneMatch
          );
      }
    });
  }, [query, scope, transports]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-16 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-950/50 border border-orange-500/30 text-orange-400 shrink-0">
              <Search className="h-5 w-5" />
            </div>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by transporter name, phone (+91...), city, or PIN..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-white placeholder-zinc-500 outline-none pr-8"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                ESC to close
              </kbd>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scope Filters */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-850 flex-wrap">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">
              Search In:
            </span>
            {(
              [
                { id: "all", label: "All Attributes" },
                { id: "name", label: "Company Name" },
                { id: "phone", label: "Phone Number" },
                { id: "city", label: "Hub City" },
                { id: "pin", label: "PIN Code" },
              ] as const
            ).map((s) => {
              const isActive = scope === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScope(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs"
                      : "bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>
              {query
                ? `Found ${matchingTransports.length} matching transporters`
                : "Suggested Transporters"}
            </span>
            {query && onFilterDirectory && (
              <button
                type="button"
                onClick={() => {
                  onFilterDirectory(query);
                  onClose();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 underline cursor-pointer"
              >
                <Filter className="h-3 w-3" />
                <span>Filter Main Directory to "{query}"</span>
              </button>
            )}
          </div>

          {matchingTransports.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-zinc-850 flex items-center justify-center text-zinc-500">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-300">
                No transporters found
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No transport operator matches "{query}" under scope "{scope}".
                Try searching by city (e.g., Pune, Ahmedabad) or numeric PIN
                code.
              </p>
            </div>
          ) : (
            matchingTransports.map((transport) => {
              // Extract unique cities from locations
              const hubCities = Array.from(
                new Set(transport.locations.map((l) => l.city))
              );

              return (
                <div
                  key={transport.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        #{transport.id}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                        {transport.name}
                      </h4>
                      {transport.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/60">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      )}
                      {transport.isOpenNow && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                          <Clock className="h-3 w-3" />
                          <span>Open</span>
                        </span>
                      )}
                    </div>

                    {/* Phone & GSTIN row */}
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono flex-wrap">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Phone className="h-3 w-3 text-emerald-400" />
                        <span>{transport.phoneNumber}</span>
                      </span>
                      {transport.gstNumber && (
                        <span>• GSTIN: {transport.gstNumber}</span>
                      )}
                    </div>

                    {/* Hubs preview */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-0.5 flex-wrap">
                      <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
                      <span className="text-[11px] font-medium text-zinc-300">
                        Hubs ({transport.locations.length}):
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {hubCities.slice(0, 4).map((city) => (
                          <span
                            key={city}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                          >
                            {city}
                          </span>
                        ))}
                        {hubCities.length > 4 && (
                          <span className="text-[10px] text-zinc-500">
                            +{hubCities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-850 w-full sm:w-auto justify-end">
                    <a
                      href={`tel:${getCleanPhone(transport.phoneNumber)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-750 transition-colors"
                      title="Call primary line"
                    >
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>Call</span>
                    </a>

                    <a
                      href={getWhatsAppLink(
                        transport.phoneNumber,
                        transport.name
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>Chat</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(`/transports/${transport.id}`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer shadow-sm shadow-orange-600/20"
                      title="View full profile"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer info */}
        <div className="p-3 px-5 border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>
              Search covers verified carriers, branch godowns & offices
            </span>
          </div>
          <span className="hidden sm:inline">Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
