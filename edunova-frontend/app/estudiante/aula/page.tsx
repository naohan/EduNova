import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <p className="text-sm text-[#6B7280]">Aula</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Aprende con tu equipo
          </h1>
        </header>

        <div className="mb-4 rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
          <label className="block text-xs font-semibold text-[#6B7280]">Código de aula</label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Ej. NOVA-1B"
              className="flex-1 rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] px-4 py-3 text-sm font-bold tracking-widest text-[#17164F]"
              defaultValue="NOVA-1B"
            />
            <button
              type="button"
              className="rounded-xl bg-[#5636D9] px-4 py-3 text-sm font-bold text-white"
            >
              Unirme
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/estudiante/duelo"
            className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm"
          >
            <div className="text-3xl">⚔️</div>
            <h2 className="mt-2 font-bold text-[#17164F]">Duelo de conocimiento</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Crea preguntas para un compañero y luego intercambian roles.
            </p>
          </Link>
          <Link
            href="/estudiante/juegos"
            className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm"
          >
            <div className="text-3xl">🎲</div>
            <h2 className="mt-2 font-bold text-[#17164F]">Tablero en equipo</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Explora casillas con Equipo Galaxia y completa la misión.
            </p>
          </Link>
          <Link
            href="/estudiante/evaluaciones"
            className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm"
          >
            <div className="text-3xl">📝</div>
            <h2 className="mt-2 font-bold text-[#17164F]">Evaluaciones</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Múltiples formas de demostrar lo aprendido.
            </p>
          </Link>
          <Link
            href="/estudiante/habilidades"
            className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm"
          >
            <div className="text-3xl">💪</div>
            <h2 className="mt-2 font-bold text-[#17164F]">Habilidades</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Descubre fortalezas más allá de las notas.
            </p>
          </Link>
        </div>

        <div className="mt-5 flex items-end gap-2 rounded-2xl bg-[#F2EEFF] p-3">
          <Image
            src="/assets/woebling.png"
            alt=""
            width={52}
            height={48}
            className="h-auto w-11"
          />
          <p className="text-sm text-[#17164F]">
            En el aula colaboras sin exponer datos personales. ¡Tu equipo suma!
          </p>
        </div>
      </div>
    </EstudianteLayout>
  );
}
