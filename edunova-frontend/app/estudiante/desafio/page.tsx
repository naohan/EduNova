import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { desafio } from "@/components/estudiante/data";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto flex max-w-lg flex-col items-center p-4 py-10 text-center sm:p-8">
        <div className="mb-4 text-7xl drop-shadow-md">🏆</div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold text-[#17164F]">
          {desafio.titulo}
        </h1>
        <p className="mt-2 text-[#6B7280]">
          Demuestra lo que aprendiste del Sistema Solar
        </p>

        <div className="mt-6 grid w-full grid-cols-3 gap-3">
          <Info label="Preguntas" value={String(desafio.preguntas)} />
          <Info label="Tiempo" value={`${desafio.minutos} min`} />
          <Info label="Puntos" value={`+${desafio.puntos}`} />
        </div>

        <Link
          href="/estudiante/logro"
          className="mt-8 w-full rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(86,54,217,0.28)]"
        >
          Comenzar desafío
        </Link>
        <Link
          href="/estudiante/practica"
          className="mt-3 text-sm font-semibold text-[#5636D9]"
        >
          Seguir practicando
        </Link>
      </div>
    </EstudianteLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E0FF] bg-white p-3 shadow-sm">
      <div className="text-[11px] text-[#6B7280]">{label}</div>
      <div className="text-lg font-bold text-[#17164F]">{value}</div>
    </div>
  );
}
