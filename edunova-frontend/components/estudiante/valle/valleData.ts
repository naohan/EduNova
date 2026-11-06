import type { ReactNode } from "react";
import {
  BookOpenIcon,
  DiceFiveIcon,
  HeartIcon,
  HouseIcon,
  PlanetIcon,
  SwordIcon,
} from "@/components/ui/icons";

export type LugarValleId = "escuela" | "casa" | "observatorio" | "consultorio" | "dado" | "arena";

export type SeccionLugar = "explorar" | "juego" | "cooperar" | "magia" | "refuerzo";

export interface LugarValle {
  id: LugarValleId;
  nombre: string;
  ruta: string;
  descripcion: string;
  frase: string;
  seccion: SeccionLugar;
  color: string;
  posicion: [number, number, number];
  puntoEntrada: [number, number, number];
  radio: number;
  radioSolido: number;
  tipo: "Lecciones" | "Familia" | "3D" | "2D";
  icon: (p: { className?: string; weight?: "bold" | "regular" | "fill" | "duotone" }) => ReactNode;
}

export const LUGARES_VALLE: LugarValle[] = [
  {
    id: "escuela",
    nombre: "Escuela",
    ruta: "/estudiante/unidades",
    descripcion: "Lecciones y unidades de tu clase",
    frase: "Entra a repasar las lecciones de tu clase",
    seccion: "explorar",
    color: "#4C9EFF",
    posicion: [-15, 0, -12],
    puntoEntrada: [-15, 0, -7.5],
    radio: 4.8,
    radioSolido: 3.2,
    tipo: "Lecciones",
    icon: BookOpenIcon,
  },
  {
    id: "casa",
    nombre: "Tu casa",
    ruta: "/estudiante/unidades",
    descripcion: "Lecciones y saberes de tu familia",
    frase: "Descubre las historias y saberes en familia",
    seccion: "cooperar",
    color: "#2DBE70",
    posicion: [17, 0, -12],
    puntoEntrada: [13.5, 0, -10],
    radio: 4.8,
    radioSolido: 2.8,
    tipo: "Familia",
    icon: HouseIcon,
  },
  {
    id: "observatorio",
    nombre: "Observatorio",
    ruta: "/estudiante/aventuras/piloto",
    descripcion: "Pilota tu nave por el Sistema Solar",
    frase: "Viaja entre los planetas y cumple misiones",
    seccion: "magia",
    color: "#5636D9",
    posicion: [-18, 1.3, 12],
    puntoEntrada: [-15, 0.4, 9],
    radio: 5.0,
    radioSolido: 3.2,
    tipo: "3D",
    icon: PlanetIcon,
  },
  {
    id: "consultorio",
    nombre: "Consultorio",
    ruta: "/estudiante/aventuras/doctor",
    descripcion: "Investiga órganos y resuelve casos médicos",
    frase: "Examina a tus pacientes y descubre la salud",
    seccion: "cooperar",
    color: "#25CFE0",
    posicion: [17, 0, 13],
    puntoEntrada: [13.5, 0, 11],
    radio: 4.8,
    radioSolido: 2.9,
    tipo: "3D",
    icon: HeartIcon,
  },
  {
    id: "dado",
    nombre: "Plaza del dado",
    ruta: "/estudiante/juegos",
    descripcion: "Juego de tablero y desafíos con dados",
    frase: "Lanza el dado y avanza en el tablero",
    seccion: "juego",
    color: "#FFC928",
    posicion: [-2, 0, -18],
    puntoEntrada: [-2, 0, -13],
    radio: 4.8,
    radioSolido: 3.0,
    tipo: "2D",
    icon: DiceFiveIcon,
  },
  {
    id: "arena",
    nombre: "Arena",
    ruta: "/estudiante/duelo",
    descripcion: "Duelo de saberes en el coliseo",
    frase: "Reta tus conocimientos en la arena",
    seccion: "refuerzo",
    color: "#FF8A73",
    posicion: [-2, 0, 18],
    puntoEntrada: [-2, 0, 12.8],
    radio: 5.2,
    radioSolido: 3.5,
    tipo: "2D",
    icon: SwordIcon,
  },
];

