// Shared presentational UI for the EduNova Docente panel.
// No "use client" — usable on server and client.

import type { ReactNode } from "react";
import type { Estado } from "./data";

// Estado badges use AA-contrast light tints (not white-on-vivid) with a colored dot.
const estadoConfig: Record<Estado, { bg: string; text: string; dot: string }> = {
  "Logrado": { bg: "bg-[#D1FAE5]", text: "text-[#065F46]", dot: "#10B981" },
  "En proceso": { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "#F59E0B" },
  "En inicio": { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", dot: "#EF4444" },
};

export function EstadoBadge({ estado }: { estado: Estado }) {
  const c = estadoConfig[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${c.bg} ${c.text} px-2.5 py-1 rounded-full text-xs font-semibold`}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: c.dot }}
        aria-hidden="true"
      />
      {estado}
    </span>
  );
}

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  accent?: string; // tailwind text-color class for the value
}

export function StatCard({ icon, label, value, sublabel, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDE9FE] p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-3xl font-bold ${accent ?? "text-[#17164F]"}`}>
        {value}
      </div>
      {sublabel ? (
        <div className="mt-1 text-sm text-[#6B7280]">{sublabel}</div>
      ) : null}
    </div>
  );
}

export function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${count} de 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i <= count ? "text-[#F59E0B]" : "text-[#E5E7EB]"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ProgressBar({ value, ariaLabel }: { value: number; ariaLabel?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className="w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className="h-full rounded-full bg-[#5636D9]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
