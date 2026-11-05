import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { insignias, estudiante } from "@/components/estudiante/data";
import Image from "next/image";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <p className="text-sm text-[#5B5678]">Mis logros</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Insignias de <NombreAlumno />
          </h1>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {insignias.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 text-center ${
                b.obtenida
                  ? "border-[#E8E0FF] bg-white"
                  : "border-dashed border-[#E8E0FF] bg-[#F7F4FF] opacity-60"
              }`}
            >
              <Image src={b.img} alt="" width={64} height={64} className={`mx-auto h-14 w-14 object-contain ${b.obtenida ? "" : "opacity-40 grayscale"}`} />
              <div className="mt-2 text-sm font-bold text-[#17164F]">{b.nombre}</div>
              <div className="mt-1 text-[11px] text-[#5B5678]">
                {b.obtenida ? "Obtenida" : "Por desbloquear"}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/estudiante/progreso"
          className="mt-6 inline-flex text-sm font-semibold text-[#5636D9]"
        >
          ← Ver progreso completo
        </Link>
      </div>
    </EstudianteLayout>
  );
}
