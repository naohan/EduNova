"use client";

import { getStudentProfile, type ApiResult } from "@/lib/api/client";
import type { StudentProfile } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";

const sinSesion = (): Promise<ApiResult<StudentProfile>> =>
  Promise.resolve({ ok: false, status: 401, error: "Falta iniciar sesión" });

/** Perfil real del estudiante con sesión, o `null` para que la pantalla use su respaldo. */
export function usePerfilAlumno() {
  const usuario = useSessionUser();
  const id = usuario?.role === "STUDENT" ? usuario.id : undefined;
  const perfil = useApi(() => (id ? getStudentProfile(id) : sinSesion()), [id]);
  return perfil.status === "ok" ? perfil.data : null;
}
