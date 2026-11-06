import type { ComponentType } from "react";
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

/** Zona que el explorador no puede pisar. El centro se mide desde la posición del lugar. */
export type SolidoLugar =
  | { forma: "caja"; mediaX: number; mediaZ: number; centroX?: number; centroZ?: number }
  | { forma: "circulo"; radio: number };

export interface LugarValle {
  id: LugarValleId;
  nombre: string;
  ruta: string;
  descripcion: string;
  frase: string;
  seccion: SeccionLugar;
  color: string;
  /** Color oscuro y fondo claro del cartel, de la paleta de cada sección. */
  colorBorde: string;
  colorFondo: string;
  posicion: [number, number, number];
  puntoEntrada: [number, number, number];
  /** Altura del cartel sobre el suelo. */
  alturaCartel: number;
  /** Desde esta distancia aparece la tarjeta para entrar. */
  radio: number;
  solido: SolidoLugar;
  icon: ComponentType<{ className?: string; weight?: "bold" | "regular" | "fill" | "duotone" }>;
}

// Todos los lugares están al norte y sus fachadas miran al sur, hacia la cámara: como en un escenario,
// ningún edificio queda entre la cámara y el explorador cuando se acerca a su puerta.
export const LUGARES_VALLE: LugarValle[] = [
  {
    id: "escuela",
    nombre: "Escuela",
    ruta: "/estudiante/unidades",
    descripcion: "Lecciones y unidades de tu clase",
    frase: "Repasa las lecciones de tu clase",
    seccion: "explorar",
    color: "#4C9EFF",
    colorBorde: "#2472CC",
    colorFondo: "#E6F2FF",
    posicion: [-14.5, 0, -11],
    puntoEntrada: [-14.5, 0, -4.4],
    alturaCartel: 11.2,
    radio: 7.2,
    solido: { forma: "caja", mediaX: 4.1, mediaZ: 4.2, centroZ: 0.9 },
    icon: BookOpenIcon,
  },
  {
    id: "casa",
    nombre: "Tu casa",
    ruta: "/estudiante/unidades",
    descripcion: "Lecciones y saberes de tu familia",
    frase: "Descubre los saberes de tu familia",
    seccion: "cooperar",
    color: "#2DBE70",
    colorBorde: "#1B8A4F",
    colorFondo: "#E3F8EC",
    posicion: [15.5, 0, -13],
    puntoEntrada: [14.2, 0, -8.5],
    alturaCartel: 7.4,
    radio: 6.2,
    solido: { forma: "caja", mediaX: 5, mediaZ: 3.2, centroX: 1.7 },
    icon: HouseIcon,
  },
  {
    id: "observatorio",
    nombre: "Observatorio",
    ruta: "/estudiante/aventuras/piloto",
    descripcion: "Pilota tu nave por el Sistema Solar",
    frase: "Viaja entre los planetas",
    seccion: "magia",
    color: "#5636D9",
    colorBorde: "#3B229D",
    colorFondo: "#F2EEFF",
    posicion: [-23, 1.3, 1],
    puntoEntrada: [-19.6, 0.9, 4.4],
    alturaCartel: 9.4,
    radio: 5.8,
    solido: { forma: "circulo", radio: 3.9 },
    icon: PlanetIcon,
  },
  {
    id: "consultorio",
    nombre: "Consultorio",
    ruta: "/estudiante/aventuras/doctor",
    descripcion: "Investiga órganos y resuelve casos",
    frase: "Examina a tus pacientes",
    seccion: "cooperar",
    color: "#25CFE0",
    colorBorde: "#1B8A4F",
    colorFondo: "#E3F8EC",
    posicion: [20, 0, 0.5],
    puntoEntrada: [20, 0, 5.8],
    alturaCartel: 7.2,
    radio: 6.6,
    solido: { forma: "caja", mediaX: 3.7, mediaZ: 3.5, centroZ: 0.3 },
    icon: HeartIcon,
  },
  {
    id: "dado",
    nombre: "Plaza del dado",
    ruta: "/estudiante/juegos",
    descripcion: "Juego de tablero con dados",
    frase: "Lanza el dado y avanza",
    seccion: "juego",
    color: "#FFC928",
    colorBorde: "#C98F00",
    colorFondo: "#FFF6D6",
    posicion: [-3, 0, -5.5],
    puntoEntrada: [-3, 0, 0.4],
    alturaCartel: 5.2,
    radio: 6.6,
    solido: { forma: "circulo", radio: 5.1 },
    icon: DiceFiveIcon,
  },
  {
    id: "arena",
    nombre: "Arena",
    ruta: "/estudiante/duelo",
    descripcion: "Duelo de saberes en el coliseo",
    frase: "Reta a un compañero",
    seccion: "refuerzo",
    color: "#FF8A73",
    colorBorde: "#D9583F",
    colorFondo: "#FFEDE8",
    posicion: [-3, 0, -20.5],
    puntoEntrada: [-3, 0, -13.6],
    alturaCartel: 8.8,
    radio: 7.8,
    solido: { forma: "circulo", radio: 6 },
    icon: SwordIcon,
  },
];

