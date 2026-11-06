"use client";

import { useMemo } from "react";
import { getClassAnalytics, getClassStudents, type ApiResult } from "@/lib/api/client";
import type { ClassAnalytics, ClassStudent, ExplainableAlert, TalentSignal } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import {
  classStats,
  classroomWeekly,
  competenciaMastery,
  estudiantes as estudiantesFijos,
  type CompetenciaMastery,
  type Estado,
  type Estudiante,
} from "./data";

// Panel docente con datos reales del aula. Sin sesión de docente o sin servidor,
// cada pantalla sigue mostrando sus datos fijos: el demo no se cae.

const LOGRADO_DESDE = 75;
const EN_PROCESO_DESDE = 60; // igual que SUPPORT_THRESHOLD en el backend

const notaDe = (percent: number) => Math.round((percent / 5) * 10) / 10;
const porcentaje = (parte: number, total: number) => (total ? Math.round((parte / total) * 100) : 0);

function estadoDe(percent: number): Estado {
  if (percent >= LOGRADO_DESDE) return "Logrado";
  return percent >= EN_PROCESO_DESDE ? "En proceso" : "En inicio";
}

function lecturasTierLabel(tier?: string): string | undefined {
  if (tier === "EXPLORADOR_7_9") return "Lecturas: Explorador";
  if (tier === "AVENTURERO_10_12") return "Lecturas: Aventurero";
  if (tier === "CREADOR_13_15") return "Lecturas: Creador";
  return undefined;
}

function aEstudiante(s: ClassStudent): Estudiante {
  const tieneAjuste = Boolean(s.diagnosticTier && s.ageTier && s.diagnosticTier !== s.ageTier);
  return {
    id: s.studentId,
    nombre: s.alias,
    nota: notaDe(s.overallMasteryPercent),
    progreso: s.overallMasteryPercent,
    estado: estadoDe(s.overallMasteryPercent),
    lecturasTier: tieneAjuste ? lecturasTierLabel(s.diagnosticTier) : undefined,
    competencias: s.mastery.map((m) => ({
      nombre: m.topicName,
      nota: notaDe(m.masteryPercent),
      estado: estadoDe(m.masteryPercent),
    })),
  };
}

function aCompetencias(alumnos: ClassStudent[]): CompetenciaMastery[] {
  const criterios = alumnos[0]?.mastery ?? [];
  return criterios.map((criterio) => {
    const valores = alumnos.flatMap((a) =>
      a.mastery.filter((m) => m.rubricCriterionId === criterio.rubricCriterionId).map((m) => m.masteryPercent),
    );
    const contar = (estado: Estado) => valores.filter((v) => estadoDe(v) === estado).length;
    return {
      nombre: criterio.topicName,
      logrado: porcentaje(contar("Logrado"), valores.length),
      proceso: porcentaje(contar("En proceso"), valores.length),
      inicio: porcentaje(contar("En inicio"), valores.length),
    };
  });
}

const sinAula = <T,>(): Promise<ApiResult<T>> =>
  Promise.resolve({ ok: false, status: 401, error: "Falta iniciar sesión como docente" });

const alertasEjemplo: ExplainableAlert[] = [
  {
    id: "ejemplo-fracciones",
    classId: "EDU-402",
    message: "34% del aula comprende el numerador pero falla al hallar el denominador común en sumas heterogéneas.",
    affectedPercent: 34,
    rubricCriterionId: "rc-frac-1",
  },
];

export function useAula() {
  const usuario = useSessionUser();
  const codigo = usuario?.role === "TEACHER" ? usuario.classroomCode : undefined;
  const analitica = useApi(() => (codigo ? getClassAnalytics(codigo) : sinAula<ClassAnalytics>()), [codigo]);
  const lista = useApi(() => (codigo ? getClassStudents(codigo) : sinAula<ClassStudent[]>()), [codigo]);

  return useMemo(() => {
    const respaldo = {
      enVivo: false,
      estudiantes: estudiantesFijos,
      apoyo: estudiantesFijos.filter((e) => e.estado === "En inicio").sort((a, b) => a.nota - b.nota),
      stats: classStats,
      evolucion: classroomWeekly,
      competencias: competenciaMastery,
      matriz: null as Array<{ id: string; nombre: string; estados: Estado[] }> | null,
      alertas: alertasEjemplo,
      talentos: [] as TalentSignal[],
      avisoTalentos: "",
    };
    if (analitica.status !== "ok" || lista.status !== "ok" || !lista.data.length) return respaldo;

    const alumnos = lista.data;
    const estudiantes = alumnos.map(aEstudiante);
    const apoyo = alumnos
      .filter((a) => a.needsSupport)
      .map(aEstudiante)
      .sort((a, b) => a.nota - b.nota);
    const promedio = notaDe(analitica.data.averageMasteryPercent);
    // No hay historial en el backend: la curva de ejemplo se ajusta para terminar en el promedio real.
    const ajuste = promedio - classroomWeekly[classroomWeekly.length - 1];

    return {
      ...respaldo,
      enVivo: true,
      estudiantes,
      apoyo,
      stats: {
        ...classStats,
        totalEstudiantes: analitica.data.studentCount,
        promedio,
        apoyo: apoyo.length,
        apoyoPct: porcentaje(apoyo.length, analitica.data.studentCount),
      },
      evolucion: classroomWeekly.map((v) => Math.round((v + ajuste) * 10) / 10),
      competencias: aCompetencias(alumnos),
      matriz: alumnos.map((a) => ({
        id: a.studentId,
        nombre: a.alias,
        estados: a.mastery.map((m) => estadoDe(m.masteryPercent)),
      })),
      alertas: analitica.data.alerts,
      talentos: analitica.data.talents,
      avisoTalentos: analitica.data.talentDisclaimer,
    };
  }, [analitica, lista]);
}
