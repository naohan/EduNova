import type { Lab3DType, LearningUnit, RubricCriterion } from "@/lib/api/edunova-contract";

export type SubtemaBorrador = { id: string; titulo: string; lab: Lab3DType };

/** Lo que el docente revisa antes de publicar. */
export type Borrador = {
  id: string;
  titulo: string;
  aula: string;
  subtemas: SubtemaBorrador[];
  rubrica: RubricCriterion[];
  /** true si el servidor no respondió y es el ejemplo local: no se guarda en ningún lado. */
  sinConexion: boolean;
};

export const labNombre: Record<Lab3DType, string> = {
  SOLAR_SYSTEM: "Sistema Solar 3D",
  HUMAN_BODY: "Cuerpo Humano 3D",
  MOLECULAR_LAB: "Molecular Lab",
  STUDYFI_PHYSICS: "StudyFi Virtual Lab",
  EARTH_OS: "earthOS",
  NONE: "Sin laboratorio",
};

/** "sistema-solar_v2.pdf" -> "sistema solar v2" */
export function tituloDesdeArchivo(nombre: string) {
  return nombre.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function esArchivoDeTexto(archivo: File) {
  return archivo.type.startsWith("text/") || /\.(txt|md)$/i.test(archivo.name);
}

/** Devuelve null si la respuesta del servidor llega incompleta. */
export function aBorrador(unidad: LearningUnit): Borrador | null {
  if (!unidad?.id || !Array.isArray(unidad.subtopics) || !Array.isArray(unidad.rubric)) return null;
  return {
    id: unidad.id,
    titulo: unidad.title,
    aula: unidad.classroomCode,
    subtemas: unidad.subtopics.map((s) => ({
      id: s.id,
      titulo: s.title,
      lab: s.lab3DIntegration?.type ?? "NONE",
    })),
    rubrica: unidad.rubric,
    sinConexion: false,
  };
}

const criterio = (id: string, subtopicId: string, topicName: string, suggestedActivity: string): RubricCriterion => ({
  id,
  subtopicId,
  topicName,
  evaluationCriterion: "Identifica y explica las características del tema",
  suggestedActivity,
  approvedByTeacher: false,
});

// RNF-03: si el servidor falla durante el demo, el flujo sigue con este ejemplo (y la pantalla lo avisa).
export function borradorDeEjemplo(titulo: string, texto: string): Borrador {
  const esSolar = /planeta|sistema solar|órbita|orbita/i.test(`${titulo} ${texto}`);
  if (esSolar) {
    return {
      id: "ejemplo-sistema-solar",
      titulo: titulo || "Sistema Solar",
      aula: "EDU-402",
      subtemas: [
        { id: "ej-1", titulo: "1. ¿Qué es el Sistema Solar?", lab: "SOLAR_SYSTEM" },
        { id: "ej-2", titulo: "2. Los planetas rocosos", lab: "SOLAR_SYSTEM" },
        { id: "ej-3", titulo: "3. Los gigantes gaseosos", lab: "SOLAR_SYSTEM" },
      ],
      rubrica: [
        criterio("ej-r1", "ej-1", "¿Qué es el Sistema Solar?", "Explorar modelo 3D"),
        criterio("ej-r2", "ej-2", "Los planetas rocosos", "Explorar modelo 3D"),
        criterio("ej-r3", "ej-3", "Los gigantes gaseosos", "Explorar modelo 3D"),
      ],
      sinConexion: true,
    };
  }
  return {
    id: "ejemplo-fracciones",
    titulo: titulo || "Mundo de las Fracciones",
    aula: "EDU-402",
    subtemas: [{ id: "ej-1", titulo: "1. ¿Qué es una fracción?", lab: "NONE" }],
    rubrica: [
      {
        ...criterio("ej-r1", "ej-1", "Suma de fracciones", "Resolver problema contextualizado"),
        evaluationCriterion: "Resuelve operaciones y explica el procedimiento",
      },
    ],
    sinConexion: true,
  };
}
