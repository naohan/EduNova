import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { TituloPantalla } from "@/components/estudiante/shared/kit";
import { LockIcon, PlayIcon } from "@/components/ui/icons";

const misiones = [
  {
    titulo: "Explora el Sistema Solar",
    pct: 65,
    href: "/estudiante/ruta",
    estado: "En curso",
  },
  {
    titulo: "Desafío final espacial",
    pct: 0,
    href: "/estudiante/desafio",
    estado: "Disponible",
  },
  {
    titulo: "Insignia Explorador espacial",
    pct: 0,
    href: "/estudiante/logro",
    estado: "Bloqueada",
  },
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla>Retos</TituloPantalla>

        <div className="space-y-3">
          {misiones.map((m) => {
            const bloqueada = m.estado === "Bloqueada";
            return (
              <Link key={m.titulo} href={m.href} className="card-tactil tactil-cooperar-suave items-center gap-3 p-4">
                <span className="min-w-0 flex-1">
                  <span className="block font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">{m.titulo}</span>
                  {m.pct > 0 ? (
                    <span className="mt-2 block h-3 overflow-hidden rounded-full bg-white" aria-hidden>
                      <span className="block h-full rounded-full bg-[#2DBE70]" style={{ width: `${m.pct}%` }} />
                    </span>
                  ) : null}
                </span>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2DBE70] text-[#17164F]">
                  {bloqueada ? (
                    <LockIcon weight="fill" className="h-6 w-6" aria-label="Bloqueada" />
                  ) : (
                    <PlayIcon weight="fill" className="h-6 w-6" aria-hidden />
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </EstudianteLayout>
  );
}
