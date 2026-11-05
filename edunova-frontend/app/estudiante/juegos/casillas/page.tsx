import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { casillasTablero } from "@/components/estudiante/data";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/estudiante/juegos" className="text-lg text-[#5636D9]" aria-label="Volver">
            ‹
          </Link>
          <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            Casillas del tablero
          </h1>
        </div>

        <div className="space-y-3">
          {casillasTablero.map((c) => (
            <article
              key={c.nombre}
              className="flex items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EEFF] text-2xl">
                {c.icon}
              </span>
              <div>
                <h2 className="font-bold text-[#17164F]">{c.nombre}</h2>
                <p className="text-sm text-[#6B7280]">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <Link
          href="/estudiante/juegos"
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#5636D9] py-3.5 text-sm font-bold text-white"
        >
          Volver al tablero
        </Link>
      </div>
    </EstudianteLayout>
  );
}
