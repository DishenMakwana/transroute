import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-orange-500/30 selection:text-orange-200">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-2xl shadow-orange-600/20 ring-1 ring-orange-500/30 bg-zinc-900 flex items-center justify-center p-1.5">
          <Image
            src="/logo.svg"
            alt="TransRoute Logo"
            width={72}
            height={72}
            priority
            className="h-full w-full object-contain"
          />
        </div>
        <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-orange-600 flex items-center justify-center text-[11px] font-bold text-white shadow-md">
          404
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
        Hub or Page Not Found
      </h1>
      <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
        The freight corridor, transport booking office, or URL you requested is
        unavailable or may have been relocated.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-600/25 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Freight Directory</span>
        </Link>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 border border-zinc-800 transition-all"
        >
          <Search className="h-4 w-4 text-zinc-400" />
          <span>Corridor Analytics</span>
        </Link>
      </div>
    </div>
  );
}