export const INICIO_JUGADOR: [number, number, number] = [0, 0, 7];

export const RADIO_MUNDO_MAX = 31;

// El agua se ve hasta unas 2 unidades del centro del río; la franja de arena también detiene al explorador.
export const RIO_X = 8;
export const RIO_X_MIN = 5.3;
export const RIO_X_MAX = 10.7;
/** Paso libre entre las barandas del puente. */
export const PUENTE_MEDIO_ANCHO = 1.4;
export const ALTURA_TABLERO = 0.36;

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
  invitacion: string;
}

export const PERSONAJES_GUIA: PersonajeGuiaDef[] = [
  {
    id: "elena",
    nombre: "Maestra Elena",
    rol: "Escuela",
    lugarId: "escuela",
    posicion: [-9.6, 0, -3.6],
    saludo: "¡Hola! Tengo una pregunta para ti.",
    invitacion: "Entra a la Escuela y repasa tus lecciones.",
  },
  {
    id: "mateo",
    nombre: "Sabio Mateo",
    rol: "Tu casa",
    lugarId: "casa",
    posicion: [12.4, 0, -6.6],
    saludo: "¡Bienvenido! Veamos lo que aprendiste en casa.",
    invitacion: "Entra a Tu casa y mira los saberes de tu familia.",
  },
  {
    id: "vega",
    nombre: "Astrónoma Vega",
    rol: "Observatorio",
    lugarId: "observatorio",
    posicion: [-15.6, 0, 7.4],
    saludo: "¡Saludos, cadete! Mira esta pregunta del espacio.",
    invitacion: "Entra al Observatorio y pilota tu nave.",
  },
];

export type ClimaHora = "dia" | "atardecer" | "noche";
export type CalidadGrafica = "alta" | "ligera";

const entre = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Altura determinista del relieve: valle casi plano, colina del observatorio y cordillera. */
export function calcularAlturaTerreno(x: number, z: number): number {
  const r = Math.hypot(x, z);
  let h = Math.sin(x * 0.21) * Math.cos(z * 0.17) * 0.05;

  const montana = entre(27, 47, r);
  if (montana > 0) {
    const angulo = Math.atan2(z, x);
    const crestas = Math.abs(Math.sin(angulo * 3 + 1.1)) * 5 + Math.abs(Math.sin(angulo * 7 + 0.4)) * 2.6;
    const ruido = Math.sin(x * 0.19) * Math.cos(z * 0.16) * 2.4 + Math.sin(x * 0.41 + 1.2) * Math.sin(z * 0.37) * 1.1;
    h += montana * (9 + crestas + ruido);
  }

  const distColina = Math.hypot(x + 23, z - 1);
  if (distColina < 9) h += Math.cos((distColina / 9) * (Math.PI / 2)) * 1.35;

  // El cauce se va cerrando al llegar a la montaña, donde nace el río.
  const distRio = Math.abs(x - RIO_X);
  if (distRio < 3.2) h -= (1 - distRio / 3.2) * 1.1 * (1 - entre(26, 34, r));

  return h;
}

