"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteConfirmModalProps } from "@/types";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  transport,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen || !transport) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-w-md w-full p-6 overflow-hidden text-zinc-100"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shadow-inner">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-zinc-100">
              Confirm Deletion
            </h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-100 font-semibold">
                {transport.name}
              </strong>{" "}
              (<span className="font-mono text-orange-400">{transport.id}</span>
              )?
            </p>

            <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 space-y-1 shadow-inner">
              <div className="font-semibold text-zinc-200">
                This action will permanently remove:
              </div>
              <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5">
                <li>
                  {transport.locations.length} booking offices & delivery
                  godowns
                </li>
                <li>{transport.pricing.length} freight rate cards</li>
                <li>All active routing connections for this operator</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
