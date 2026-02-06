"use client";
import { useEffect } from "react";

export default function Modal({ open, setOpen, comp }) {
  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div
        className="relative z-10 w-[90%] max-w-md rounded-xl bg-(--card) p-6 shadow-xl border border-(--border)"
        onClick={(e) => e.stopPropagation()}
      >
        {comp}
      </div>
    </div>
  );
}