export const RADIO_MUNDO_MAX = 31;
export const RIO_X_MIN = 6.0;
export const RIO_X_MAX = 10.0;
export const PUENTE_Z_MIN = -3.0;
export const PUENTE_Z_MAX = 3.0;

export const CLAVE_LOCALSTORAGE_ULTIMO_LUGAR = "edunova-valle-ultimo-lugar";
export const CLAVE_LOCALSTORAGE_CALIDAD = "edunova-valle-calidad";
export const CLAVE_LOCALSTORAGE_PREGUNTAS_RESUELTAS = "edunova-valle-preguntas-resueltas";

export type PersonajeGuiaId = "elena" | "mateo" | "vega";

export interface PersonajeGuiaDef {
  id: PersonajeGuiaId;
  nombre: string;
  rol: string;
  lugarId: LugarValleId;
  posicion: [number, number, number];
  saludo: string;
}

export const PERSONAJES_GUIA: PersonajeGuiaDef[] = [
  {
    id: "elena",
    nombre: "Maestra Elena",
    rol: "Guía de la Escuela",
    lugarId: "escuela",
    posicion: [-12.0, 0, -8.0],
    saludo: "¡Hola, explorador! Las lecciones del aula están listas para ti.",
  },
  {
    id: "mateo",
    nombre: "Sabio Mateo",
    rol: "Guía de Tu Casa",
    lugarId: "casa",
    posicion: [13.5, 0, -8.5],
    saludo: "¡Bienvenido! En casa guardamos los saberes y tradiciones de la familia.",
  },
  {
    id: "vega",
    nombre: "Astrónoma Vega",
    rol: "Guía del Observatorio",
    lugarId: "observatorio",
    posicion: [-14.5, 0.4, 9.5],
    saludo: "¡Saludos, cadete estelar! El telescopio apunta hacia nuevos mundos.",
  },
];

export type ClimaHora = "dia" | "atardecer" | "noche";
export type CalidadGrafica = "alta" | "ligera";

/** Comprueba colisiones con edificios, río (salvo el puente) y límites del valle */
export function validarMovimiento(
  nuevoX: number,
  nuevoZ: number,
  actualX: number,
): [number, number] {
  // Límite de las montañas
  const distCentro = Math.hypot(nuevoX, nuevoZ);
  if (distCentro > RADIO_MUNDO_MAX) {
    const factor = RADIO_MUNDO_MAX / distCentro;
    nuevoX *= factor;
    nuevoZ *= factor;
  }

  // Colisión con agua profunda del río (x entre 6 y 10), permitiendo cruzar por el puente (|z| <= 3.0)
  const cruzaRio = nuevoX >= RIO_X_MIN && nuevoX <= RIO_X_MAX;
  const enPuente = nuevoZ >= PUENTE_Z_MIN && nuevoZ <= PUENTE_Z_MAX;

  if (cruzaRio && !enPuente) {
    // Si venía del oeste (x < 6), no cruzar a la derecha
    if (actualX < RIO_X_MIN) {
      nuevoX = Math.min(nuevoX, RIO_X_MIN - 0.1);
    } else if (actualX > RIO_X_MAX) {
      // Si venía del este (x > 10), no cruzar a la izquierda
      nuevoX = Math.max(nuevoX, RIO_X_MAX + 0.1);
    } else {
      // Estaba cerca del borde, deslizar a lo largo de Z o frenar
      nuevoX = actualX;
    }
  }

  // Colisión con edificios
  for (const lugar of LUGARES_VALLE) {
    const dx = nuevoX - lugar.posicion[0];
    const dz = nuevoZ - lugar.posicion[2];
    const dist = Math.hypot(dx, dz);
    if (dist < lugar.radioSolido && dist > 0.001) {
      // Empujar suavemente hacia afuera del radio sólido
      const ang = Math.atan2(dz, dx);
      nuevoX = lugar.posicion[0] + Math.cos(ang) * lugar.radioSolido;
      nuevoZ = lugar.posicion[2] + Math.sin(ang) * lugar.radioSolido;
    }
  }

  return [nuevoX, nuevoZ];
}

