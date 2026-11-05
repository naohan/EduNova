import type { ReactNode } from "react";
import type { Estado } from "./data";

const estadoConfig: Record<Estado, { bg: string; text: string; dot: string }> = {
  Logrado: { bg: "bg-[#D1FAE5]", text: "text-[#065F46]", dot: "#2DBE70" },
  "En proceso": { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "#FFC928" },
  "En inicio": { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", dot: "#EF4444" },
};

export function EstadoBadge({ estado }: { estado: Estado }) {
  const c = estadoConfig[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${c.bg} ${c.text} rounded-full px-2.5 py-1 text-xs font-semibold`}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.dot }} aria-hidden />
      {estado}
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent,
  alert,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  accent?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        alert ? "border-red-200 bg-[#FFF5F5]" : "border-[#EDE9FE] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
        {icon ? <span aria-hidden>{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-3xl font-bold ${accent ?? "text-[#17164F]"}`}>{value}</div>
      {sublabel ? <div className="mt-1 text-sm text-[#6B7280]">{sublabel}</div> : null}
    </div>
  );
}

export function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${count} de 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} aria-hidden className={i <= count ? "text-[#FFC928]" : "text-[#E5E7EB]"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ProgressBar({
  value,
  ariaLabel,
  color,
}: {
  value: number;
  ariaLabel?: string;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill =
    color ??
    (clamped >= 80 ? "#2DBE70" : clamped >= 55 ? "#FFC928" : "#EF4444");
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-[#E8E4F8]"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: fill }} />
    </div>
  );
}

export function MobilePageHeader({
  title,
  subtitle,
  backHref = "/docente",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="mb-4 lg:hidden">
      <div className="mb-1 flex items-center gap-2">
        <a
          href={backHref}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5636D9]"
          aria-label="Volver"
        >
          ←
        </a>
        <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
          {title}
        </h1>
      </div>
      {subtitle ? <p className="pl-10 text-sm text-[#6B7280]">{subtitle}</p> : null}
    </header>
  );
}

export function SoftSkill({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6B7280]">{name}</span>
      <span className={ok ? "font-semibold text-[#2DBE70]" : "text-[#EF4444]"}>
        {ok ? "✓" : "–"}
      </span>
    </div>
  );
}
