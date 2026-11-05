import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";

const pasos = [
  "Creas una pregunta con el material estudiado",
  "Tu compañero responde y recibe feedback",
  "Intercambian los roles",
  "Ambos reciben un informe de aciertos y refuerzo",
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-sm text-[#5B5678]">Aula colaborativa</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Duelo de conocimiento
          </h1>
        </header>

        <div className="mb-5 overflow-hidden rounded-2xl border border-[#E8E0FF] bg-white">
          <div className="flex items-center justify-center gap-4 bg-[#F2EEFF] px-4 py-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image src="/assets/juego ludico/avatar_estudiante.png" alt="" width={240} height={225} className="h-14 w-auto" />
              </div>
              <div className="mt-1 text-xs font-bold text-[#17164F]">Tú</div>
            </div>
            <div className="rounded-full bg-[#17164F] px-3 py-1 text-sm font-black text-[#FFC928]">
              VS
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image src="/assets/juego ludico/avatar_nino.png" alt="" width={220} height={225} className="h-14 w-auto" />
              </div>
              <div className="mt-1 text-xs font-bold text-[#17164F]">Compañero</div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {pasos.map((p, i) => (
              <div key={p} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5636D9] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-[#17164F]">{p}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-end gap-2">
          <Image
            src="/assets/woebling.png"
            alt=""
            width={52}
            height={48}
            className="h-auto w-11"
          />
          <p className="rounded-2xl rounded-bl-sm bg-[#FFF6E8] px-3 py-2 text-sm text-[#92400E]">
            La IA verifica que tus preguntas estén respaldadas por el material.
          </p>
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white"
        >
          Crear duelo
        </button>
        <Link
          href="/estudiante/aula"
          className="mt-3 block text-center text-sm font-semibold text-[#5636D9]"
        >
          Volver al aula
        </Link>
      </div>
    </EstudianteLayout>
  );
}
