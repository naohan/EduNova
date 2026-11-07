"use client";

import { AGE_TIERS, ageTierRange, useAgeTier } from "@/lib/age-tier";
import { ageTierLabel } from "@/lib/api/helpers";

/** Selector del modo Camaleón (7 a 9, 10 a 12, 13 a 15). Cambia la interfaz en vivo. */
export function AgeTierSwitcher({ className = "" }: { className?: string }) {
  const [tier, setTier] = useAgeTier();

  return (
    <div role="radiogroup" aria-label="Modo según tu edad" className={`grid grid-cols-3 gap-1.5 ${className}`}>
      {AGE_TIERS.map((t) => {
        const on = t === tier;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`${ageTierLabel[t]}, ${ageTierRange[t]}`}
            title={ageTierRange[t]}
            onClick={() => setTier(t)}
            className={`rounded-xl px-1 py-2 text-center font-bold transition-colors ${
              on ? "bg-[#5636D9] text-white" : "bg-[#F7F4FF] text-[#17164F] hover:bg-[#EAE5FF]"
            }`}
          >
            {ageTierLabel[t]}
          </button>
        );
      })}
    </div>
  );
}
