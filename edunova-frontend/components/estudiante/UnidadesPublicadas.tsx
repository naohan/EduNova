"use client";

import Link from "next/link";
import { listUnits } from "@/lib/api/client";
import type { Lab3DType, LearningUnit } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import { ArrowRightIcon, BookOpenIcon } from "@/components/ui/icons";

const AULA_DEMO = "EDU-402";

const destinos: Partial<Record<Lab3DType, string>> = {
  SOLAR_SYSTEM: "/estudiante/explorar",
  HUMAN_BODY: "/estudiante/cuerpo",
};

const destinoDe = (unidad: LearningUnit) =>
  destinos[unidad.subtopics[0]?.lab3DIntegration.type ?? "NONE"] ?? "/estudiante/matematica/mapa";

/** Convergencia 1: lo que el docente aprueba en Studio aparece aquí, sin más pasos. */
export function UnidadesPublicadas() {
  const usuario = useSessionUser();
  const unidades = useApi(listUnits, []);
  if (unidades.status !== "ok") return null;

  const aula = usuario?.classroomCode ?? AULA_DEMO;
  const publicadas = unidades.data.filter((u) => u.status === "PUBLISHED" && u.classroomCode === aula).reverse();
  if (!publicadas.length) return null;

  return (
    <section aria-labelledby="unidades-docente" className="mb-5">
      <h2 id="unidades-docente" className="mb-2 font-bold text-[#17164F]">
        De tu docente
      </h2>
      <ul className="space-y-2">
        {publicadas.map((u) => (
          <li key={u.id}>
            <Link
              href={destinoDe(u)}
              className="flex items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-white p-3 hover:bg-[#F7F4FF]"
            >
              <BookOpenIcon weight="duotone" className="h-6 w-6 shrink-0 text-[#5636D9]" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-[#17164F]">{u.title}</span>
                <span className="text-xs text-[#5B5678]">
                  {u.subtopics.length === 1 ? "1 tema" : `${u.subtopics.length} temas`}
                </span>
              </span>
              <ArrowRightIcon weight="bold" className="h-4 w-4 shrink-0 text-[#5636D9]" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
