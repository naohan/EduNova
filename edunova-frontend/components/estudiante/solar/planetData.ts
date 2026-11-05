/** Datos educativos adaptados del simulador Three.js (Ozymandros/solar-system). */

export type PlanetId =
  | "sol"
  | "mercurio"
  | "venus"
  | "tierra"
  | "marte"
  | "jupiter"
  | "saturno"
  | "urano"
  | "neptuno";

export interface PlanetBody {
  id: PlanetId;
  name: string;
  /** Color hex Three.js */
  color: number;
  /** Radio visual en escena */
  radius: number;
  /** Distancia orbital visual */
  orbit: number;
  /** Velocidad orbital relativa */
  speed: number;
  info: {
    tipo: string;
    diametro: string;
    distancia: string;
    temperatura: string;
    lunas: string;
    dato: string;
  };
}

export const SOLAR_BODIES: PlanetBody[] = [
  {
    id: "sol",
    name: "Sol",
    color: 0xfdb813,
    radius: 2.4,
    orbit: 0,
    speed: 0,
    info: {
      tipo: "Estrella (secuencia principal G)",
      diametro: "1 392 700 km",
      distancia: "Centro del Sistema Solar",
      temperatura: "5 500 °C (fotosfera)",
      lunas: "No tiene",
      dato: "Contiene el 99,86 % de toda la masa del Sistema Solar.",
    },
  },
  {
    id: "mercurio",
    name: "Mercurio",
    color: 0xaaaaaa,
    radius: 0.28,
    orbit: 5.2,
    speed: 1.6,
    info: {
      tipo: "Planeta terrestre",
      diametro: "4 879 km",
      distancia: "57,9 millones km (0,39 UA)",
      temperatura: "-180 °C a 430 °C",
      lunas: "0",
      dato: "Aunque es el más cercano al Sol, Venus es más caliente por su atmósfera.",
    },
  },
  {
    id: "venus",
    name: "Venus",
    color: 0xffcc88,
    radius: 0.42,
    orbit: 7.2,
    speed: 1.2,
    info: {
      tipo: "Planeta terrestre",
      diametro: "12 104 km",
      distancia: "108,2 millones km (0,72 UA)",
      temperatura: "462 °C (promedio)",
      lunas: "0",
      dato: "Gira al revés (retrógrado): el Sol sale por el oeste.",
    },
  },
  {
    id: "tierra",
    name: "Tierra",
    color: 0x2266cc,
    radius: 0.45,
    orbit: 9.5,
    speed: 1.0,
    info: {
      tipo: "Planeta terrestre",
      diametro: "12 742 km",
      distancia: "149,6 millones km (1 UA)",
      temperatura: "-89 °C a 57 °C",
      lunas: "1 (Luna)",
      dato: "Es el único planeta conocido con vida. El 71 % de su superficie es agua.",
    },
  },
  {
    id: "marte",
    name: "Marte",
    color: 0xcc4422,
    radius: 0.35,
    orbit: 12,
    speed: 0.8,
    info: {
      tipo: "Planeta terrestre",
      diametro: "6 779 km",
      distancia: "227,9 millones km (1,52 UA)",
      temperatura: "-125 °C a 20 °C",
      lunas: "2 (Fobos y Deimos)",
      dato: "Se llama el planeta rojo por el óxido de hierro de su superficie.",
    },
  },
  {
    id: "jupiter",
    name: "Júpiter",
    color: 0xddbb88,
    radius: 1.35,
    orbit: 17,
    speed: 0.45,
    info: {
      tipo: "Gigante gaseoso",
      diametro: "139 820 km",
      distancia: "778,5 millones km (5,2 UA)",
      temperatura: "-110 °C (nubes)",
      lunas: "95+",
      dato: "Es el planeta más grande. Su Gran Mancha Roja es una tormenta gigante.",
    },
  },
  {
    id: "saturno",
    name: "Saturno",
    color: 0xeeddaa,
    radius: 1.15,
    orbit: 22,
    speed: 0.32,
    info: {
      tipo: "Gigante gaseoso",
      diametro: "116 460 km",
      distancia: "1 434 millones km (9,5 UA)",
      temperatura: "-140 °C",
      lunas: "146+",
      dato: "Sus anillos están hechos sobre todo de hielo y polvo.",
    },
  },
  {
    id: "urano",
    name: "Urano",
    color: 0x66ccff,
    radius: 0.75,
    orbit: 27,
    speed: 0.22,
    info: {
      tipo: "Gigante de hielo",
      diametro: "50 724 km",
      distancia: "2 871 millones km (19,2 UA)",
      temperatura: "-195 °C",
      lunas: "28",
      dato: "Gira de lado: su eje está inclinado unos 98°.",
    },
  },
  {
    id: "neptuno",
    name: "Neptuno",
    color: 0x3355aa,
    radius: 0.72,
    orbit: 32,
    speed: 0.18,
    info: {
      tipo: "Gigante de hielo",
      diametro: "49 244 km",
      distancia: "4 495 millones km (30,1 UA)",
      temperatura: "-200 °C",
      lunas: "16",
      dato: "Tiene los vientos más rápidos del Sistema Solar.",
    },
  },
];
