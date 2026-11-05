import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";

const misiones = [
  {
    titulo: "Explora el Sistema Solar",
    desc: "Completa Descubre + Practica + Demuestra",
    pct: 65,
    href: "/estudiante/ruta",
    estado: "En curso",
  },
  {
    titulo: "Desafío final espacial",
    desc: "10 preguntas · 12 minutos · +200 puntos",
    pct: 0,
    href: "/estudiante/desafio",
    estado: "Disponible",
  },
  {
    titulo: "Insignia Explorador espacial",
    desc: "Gana 9/10 o más en el desafío",
    pct: 0,
    href: "/estudiante/logro",
    estado: "Bloqueada",
  },
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <p className="text-sm text-[#6B7280]">Misiones</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Tus misiones activas
          </h1>
        </header>

        <div className="space-y-3">
          {misiones.map((m) => (
            <Link
              key={m.titulo}
              href={m.href}
              className="block rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[#17164F]">{m.titulo}</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">{m.desc}</p>
                </div>
                <span className="rounded-full bg-[#F2EEFF] px-2.5 py-1 text-[11px] font-bold text-[#5636D9]">
                  {m.estado}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8E0FF]">
                <div
                  className="h-full rounded-full bg-[#5636D9]"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </EstudianteLayout>
  );
}
