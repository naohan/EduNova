"use client";

import { useSessionUser } from "@/lib/api/use-session";
import { estudiante } from "./data";

/** Alias de quien inició sesión. Sin sesión muestra el del estudiante de ejemplo. */
export function NombreAlumno() {
  const usuario = useSessionUser();
  return <>{usuario?.alias ?? estudiante.nombre}</>;
}
