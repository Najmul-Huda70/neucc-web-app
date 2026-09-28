"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface FilterOption {
  label: string;
  value: string;
}

interface ColumnFilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const MENU_WIDTH = 160;
const MENU_MAX_HEIGHT = 180;

export default function ColumnFilterDropdown({ label, options, selected, onChange }: ColumnFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isActive = selected.length > 0;

  useEffect(() => setMounted(true), []);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < MENU_MAX_HEIGHT && rect.top > MENU_MAX_HEIGHT;

    let left = rect.left;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }
    if (left < 8) left = 8;

    setCoords((prev) => {
      const next = {
        top: openUpward ? rect.top - 8 : rect.bottom + 8,
        left,
        openUpward,
      };
      // Avoid useless re-renders when nothing actually moved
      if (prev.top === next.top && prev.left === next.left && prev.openUpward === next.openUpward) {
        return prev;
      }
      return next;
    });
  };

  // While open, keep re-measuring every frame so the menu always
  // stays glued to the button — even if the button's own size/position
  // shifts (e.g. the "active" dot appears, sibling columns re-render, etc.)
  useEffect(() => {
    if (!open) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = () => {
      calculatePosition();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleValue = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 font-semibold transition-colors ${
          isActive ? "text-[var(--btn-primary-bg)]" : "text-[var(--text-secondary)]"
        }`}
      >
        {label}
        <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 5h18M6 12h12M10 19h4" strokeLinecap="round" />
        </svg>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--btn-primary-bg)] shrink-0" />}
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                top: coords.openUpward ? undefined : coords.top,
                bottom: coords.openUpward ? window.innerHeight - coords.top : undefined,
                left: coords.left,
                width: MENU_WIDTH,
                zIndex: 100,
              }}
              className="rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--card-bg)] p-2 shadow-lg"
            >
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--stat-card-bg)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggleValue(opt.value)}
                    className="accent-[var(--btn-primary-bg)]"
                  />
                  {opt.label}
                </label>
              ))}
              {isActive && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="mt-1 w-full rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[var(--text-important)] hover:bg-[var(--text-important)]/10"
                >
                  Clear filter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}