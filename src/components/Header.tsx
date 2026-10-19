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
      <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 rounded-xl overflow-hidden shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform duration-200 ring-1 ring-orange-500/30 shrink-0">
              <Image
                src="/logo.svg"
                alt="TransRoute Logo"
                width={44}
                height={44}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                  TransRoute
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-950/60 text-orange-400 border border-orange-800/60 uppercase tracking-wider">
                  Box & Cargo Only
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Domestic LTL Parcel Offices & Carton Dispatch Godowns in India
              </p>
            </div>
          </Link>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Universal Search Transporters Button */}
            {onOpenSearchModal && (
              <button
                type="button"
                onClick={onOpenSearchModal}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-xl border border-zinc-750 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-650 text-zinc-300 hover:text-white transition-all shadow-xs cursor-pointer group"
                title="Search transporters by name, phone, city, or PIN (⌘K)"
              >
                <Search className="h-3.5 w-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Search Transporters</span>
                <span className="sm:hidden">Search</span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800">
                  ⌘K
                </kbd>
              </button>
            )}

            <button
              type="button"
              onClick={onExportExcel}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-zinc-750 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              title="Download Excel Rate Sheet & Transporter Directory"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>{isExporting ? "Exporting..." : "Export Excel"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transporter</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
