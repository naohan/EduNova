import type { AgeTier } from "@/lib/api/edunova-contract";
import { teoria } from "./data";

// Contenido de la lección "¿Qué es el Sistema Solar?" adaptado a cada edad (HU-02).
//
// Cada edad tiene un `gancho` (la frase de apertura) y el cuerpo en `parrafos`.
// El gancho sale del backend (GET /api/units/unit-solar-system, `storyTextByAge` del primer subtema);
// el texto de aquí es el respaldo y copia exactamente la semilla del backend (apps/api/src/data/seed.ts),
// así la lección se lee igual con o sin servidor. Si cambias uno, cambia el otro.

export type ModoEdad = {
  etiqueta: string;
  descripcion: string;
  gancho: string;
  parrafos: string[];
};

export const modoPorEdad: Record<AgeTier, ModoEdad> = {
  EXPLORADOR_7_9: {
    etiqueta: "Modo Explorador",
    descripcion: "Cuentos cortos, voz y botones grandes.",
    gancho:
      "Hace mucho tiempo, una estrella gigante llamada Sol tenía ocho planetas amigos que giraban a su alrededor.",
    parrafos: [
      "Nosotros vivimos en el tercer planeta. ¡Se llama Tierra! 🌍",
      "El Sol nos da luz y calor todos los días. ☀️",
    ],
  },
  AVENTURERO_10_12: {
    etiqueta: "Modo Aventurero",
    descripcion: "Ruta por etapas y retos guiados.",
    gancho:
      "El Sistema Solar es el conjunto formado por el Sol y los cuerpos que giran a su alrededor: planetas, lunas y asteroides.",
    // El primer párrafo de `teoria` es el gancho; aquí va el resto.
    parrafos: teoria.parrafos.slice(1),
  },
  CREADOR_13_15: {
    etiqueta: "Modo Creador",
    descripcion: "Explicaciones con datos y preguntas abiertas.",
    gancho:
      "La gravedad del Sol mantiene en órbita a los planetas. ¿Qué pasaría con las órbitas si el Sol tuviera la mitad de su masa?",
    parrafos: [
      "El Sistema Solar se formó hace unos 4.600 millones de años, cuando una nube de gas y polvo colapsó por su propia gravedad. El Sol concentra más del 99 % de la masa total.",
      "Las órbitas son elipses, no círculos perfectos: la gravedad del Sol curva la trayectoria de cada planeta. Cuanto más lejos está un planeta, más lento viaja y más largo es su año.",
      "La Tierra es el tercer planeta, a unos 150 millones de km del Sol. A esa distancia el agua puede mantenerse líquida en la superficie.",
    ],
  },
};

// La pregunta ya está en el gancho de arriba; aquí solo se pide la respuesta.
export const hipotesisCreador = "Hipótesis: escribe tu predicción y explica por qué.";
