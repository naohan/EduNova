import type { ExplainableAlert, TalentSignal } from "@/lib/api/edunova-contract";
import { WarningIcon } from "@/components/ui/icons";
import { ProgressBar } from "./ui";

export function FuenteDatos({ enVivo }: { enVivo: boolean }) {
  return (
    <p
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        enVivo ? "bg-[#E9F9F0] text-[#127A43]" : "bg-[#F2EEFF] text-[#5B5678]"
      }`}
    >
      {enVivo ? "Datos del aula en vivo" : "Datos de ejemplo: inicia sesión como docente para ver tu aula"}
    </p>
  );
}

/** RF-05: dice qué falla y a cuántos estudiantes, no solo una nota. */
export function AlertasExplicables({ alertas }: { alertas: ExplainableAlert[] }) {
  if (!alertas.length) return null;
  return (
    <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
      <h2 className="flex items-center gap-2 font-bold text-[#17164F]">
        <WarningIcon weight="fill" className="h-5 w-5 text-[#92400E]" aria-hidden />
        Alertas explicables
      </h2>
      <p className="text-xs text-[#5B5678]">Recomendación para revisión docente.</p>
      <ul className="mt-3 space-y-2">
        {alertas.map((a) => (
          <li key={a.id} className="rounded-xl bg-[#FFF8E8] p-3 text-sm text-[#17164F]">
            {a.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

const senales: Array<{ clave: "creativity" | "collaboration" | "logic"; nombre: string }> = [
  { clave: "creativity", nombre: "Creatividad" },
  { clave: "collaboration", nombre: "Colaboración" },
  { clave: "logic", nombre: "Lógica" },
];

/** RF-05, Reto 20: sugerencias para observar en clase, nunca etiquetas. */
export function RadarTalentos({ talentos, aviso }: { talentos: TalentSignal[]; aviso: string }) {
  if (!talentos.length) return null;
  return (
    <section className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#17164F]">Radar de Talentos</h3>
      <ul className="mt-3 space-y-3">
        {talentos.map((t) => (
          <li key={t.studentId}>
            <div className="mb-1 text-sm font-semibold text-[#17164F]">{t.alias}</div>
            <div className="space-y-1">
              {senales.map((s) => (
                <div key={s.clave} className="grid grid-cols-[88px_1fr_28px] items-center gap-2 text-xs text-[#5B5678]">
                  <span>{s.nombre}</span>
                  <ProgressBar value={t[s.clave]} ariaLabel={`${s.nombre} de ${t.alias}`} />
                  <span className="text-right tabular-nums">{t[s.clave]}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs italic text-[#5B5678]">{aviso}</p>
    </section>
  );
}
