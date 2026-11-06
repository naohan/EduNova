import type { IngestedUnit } from "@/lib/api/client";
import type { AgeTier, Lab3DType, RubricCriterion } from "@/lib/api/edunova-contract";

export type SubtemaBorrador = {
  id: string;
  titulo: string;
  lab: Lab3DType;
  textos?: Record<AgeTier, string>;
  lecturaFacil?: string;
  pictogramas?: Array<{ word: string; id: number }>;
  tarjetas: number;
  preguntas: number;
};

/** Lo que el docente revisa antes de publicar. */
export type Borrador = {
  id: string;
  titulo: string;
  aula: string;
  subtemas: SubtemaBorrador[];
  rubrica: RubricCriterion[];
  /** true si el servidor no respondió y es el ejemplo local: no se guarda en ningún lado. */
  sinConexion: boolean;
  /** Modelo que leyó el material. Sin esto, es contenido de ejemplo, no el del docente. */
  modeloIa?: string;
  /** Por qué no se pudo usar la IA. */
  avisoIa?: string;
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

const TIPOS_PARA_IA = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
/** Base64 ocupa un tercio más y el servidor acepta 10 MB por petición. */
export const MAX_ARCHIVO_BYTES = 7 * 1024 * 1024;

export function motivoDeRechazo(archivo: File) {
  if (esArchivoDeTexto(archivo)) return null;
  if (!TIPOS_PARA_IA.includes(archivo.type)) return "Ese formato no se puede leer. Guárdalo como PDF o imagen.";
  if (archivo.size > MAX_ARCHIVO_BYTES) return "El archivo pesa más de 7 MB. Prueba con una versión más liviana.";
  return null;
}

/** Contenido del archivo en base64, sin el prefijo data:. */
export function leerBase64(archivo: File) {
  return new Promise<string>((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result).split(",")[1] ?? "");
    lector.onerror = () => reject(new Error("No se pudo leer el archivo"));
    lector.readAsDataURL(archivo);
  });
}

/** Devuelve null si la respuesta del servidor llega incompleta. */
export function aBorrador(unidad: IngestedUnit): Borrador | null {
  if (!unidad?.id || !Array.isArray(unidad.subtopics) || !Array.isArray(unidad.rubric)) return null;
  return {
    id: unidad.id,
    titulo: unidad.title,
    aula: unidad.classroomCode,
    subtemas: unidad.subtopics.map((s) => ({
      id: s.id,
      titulo: s.title,
      lab: s.lab3DIntegration?.type ?? "NONE",
      textos: s.stages?.discover?.storyTextByAge,
      lecturaFacil: s.stages?.discover?.easyReadText,
      pictogramas: s.stages?.discover?.pictograms,
      tarjetas: s.stages?.practice?.flashcards?.length ?? 0,
      preguntas: s.stages?.demonstrate?.questions?.length ?? 0,
    })),
    rubrica: unidad.rubric,
    sinConexion: false,
    modeloIa: unidad.aiModel,
    avisoIa: unidad.aiNotice,
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
        { id: "ej-1", titulo: "1. ¿Qué es el Sistema Solar?", lab: "SOLAR_SYSTEM", tarjetas: 0, preguntas: 0 },
        { id: "ej-2", titulo: "2. Los planetas rocosos", lab: "SOLAR_SYSTEM", tarjetas: 0, preguntas: 0 },
        { id: "ej-3", titulo: "3. Los gigantes gaseosos", lab: "SOLAR_SYSTEM", tarjetas: 0, preguntas: 0 },
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
    subtemas: [{ id: "ej-1", titulo: "1. ¿Qué es una fracción?", lab: "NONE", tarjetas: 0, preguntas: 0 }],
    rubrica: [
      {
        ...criterio("ej-r1", "ej-1", "Suma de fracciones", "Resolver problema contextualizado"),
        evaluationCriterion: "Resuelve operaciones y explica el procedimiento",
      },
    ],
    sinConexion: true,
  };
}
