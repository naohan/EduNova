"use client";

import { AGE_TIERS, ageTierRange, useAgeTier } from "@/lib/age-tier";
import { ageTierLabel } from "@/lib/api/helpers";

/** Selector del modo Camaleón (7–9, 10–12, 13–15). Cambia la interfaz en vivo. */
export function AgeTierSwitcher({ className = "" }: { className?: string }) {
  const [tier, setTier] = useAgeTier();

  return (
    <div
      role="radiogroup"
      aria-label="Modo según tu edad"
      className={`inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-[#E8E0FF] ${className}`}
    >
      {AGE_TIERS.map((t) => {
        const on = t === tier;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setTier(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
              on ? "bg-[#5636D9] text-white shadow" : "text-[#17164F]/70 hover:bg-[#F2EEFF]"
            }`}
          >
            {ageTierLabel[t]}
            <span className="ml-1.5 hidden font-medium opacity-80 sm:inline">{ageTierRange[t]}</span>
          </button>
        );
      })}
    </div>
  );
}
