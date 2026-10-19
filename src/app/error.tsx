"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for server-side monitoring
    console.error("TransRoute runtime exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-orange-500/30 selection:text-orange-200">
      <div className="h-20 w-20 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400 mb-6 shadow-xl shadow-red-950/20">
        <AlertTriangle className="h-10 w-10" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
        Operational Anomaly Detected
      </h1>
      <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
        An unexpected error occurred while resolving transport data. Our network
        recovery engine is standing by.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 border border-zinc-800 transition-all"
        >
          <Home className="h-4 w-4 text-zinc-400" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
