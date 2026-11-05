import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { LeccionPorEdad } from "@/components/estudiante/LeccionPorEdad";
import { teoria, unidadActual } from "@/components/estudiante/data";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-xs text-[#6B7280]">
            {unidadActual.titulo} › Descubre
          </p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            {teoria.titulo}
          </h1>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {/* Audio, texto y actividad cambian con el modo de edad */}
            <LeccionPorEdad />

            <div className="flex items-start gap-3 rounded-2xl bg-[#F2EEFF] p-4">
              <Image
                src="/assets/woebling-leyendo.png"
                alt=""
                width={56}
                height={64}
                className="h-auto w-12"
              />
              <p className="text-sm text-[#17164F]">
                Tip: escucha el audio y luego explora el modelo 3D para fijar mejor las ideas.
              </p>
            </div>

            <Link
              href="/estudiante/explorar"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white"
            >
              Explorar en 3D 🌌
            </Link>
          </div>

          {/* Desktop preview panel */}
          <div className="hidden overflow-hidden rounded-3xl bg-[#17164F] lg:block">
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center p-8 text-center text-white">
              <div className="mb-4 text-7xl">🌍</div>
              <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
                Vista previa 3D
              </h2>
              <p className="mt-2 max-w-sm text-sm text-white/70">
                En la siguiente pantalla podrás rotar, acercar y cambiar de planeta.
              </p>
              <Link
                href="/estudiante/explorar"
                className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#5636D9]"
              >
                Abrir explorador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </EstudianteLayout>
  );
}