/** Altura donde pisa el explorador: igual al terreno, salvo sobre el puente y sus rampas. */
export function alturaSuelo(x: number, z: number): number {
  const terreno = calcularAlturaTerreno(x, z);
  if (Math.abs(z) > PUENTE_MEDIO_ANCHO + 0.4) return terreno;
  const dist = Math.abs(x - RIO_X);
  if (dist <= 3) return ALTURA_TABLERO;
  if (dist < 4) return ALTURA_TABLERO + (terreno - ALTURA_TABLERO) * (dist - 3);
  return terreno;
}

const enRio = (x: number, z: number) => x >= RIO_X_MIN && x <= RIO_X_MAX && Math.abs(z) > PUENTE_MEDIO_ANCHO;

/** Empuja un punto fuera de la zona sólida de un lugar. */
function salirDe(lugar: LugarValle, x: number, z: number): [number, number] {
  const [px, , pz] = lugar.posicion;
  if (lugar.solido.forma === "circulo") {
    const dx = x - px;
    const dz = z - pz;
    const dist = Math.hypot(dx, dz);
    if (dist >= lugar.solido.radio || dist < 0.001) return [x, z];
    return [px + (dx / dist) * lugar.solido.radio, pz + (dz / dist) * lugar.solido.radio];
  }
  const { mediaX, mediaZ, centroX = 0, centroZ = 0 } = lugar.solido;
  const dx = x - (px + centroX);
  const dz = z - (pz + centroZ);
  const sobraX = mediaX - Math.abs(dx);
  const sobraZ = mediaZ - Math.abs(dz);
  if (sobraX <= 0 || sobraZ <= 0) return [x, z];
  return sobraX < sobraZ ? [x + Math.sign(dx || 1) * sobraX, z] : [x, z + Math.sign(dz || 1) * sobraZ];
}

/** Comprueba colisiones con edificios, personajes, río (salvo el puente) y límites del valle. */
export function validarMovimiento(
  nuevoX: number,
  nuevoZ: number,
  actualX: number,
  actualZ: number,
): [number, number] {
  let x = nuevoX;
  let z = nuevoZ;

  const distCentro = Math.hypot(x, z);
  if (distCentro > RADIO_MUNDO_MAX) {
    x *= RADIO_MUNDO_MAX / distCentro;
    z *= RADIO_MUNDO_MAX / distCentro;
  }

  // Contra el río se resbala por la orilla en vez de frenar en seco.
  if (enRio(x, z)) {
    if (!enRio(actualX, z)) x = actualX;
    else if (!enRio(x, actualZ)) z = actualZ;
    else return [actualX, actualZ];
  }

  for (const lugar of LUGARES_VALLE) [x, z] = salirDe(lugar, x, z);

  for (const guia of PERSONAJES_GUIA) {
    const dx = x - guia.posicion[0];
    const dz = z - guia.posicion[2];
    const dist = Math.hypot(dx, dz);
    if (dist < 0.7 && dist > 0.001) {
      x = guia.posicion[0] + (dx / dist) * 0.7;
      z = guia.posicion[2] + (dz / dist) * 0.7;
    }
  }

  return [x, z];
}

/** Corrige un toque para que el destino se pueda pisar: fuera del agua, de los edificios y del borde. */
export function destinoAlcanzable(x: number, z: number): [number, number] {
  let dx = x;
  let dz = z;
  const dist = Math.hypot(dx, dz);
  if (dist > RADIO_MUNDO_MAX) {
    dx *= RADIO_MUNDO_MAX / dist;
    dz *= RADIO_MUNDO_MAX / dist;
  }
  if (enRio(dx, dz)) dx = dx < RIO_X ? RIO_X_MIN - 0.2 : RIO_X_MAX + 0.2;
  for (const lugar of LUGARES_VALLE) [dx, dz] = salirDe(lugar, dx, dz);
  return [dx, dz];
}

