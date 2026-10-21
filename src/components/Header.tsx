"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, FileSpreadsheet, Search } from "lucide-react";
import { HeaderProps } from "@/types";

export default function Header({
  onOpenAddModal,
  onExportExcel,
  onOpenSearchModal,
  isExporting,
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      <div className="max-w-[1640px] mx-auto px-3.5 sm:px-6 lg:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Branding */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0"
          >
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-xl overflow-hidden shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform duration-200 ring-1 ring-orange-500/30 shrink-0">
              <Image
                src="/logo.svg"
                alt="TransRoute Logo"
                width={44}
                height={44}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors truncate">
                  TransRoute
                </h1>
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-orange-950/60 text-orange-400 border border-orange-800/60 uppercase tracking-wider shrink-0">
                  Cargo
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium hidden md:block truncate">
                Domestic LTL Parcel Offices & Carton Dispatch Godowns in India
              </p>
            </div>
          </Link>

          {/* Action CTAs: Search, Export, Add */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Universal Search Transporters Button */}
            {onOpenSearchModal && (
              <button
                type="button"
                onClick={onOpenSearchModal}
                className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-zinc-750 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-650 text-zinc-300 hover:text-white transition-all shadow-xs cursor-pointer group active:scale-95"
                title="Search transporters by name, phone, city, or PIN (⌘K)"
              >
                <Search className="h-4 w-4 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={onExportExcel}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-zinc-750 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 transition-all shadow-xs disabled:opacity-60 cursor-pointer active:scale-95"
              title="Download Excel Rate Sheet & Transporter Directory"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">
                {isExporting ? "Exporting..." : "Export"}
              </span>
            </button>

            {/* Add Transporter Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Add</span>
              <span className="hidden sm:inline"> Transporter</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md sticky top-0 z-30 shadow-2xl animate-pulse">
      <div className="max-w-[1640px] mx-auto px-3.5 sm:px-6 lg:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-zinc-850 border border-zinc-750/80 shrink-0" />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-5 sm:h-6 w-24 sm:w-28 rounded-md bg-zinc-800" />
                <div className="h-4 w-11 rounded-full bg-zinc-850 border border-zinc-750/50" />
              </div>
              <div className="h-3 w-56 sm:w-72 rounded bg-zinc-850 hidden md:block" />
            </div>
          </div>

          {/* Action CTAs: Search, Export, Add */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="h-9 w-9 sm:w-24 rounded-xl bg-zinc-900 border border-zinc-750/60" />
            <div className="h-9 w-9 sm:w-20 rounded-xl bg-zinc-900 border border-zinc-750/60" />
            <div className="h-9 w-16 sm:w-36 rounded-xl bg-orange-950/40 border border-orange-850/60" />
          </div>
        </div>
      </div>
    </header>
  );
}
