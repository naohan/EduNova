"use client";

import { estudiantes as estudiantesFijos } from "./data";
import { EstudianteDetalle } from "./EstudianteDetalle";
import { useAula } from "./useAula";

export function FichaEstudiante({ id }: { id: string }) {
  const { estudiantes } = useAula();
  const student = estudiantes.find((e) => e.id === id) ?? estudiantesFijos.find((e) => e.id === id);
  if (!student) return <p className="p-8 text-[#5B5678]">Cargando ficha…</p>;
  return <EstudianteDetalle student={student} />;
}
