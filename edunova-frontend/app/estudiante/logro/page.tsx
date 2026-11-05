import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { logro } from "@/components/estudiante/data";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto flex max-w-lg flex-col items-center p-4 py-10 text-center sm:p-8">
        <Image
          src="/assets/woebling.png"
          alt="Woebling celebrando"
          width={160}
          height={150}
          className="h-auto w-[140px] drop-shadow-lg"
          priority
        />
        <h1 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-semibold text-[#17164F]">
          {logro.titulo}
        </h1>
        <p className="mt-2 text-[#5B5678]">Gran trabajo explorando el Sistema Solar</p>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
            <div className="text-xs text-[#5B5678]">Puntaje</div>
            <div className="text-3xl font-bold text-[#5636D9]">{logro.puntaje}</div>
          </div>
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
            <div className="text-xs text-[#5B5678]">Puntos ganados</div>
            <div className="text-3xl font-bold text-[#FFC928]">+{logro.puntosGanados}</div>
          </div>
        </div>

        <div className="mt-4 w-full rounded-2xl bg-[#F2EEFF] p-4">
          <div className="text-xs font-semibold text-[#5B5678]">
            Nueva insignia
          </div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <Image src="/assets/matematica/compas.png" alt="" width={230} height={350} className="h-12 w-auto" />
            <span className="font-bold text-[#17164F]">{logro.insignia}</span>
          </div>
        </div>

        <Link
          href="/estudiante/progreso"
          className="mt-8 w-full rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white"
        >
          Ver mi progreso
        </Link>
        <Link href="/estudiante" className="mt-3 text-sm font-semibold text-[#5636D9]">
          Volver al inicio
        </Link>
      </div>
    </EstudianteLayout>
  );
}
