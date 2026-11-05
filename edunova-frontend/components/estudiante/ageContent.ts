import type { AgeTier } from "@/lib/api/edunova-contract";
import { teoria } from "./data";

// Contenido de la lección "¿Qué es el Sistema Solar?" adaptado a cada edad (HU-02).
// Mientras la pantalla no lea la unidad de la API (GET /api/units/:id), este es el respaldo.

export type ModoEdad = {
  etiqueta: string;
  descripcion: string;
  parrafos: string[];
};

export const modoPorEdad: Record<AgeTier, ModoEdad> = {
  EXPLORADOR_7_9: {
    etiqueta: "Modo Explorador",
    descripcion: "Cuentos cortos, voz y botones grandes.",
    parrafos: [
      "Había una vez una estrella muy grande y muy caliente: ¡el Sol! ☀️",
      "Ocho planetas viajan alrededor del Sol, como amigos que dan vueltas en un juego.",
      "Nosotros vivimos en el tercer planeta. ¡Se llama Tierra! 🌍",
    ],
  },
  AVENTURERO_10_12: {
    etiqueta: "Modo Aventurero",
    descripcion: "Ruta por etapas y retos guiados.",
    parrafos: teoria.parrafos,
  },
  CREADOR_13_15: {
    etiqueta: "Modo Creador",
    descripcion: "Explicaciones con datos y preguntas abiertas.",
    parrafos: [
      "El Sistema Solar se formó hace unos 4.600 millones de años, cuando una nube de gas y polvo colapsó por su propia gravedad. El Sol concentra más del 99 % de la masa total.",
      "Las órbitas son elipses, no círculos perfectos: la gravedad del Sol curva la trayectoria de cada planeta. Cuanto más lejos está un planeta, más lento viaja y más largo es su año.",
      "La Tierra es el tercer planeta, a unos 150 millones de km del Sol. A esa distancia el agua puede mantenerse líquida en la superficie.",
    ],
  },
};

export const hipotesisCreador =
  "Hipótesis: si el Sol tuviera la mitad de su masa, ¿qué pasaría con las órbitas de los planetas? Escribe tu predicción y explica por qué.";
