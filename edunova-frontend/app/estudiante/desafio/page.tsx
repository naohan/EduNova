import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { desafio } from "@/components/estudiante/data";
import Image from "next/image";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto flex max-w-lg flex-col items-center p-4 py-10 text-center sm:p-8">
        <Image src="/assets/juego ludico/icon_trofeo.png" alt="" width={230} height={161} className="mx-auto mb-4 h-24 w-auto" />
        <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold text-[#17164F]">
          {desafio.titulo}
        </h1>

        <div className="mt-6 grid w-full grid-cols-3 gap-3">
          <Info label="Preguntas" value={String(desafio.preguntas)} />
          <Info label="Tiempo" value={`${desafio.minutos} min`} />
          <Info label="Puntos" value={`+${desafio.puntos}`} />
        </div>

        <Link
          href="/estudiante/logro"
          className="btn-tactil tactil-juego mt-8 w-full py-4 text-xl text-[#17164F]"
        >
          ¡Empezar!
        </Link>
        <Link href="/estudiante/practica" className="mt-3 p-2 font-bold text-[#17164F]">
          Practicar
        </Link>
      </div>
    </EstudianteLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E0FF] bg-white p-3">
      <div className="text-[11px] text-[#5B5678]">{label}</div>
      <div className="text-lg font-bold text-[#17164F]">{value}</div>
    </div>
  );
}
