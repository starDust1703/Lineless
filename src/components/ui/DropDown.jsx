"use client";
import { useState, useRef, useEffect } from "react";

export default function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-(--background)/95 backdrop-blur-2xl shadow-lg border text-sm flex flex-col gap-1 p-1 border-(--border)">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left cursor-pointer hover:bg-(--muted)/70 rounded-lg relative flex select-none items-center gap-2 text-sm outline-none transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
