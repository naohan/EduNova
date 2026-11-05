import type { AgeTier } from "@/lib/api/edunova-contract";

export type IdPlaneta = "mercurio" | "venus" | "tierra" | "marte" | "jupiter" | "saturno" | "urano" | "neptuno";

export type PlanetaJuego = {
  id: IdPlaneta;
  nombre: string;
  color: string;
  radio: number;
  orbita: number;
  angulo: number;
  pistas: Record<AgeTier, string>;
  dato: string;
};

/** En orden desde el Sol. Tamaños y distancias están ajustados para jugar, no a escala. */
export const PLANETAS: PlanetaJuego[] = [
  {
    id: "mercurio",
    nombre: "Mercurio",
    color: "#A8A29E",
    radio: 1.1,
    orbita: 11,
    angulo: 0.6,
    pistas: {
      EXPLORADOR_7_9: "Vuela al planeta más cercano al Sol.",
      AVENTURERO_10_12: "Soy el planeta más pequeño y el más cercano al Sol.",
      CREADOR_13_15: "Mi año dura solo 88 días terrestres.",
    },
    dato: "Es el planeta más pequeño del Sistema Solar.",
  },
  {
    id: "venus",
    nombre: "Venus",
    color: "#F2C879",
    radio: 1.6,
    orbita: 17,
    angulo: 2.9,
    pistas: {
      EXPLORADOR_7_9: "Vuela al planeta más caliente.",
      AVENTURERO_10_12: "Soy el planeta más caliente, aunque no el más cercano al Sol.",
      CREADOR_13_15: "Mi atmósfera densa causa el efecto invernadero más fuerte del Sistema Solar.",
    },
    dato: "Es el planeta más caliente, por su atmósfera tan densa.",
  },
  {
    id: "tierra",
    nombre: "Tierra",
    color: "#2F7DE1",
    radio: 1.7,
    orbita: 23,
    angulo: 4.6,
    pistas: {
      EXPLORADOR_7_9: "Vuela a nuestro planeta azul.",
      AVENTURERO_10_12: "Soy el único planeta con vida conocida.",
      CREADOR_13_15: "El 71 % de mi superficie está cubierta de agua.",
    },
    dato: "Es nuestro hogar y el único planeta con vida conocida.",
  },
  {
    id: "marte",
    nombre: "Marte",
    color: "#D1512D",
    radio: 1.3,
    orbita: 29,
    angulo: 1.4,
    pistas: {
      EXPLORADOR_7_9: "Vuela al planeta rojo.",
      AVENTURERO_10_12: "Me veo rojo por el óxido de hierro de mi suelo.",
      CREADOR_13_15: "Tengo el volcán más alto conocido del Sistema Solar: el Olympus Mons.",
    },
    dato: "Se ve rojo por el óxido de hierro de su suelo.",
  },
  {
    id: "jupiter",
    nombre: "Júpiter",
    color: "#D9A066",
    radio: 3.4,
    orbita: 38,
    angulo: 3.6,
    pistas: {
      EXPLORADOR_7_9: "Vuela al planeta más grande de todos.",
      AVENTURERO_10_12: "Soy un gigante gaseoso con una gran mancha roja.",
      CREADOR_13_15: "Mi masa es mayor que la de todos los demás planetas juntos.",
    },
    dato: "Es el planeta más grande del Sistema Solar.",
  },
  {
    id: "saturno",
    nombre: "Saturno",
    color: "#E8D7A0",
    radio: 2.9,
    orbita: 47,
    angulo: 5.4,
    pistas: {
      EXPLORADOR_7_9: "Vuela al planeta de los grandes anillos.",
      AVENTURERO_10_12: "Mis anillos de hielo y roca son los más visibles.",
      CREADOR_13_15: "Mi densidad media es menor que la del agua.",
    },
    dato: "Sus anillos están hechos de hielo y roca.",
  },
  {
    id: "urano",
    nombre: "Urano",
    color: "#7FDBE6",
    radio: 2.2,
    orbita: 55,
    angulo: 0.2,
    pistas: {
      EXPLORADOR_7_9: "Vuela al planeta que gira de lado.",
      AVENTURERO_10_12: "Giro casi acostado, muy inclinado.",
      CREADOR_13_15: "Mi eje está inclinado unos 98 grados.",
    },
    dato: "Gira casi de lado, como una pelota que rueda.",
  },
  {
    id: "neptuno",
    nombre: "Neptuno",
    color: "#3A5FCD",
    radio: 2.1,
    orbita: 62,
    angulo: 2.2,
    pistas: {
      EXPLORADOR_7_9: "Vuela al planeta más lejano del Sol.",
      AVENTURERO_10_12: "Soy el planeta más lejano del Sol.",
      CREADOR_13_15: "Tengo los vientos más rápidos del Sistema Solar.",
    },
    dato: "Es el planeta más lejano del Sol.",
  },
];

export const posicionDe = (p: PlanetaJuego): [number, number] => [
  Math.cos(p.angulo) * p.orbita,
  Math.sin(p.angulo) * p.orbita,
];

export const LIMITE_MUNDO = 70;
export const RADIO_SOL = 5;

export type ConfigPiloto = {
  rondas: number;
  etiquetas: boolean;
  flecha: boolean;
  asteroides: number;
  velocidad: number;
  vozAutomatica: boolean;
};

/** Modo Camaleón: la misma misión, con más ayuda para los más pequeños. */
export const CONFIG_PILOTO: Record<AgeTier, ConfigPiloto> = {
  EXPLORADOR_7_9: { rondas: 3, etiquetas: true, flecha: true, asteroides: 0, velocidad: 11, vozAutomatica: true },
  AVENTURERO_10_12: { rondas: 5, etiquetas: true, flecha: false, asteroides: 8, velocidad: 14, vozAutomatica: false },
  CREADOR_13_15: { rondas: 5, etiquetas: false, flecha: false, asteroides: 16, velocidad: 17, vozAutomatica: false },
};

export const PLANETAS_ORDENA: Record<AgeTier, IdPlaneta[]> = {
  EXPLORADOR_7_9: ["mercurio", "venus", "tierra", "marte"],
  AVENTURERO_10_12: PLANETAS.map((p) => p.id),
  CREADOR_13_15: PLANETAS.map((p) => p.id),
};
