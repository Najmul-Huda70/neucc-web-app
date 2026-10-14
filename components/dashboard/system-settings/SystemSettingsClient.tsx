"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle2, Globe } from "lucide-react";

interface SystemSettingsClientProps {
  initialState: boolean;
}

export default function SystemSettingsClient({ initialState }: SystemSettingsClientProps) {
  const [isMembershipOpen, setIsMembershipOpen] = useState(initialState);
  const [updating, setUpdating] = useState(false);

  const handleToggle = async () => {
    const newState = !isMembershipOpen;
    setIsMembershipOpen(newState); // Optimistic UI Update

    try {
      setUpdating(true);
      const res = await fetch("/api/system-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMembershipOpen: newState }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message);
      } else {
        setIsMembershipOpen(!newState); // Revert on failure
        toast.error(json.error || "Failed to update system settings");
      }
    } catch {
      setIsMembershipOpen(!newState); // Revert on network failure
      toast.error("Network error. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-(--btn-primary-bg)" />
            <h3 className="font-semibold text-sm text-(--text-primary)">
              Membership Registration Access
            </h3>
          </div>
          <p className="text-xs text-(--text-secondary) max-w-lg">
            Controls whether students can access the public membership form. Turning this OFF displays a "Closed" page and blocks all underlying registration APIs.
          </p>
        </div>

        {/* Status Indicator & Framer Motion Animated Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <motion.span
            key={isMembershipOpen ? "open" : "closed"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              isMembershipOpen
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
            }`}
          >
            {isMembershipOpen ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
            {isMembershipOpen ? "Open" : "Closed"}
          </motion.span>

          <button
            onClick={handleToggle}
            disabled={updating}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent p-0.5 transition-colors duration-300 ease-in-out focus:outline-hidden disabled:opacity-50 ${
              isMembershipOpen ? "bg-(--btn-primary-bg)" : "bg-zinc-600"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md"
              animate={{ x: isMembershipOpen ? 20 : 0 }}
            />
          </button>
        </div>
      </div>
    </>
  );
}