/** A dónde caminar ahora: si el destino está al otro lado del río, primero se va al puente. */
export function siguientePunto(x: number, z: number, objetivoX: number, objetivoZ: number): [number, number] {
  const ladoJugador = x < RIO_X ? -1 : 1;
  const ladoObjetivo = objetivoX < RIO_X ? -1 : 1;
  if (ladoJugador === ladoObjetivo) return [objetivoX, objetivoZ];

  const fueraDelCauce = x < RIO_X_MIN || x > RIO_X_MAX;
  if (fueraDelCauce && Math.abs(z) > 0.6) return [ladoJugador < 0 ? RIO_X_MIN - 0.3 : RIO_X_MAX + 0.3, 0];
  return [ladoJugador < 0 ? RIO_X_MAX + 0.6 : RIO_X_MIN - 0.6, 0];
}

// Senderos como curvas: origen, punto de control y destino, en coordenadas X y Z.
const CENTRO: [number, number] = [0, 4];
const PUENTE_OESTE: [number, number] = [4.6, 0];
const PUENTE_ESTE: [number, number] = [11.4, 0];
const TRAMOS: [number, number, number, number, number, number][] = [
  [...CENTRO, -8, 3, -14.5, -4.4],
  [...CENTRO, -1, 2.4, -3, 0.4],
  [...CENTRO, 7.4, -6, -3, -13.6],
  [...CENTRO, -10, 7.5, -19.6, 4.4],
  [...CENTRO, 3, 2.4, ...PUENTE_OESTE],
  [0, 7, 0, 5.5, ...CENTRO],
  [...PUENTE_ESTE, 13, -3, 14.2, -8.5],
  [...PUENTE_ESTE, 16, 1.5, 20, 5.8],
];

/** Puntos de cada sendero, ya muestreados, para pintarlos y para saber qué no debe taparlos. */
export const SENDEROS: [number, number][][] = TRAMOS.map(([ax, az, cx, cz, bx, bz]) => {
  const puntos: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const u = 1 - t;
    puntos.push([u * u * ax + 2 * u * t * cx + t * t * bx, u * u * az + 2 * u * t * cz + t * t * bz]);
  }
  return puntos;
});

export const FAROLES: [number, number][] = [
  [-5, 1.6],
  [-10.8, -2.2],
  [4.6, -7],
  [-11, 7],
  [3.2, 3.2],
  [12.2, -3.6],
  [14.6, 3.2],
  [1.6, -11.4],
];

/** Distancia al sendero más cercano; sirve para no plantar árboles encima. */
export function distanciaASendero(x: number, z: number) {
  let minima = Infinity;
  for (const sendero of SENDEROS) {
    for (const [px, pz] of sendero) minima = Math.min(minima, Math.hypot(x - px, z - pz));
  }
  return minima;
}

/** Indica si en este punto se puede poner vegetación sin tapar edificios, puertas ni personajes. */
export function hayEspacioLibre(x: number, z: number, margen: number) {
  if (Math.abs(x - RIO_X) < 3.4) return false;
  for (const lugar of LUGARES_VALLE) {
    const [px, , pz] = lugar.posicion;
    if (lugar.solido.forma === "circulo") {
      if (Math.hypot(x - px, z - pz) < lugar.solido.radio + margen) return false;
    } else {
      const { mediaX, mediaZ, centroX = 0, centroZ = 0 } = lugar.solido;
      if (Math.abs(x - px - centroX) < mediaX + margen && Math.abs(z - pz - centroZ) < mediaZ + margen) return false;
    }
    if (Math.hypot(x - lugar.puntoEntrada[0], z - lugar.puntoEntrada[2]) < 2.6) return false;
  }
  for (const guia of PERSONAJES_GUIA) {
    if (Math.hypot(x - guia.posicion[0], z - guia.posicion[2]) < 2) return false;
  }
  return true;
}
