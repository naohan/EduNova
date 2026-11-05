import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { rutaPasos, unidadActual } from "@/components/estudiante/data";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <p className="text-sm text-[#6B7280]">Ruta de aprendizaje</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            {unidadActual.titulo}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{unidadActual.leccion}</p>
        </header>

        <ol className="relative space-y-4 before:absolute before:left-[23px] before:top-4 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-[#E8E0FF]">
          {rutaPasos.map((paso, i) => {
            const done = paso.estado === "completado";
            const current = paso.estado === "actual";
            const locked = paso.estado === "bloqueado";
            return (
              <li key={paso.id} className="relative pl-14">
                <span
                  className={`absolute left-0 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                    done
                      ? "bg-[#2DBE70] text-white"
                      : current
                        ? "bg-[#5636D9] text-white ring-4 ring-[#5636D9]/20"
                        : "bg-[#E8E0FF] text-[#9CA3AF]"
                  }`}
                >
                  {done ? "✓" : locked ? "🔒" : i + 1}
                </span>
                <div
                  className={`rounded-2xl border p-4 shadow-sm ${
                    current
                      ? "border-[#5636D9] bg-white"
                      : done
                        ? "border-[#E8E0FF] bg-white"
                        : "border-dashed border-[#E8E0FF] bg-[#F7F4FF]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-[#17164F]">{paso.titulo}</h2>
                      <p className="mt-0.5 text-sm text-[#6B7280]">{paso.desc}</p>
                    </div>
                    {done ? (
                      <span className="rounded-full bg-[#D1FAE5] px-2.5 py-1 text-xs font-bold text-[#065F46]">
                        Listo
                      </span>
                    ) : null}
                    {current ? (
                      <span className="rounded-full bg-[#F2EEFF] px-2.5 py-1 text-xs font-bold text-[#5636D9]">
                        Ahora
                      </span>
                    ) : null}
                  </div>
                  {!locked ? (
                    <Link
                      href={paso.href}
                      className={`mt-3 inline-flex rounded-xl px-4 py-2 text-sm font-bold ${
                        current
                          ? "bg-[#5636D9] text-white"
                          : "bg-[#F2EEFF] text-[#5636D9]"
                      }`}
                    >
                      {done ? "Repasar" : "Empezar"} →
                    </Link>
                  ) : (
                    <p className="mt-3 text-xs text-[#9CA3AF]">Completa Practica para desbloquear</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/estudiante/explorar"
            className="rounded-2xl border border-[#E8E0FF] bg-white p-4 text-center text-sm font-semibold text-[#5636D9] shadow-sm"
          >
            🌌 Explorar en 3D
          </Link>
          <Link
            href="/estudiante/desafio"
            className="rounded-2xl border border-[#E8E0FF] bg-white p-4 text-center text-sm font-semibold text-[#17164F] shadow-sm"
          >
            🏆 Ver desafío final
          </Link>
        </div>
      </div>
    </EstudianteLayout>
  );
}
