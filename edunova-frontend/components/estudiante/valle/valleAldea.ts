import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Marco, Obra, azar, type V3 } from "./valleObra";
import {
  ALTURA_TABLERO,
  FAROLES,
  LUGARES_VALLE,
  RIO_X,
  calcularAlturaTerreno,
  type LugarValleId,
} from "./valleData";

// Arquitectura del valle. Las piezas fijas de todos los edificios terminan en tres mallas: una opaca,
// una metálica y una que se enciende de noche. Solo lo que se mueve queda aparte.

const PI = Math.PI;

const PIEDRA = "#938E85";
const PIEDRA_CLARA = "#BDB6A8";
const PIEDRA_OSCURA = "#6F6A63";
const ESTUCO = "#F6ECD6";
const ESTUCO_SOMBRA = "#E4D5B6";
const MADERA = "#8A5A30";
const MADERA_OSCURA = "#55351C";
const TEJA = "#C25C37";
const TEJA_OSCURA = "#A9482A";
const TEJA_CLARA = "#D2703F";
const ORO = "#E2B93B";
const VERDE = "#3F9A4C";
const VERDE_OSCURO = "#2E7D3B";
const MENTA = "#52B788";
const LUZ_CALIDA = "#FFD27A";

export const lugar = (id: LugarValleId) => {
  const encontrado = LUGARES_VALLE.find((l) => l.id === id);
  if (!encontrado) throw new Error(`Lugar desconocido: ${id}`);
  return encontrado;
};

/** Puntos de las piezas que se animan, en coordenadas del mundo. */
const ESCUELA = lugar("escuela").posicion;
const CASA = lugar("casa").posicion;
const OBSERVATORIO = lugar("observatorio").posicion;
const CONSULTORIO = lugar("consultorio").posicion;
const PLAZA = lugar("dado").posicion;
const ARENA = lugar("arena").posicion;

const GIRO_PUERTA_OBSERVATORIO = PI / 4;

export const ANIMADOS = {
  reloj: [ESCUELA[0], 6.55, ESCUELA[2] + 0.96] as V3,
  banderin: [ESCUELA[0], 10.25, ESCUELA[2]] as V3,
  humo: [CASA[0] + 1.9, 5.8, CASA[2] - 0.9] as V3,
  cupula: [OBSERVATORIO[0], OBSERVATORIO[1] + 4.3, OBSERVATORIO[2]] as V3,
  planeta: [
    OBSERVATORIO[0] + Math.sin(GIRO_PUERTA_OBSERVATORIO) * 3.6,
    OBSERVATORIO[1] + 3.6,
    OBSERVATORIO[2] + Math.cos(GIRO_PUERTA_OBSERVATORIO) * 3.6,
  ] as V3,
  cruz: [CONSULTORIO[0] - 2.1, 2.1, CONSULTORIO[2] + 2.66] as V3,
  dado: [PLAZA[0], 2.75, PLAZA[2]] as V3,
  estandartes: [
    [ARENA[0] - 2, 4.5, ARENA[2] + 5.75],
    [ARENA[0] + 2, 4.5, ARENA[2] + 5.75],
  ] as V3[],
};

interface Obras {
  marco: Marco;
  o: Obra;
  m: Obra;
  l: Obra;
}

/** Ventana con marco, cruceta y repisa. El vidrio se enciende según la hora. */
function ventana({ marco, o, l }: Obras, ancho: number, alto: number, p: V3, rotY: number, color = LUZ_CALIDA) {
  marco.en(p, rotY, () => {
    o.caja(ancho + 0.2, alto + 0.2, 0.08, "#FFFFFF", [0, 0, 0]);
    l.caja(ancho, alto, 0.05, color, [0, 0, 0.05]);
    o.caja(0.05, alto, 0.04, "#FFFFFF", [0, 0, 0.09]);
    o.caja(ancho, 0.05, 0.04, "#FFFFFF", [0, 0, 0.09]);
    o.caja(ancho + 0.34, 0.08, 0.22, ESTUCO_SOMBRA, [0, -alto / 2 - 0.12, 0.08]);
  });
}

/** Faldón de tejas en dos aguas, fila por fila, sobre un techo con la cumbrera en X. */
function tejas(o: Obra, largo: number, mediaBase: number, alto: number, base: number, colores: string[]) {
  const filas = 7;
  const pendiente = Math.atan2(alto, mediaBase);
  const ladera = Math.hypot(alto, mediaBase);
  for (const lado of [1, -1]) {
    for (let f = 0; f < filas; f++) {
      const t = (f + 0.5) / filas;
      o.caja(largo, 0.1, ladera / filas + 0.08, colores[f % colores.length], [0, base + alto * t + 0.06, lado * mediaBase * (1 - t)], [
        lado * pendiente,
        0,
        0,
      ]);
    }
  }
}

function escuela(a: Obras) {
  const { marco, o, m, l } = a;
  marco.en(ESCUELA, 0, () => {
    // Cuerpo principal
    o.caja(7.8, 0.4, 6.4, PIEDRA, [0, 0.2, 0]);
    o.caja(7.2, 0.7, 5.8, "#CDB78D", [0, 0.75, 0]);
    o.caja(7, 2.6, 5.6, ESTUCO, [0, 2.3, 0]);
    for (const x of [-3.5, 3.5]) for (const z of [-2.8, 2.8]) o.caja(0.32, 3.1, 0.32, ESTUCO_SOMBRA, [x, 2.1, z]);
    o.caja(7.4, 0.18, 6, ESTUCO_SOMBRA, [0, 3.66, 0]);

    // Tejado a dos aguas con aleros
    o.prisma(6.6, 1.9, 7.9, ESTUCO_SOMBRA, [0, 3.72, 0], [0, PI / 2, 0]);
    tejas(o, 8.3, 3.3, 1.9, 3.72, [TEJA, TEJA_OSCURA, TEJA_CLARA]);
    o.cilindro(0.1, 0.1, 8.3, 6, TEJA_OSCURA, [0, 5.72, 0], [0, 0, PI / 2]);

    // Pórtico de entrada
    o.caja(4.8, 0.34, 2.2, PIEDRA_CLARA, [0, 0.37, 3.75]);
    o.caja(3.4, 0.16, 0.5, PIEDRA, [0, 0.26, 5.1]);
    o.caja(3.8, 0.14, 0.5, PIEDRA_OSCURA, [0, 0.1, 5.45]);
    for (const x of [-2, -0.75, 0.75, 2]) {
      o.cilindro(0.13, 0.16, 2.3, 10, "#F1E6CF", [x, 1.68, 4.55]);
      o.caja(0.42, 0.14, 0.42, ESTUCO_SOMBRA, [x, 2.85, 4.55]);
      o.caja(0.42, 0.14, 0.42, ESTUCO_SOMBRA, [x, 0.6, 4.55]);
    }
    o.caja(4.8, 0.24, 2.3, MADERA, [0, 3.02, 3.75]);
    o.prisma(5.2, 1.15, 2.7, TEJA, [0, 3.12, 3.85]);
    o.prisma(4.3, 0.85, 0.05, ESTUCO, [0, 3.18, 5.21]);
    l.cilindro(0.26, 0.26, 0.06, 16, LUZ_CALIDA, [0, 3.56, 5.25], [PI / 2, 0, 0]);

    // Puerta doble
    o.caja(2, 2.55, 0.08, "#FFFFFF", [0, 1.78, 2.84]);
    o.caja(1.76, 2.35, 0.12, MADERA_OSCURA, [0, 1.72, 2.86]);
    o.caja(0.04, 2.35, 0.14, MADERA, [0, 1.72, 2.87]);
    for (const x of [-0.2, 0.2]) m.esfera(0.06, ORO, [x, 1.62, 2.96]);

    // Ventanas con postigos
    for (const x of [-2.75, 2.75]) {
      ventana(a, 0.95, 1.35, [x, 2.5, 2.83], 0);
      for (const lado of [-0.68, 0.68]) o.caja(0.32, 1.45, 0.05, "#3E7CC8", [x + lado, 2.5, 2.88]);
      o.caja(1.3, 0.22, 0.3, MADERA_OSCURA, [x, 1.62, 2.96]);
      for (let i = 0; i < 5; i++) {
        o.esfera(0.09, i % 2 ? "#FF7D6B" : "#FFD24A", [x - 0.48 + i * 0.24, 1.8, 2.98], undefined, 0);
      }
    }
    for (const z of [-1.3, 1.3]) {
      ventana(a, 0.95, 1.35, [3.53, 2.5, z], PI / 2);
      ventana(a, 0.95, 1.35, [-3.53, 2.5, z], -PI / 2);
    }

    // Campanario con reloj
    marco.en([0, 5.4, 0], 0, () => {
      o.caja(1.85, 1.5, 1.85, ESTUCO, [0, 0.8, 0]);
      o.caja(2, 0.14, 2, ESTUCO_SOMBRA, [0, 1.6, 0]);
      for (const x of [-0.72, 0.72]) for (const z of [-0.72, 0.72]) o.caja(0.3, 1.25, 0.3, ESTUCO, [x, 2.25, z]);
      o.caja(1.5, 0.1, 1.5, PIEDRA_OSCURA, [0, 1.68, 0]);
      m.cilindro(0.15, 0.36, 0.55, 12, ORO, [0, 2.3, 0]);
      m.esfera(0.08, ORO, [0, 2.02, 0]);
      o.caja(2.05, 0.16, 2.05, ESTUCO_SOMBRA, [0, 2.92, 0]);
      o.cono(1.55, 1.55, 4, "#3E7CC8", [0, 3.76, 0], [0, PI / 4, 0]);
      m.esfera(0.13, ORO, [0, 4.6, 0]);
      m.cilindro(0.03, 0.03, 0.75, 6, ORO, [0, 4.95, 0]);
      o.cilindro(0.52, 0.52, 0.06, 28, "#FFFFFF", [0, 1.15, 0.94], [PI / 2, 0, 0]);
      m.aro(0.52, 0.045, ORO, [0, 1.15, 0.97]);
    });

    // Setos a los costados del pórtico
    for (const x of [-3.4, 3.4]) {
      o.esfera(0.62, VERDE_OSCURO, [x, 0.5, 3.7], [1.5, 0.85, 0.9]);
      o.esfera(0.5, VERDE, [x + 0.3, 0.72, 3.9], [1.2, 0.8, 0.8]);
    }
  });
}

function casa(a: Obras) {
  const { marco, o, m, l } = a;
  marco.en(CASA, 0, () => {
    // Zócalo de piedra
    o.caja(6, 0.85, 5, PIEDRA_OSCURA, [0, 0.42, 0]);
    for (let i = 0; i < 26; i++) {
      const frente = i < 16;
      const x = frente ? -2.9 + (i / 15) * 5.8 : 3 + 0.02;
      const z = frente ? 2.52 : -2.3 + ((i - 16) / 9) * 4.6;
      const tono = azar(i, 40) > 0.5 ? PIEDRA : PIEDRA_CLARA;
      o.esfera(0.2 + azar(i, 41) * 0.1, tono, [x, 0.2 + azar(i, 42) * 0.46, z], [1.3, 0.8, 0.5], 0);
    }

    // Muros de adobe con vigas a la vista
    o.caja(5.6, 2.3, 4.6, "#F0E2C9", [0, 2, 0]);
    for (const x of [-2.75, 2.75]) for (const z of [-2.25, 2.25]) o.caja(0.24, 2.35, 0.24, MADERA_OSCURA, [x, 2, z]);
    for (const y of [0.92, 3.1]) {
      o.caja(5.76, 0.2, 0.2, MADERA_OSCURA, [0, y, 2.33]);
      o.caja(0.2, 0.2, 4.76, MADERA_OSCURA, [2.83, y, 0]);
      o.caja(0.2, 0.2, 4.76, MADERA_OSCURA, [-2.83, y, 0]);
    }
    o.caja(0.16, 2.6, 0.12, MADERA_OSCURA, [0.1, 2, 2.34], [0, 0, 0.62]);

    // Techo inclinado de tablas
    o.prisma(5.8, 2.1, 6, "#E2D2B5", [0, 3.2, 0], [0, PI / 2, 0]);
    tejas(o, 7.2, 2.9, 2.1, 3.2, ["#7A4A26", "#6B3F1F", "#8A5630"]);
    o.cilindro(0.11, 0.11, 7.2, 6, "#5A341A", [0, 5.34, 0], [0, 0, PI / 2]);

    // Chimenea de ladrillo
    o.caja(0.85, 3.2, 0.85, "#A84E32", [1.9, 4.1, -0.9]);
    for (let i = 0; i < 6; i++) o.caja(0.88, 0.05, 0.88, "#7F3820", [1.9, 3.4 + i * 0.4, -0.9]);
    o.caja(1.05, 0.16, 1.05, "#7F3820", [1.9, 5.75, -0.9]);

    // Puerta con alero
    o.caja(1.7, 0.26, 0.9, PIEDRA, [-1.3, 0.13, 3]);
    o.caja(1.5, 0.26, 0.6, PIEDRA_CLARA, [-1.3, 0.4, 2.76]);
    o.caja(1.25, 2.1, 0.1, "#5A341A", [-1.3, 1.92, 2.35]);
    o.caja(1.5, 0.16, 0.14, MADERA_OSCURA, [-1.3, 3.02, 2.36]);
    for (let i = 0; i < 4; i++) o.caja(0.04, 2.1, 0.12, "#472813", [-1.72 + i * 0.28, 1.92, 2.36]);
    m.esfera(0.06, ORO, [-0.85, 1.85, 2.44]);
    o.prisma(1.9, 0.5, 1.1, TEJA, [-1.3, 3.08, 2.75]);
    for (const x of [-2, -0.6]) o.caja(0.1, 2.5, 0.1, MADERA_OSCURA, [x, 1.9, 3.2]);

    // Ventana con jardinera florida
    ventana(a, 1.15, 1.05, [1.3, 2.05, 2.33], 0);
    o.caja(1.45, 0.24, 0.36, MADERA, [1.3, 1.3, 2.5]);
    for (let i = 0; i < 7; i++) {
      o.esfera(0.1, ["#FF7D6B", "#FFD24A", "#E05CA6"][i % 3], [0.72 + i * 0.2, 1.5 + azar(i, 44) * 0.08, 2.52], undefined, 0);
    }
    ventana(a, 0.9, 0.9, [2.83, 2.05, 0.8], PI / 2);
    ventana(a, 0.9, 0.9, [-2.83, 2.05, 0], -PI / 2);

    // Huerto cercado
    marco.en([5.05, 0, 0], 0, () => {
      o.caja(3.2, 0.12, 4.4, "#6B4A2E", [0, 0.07, 0]);
      for (let f = 0; f < 3; f++) {
        for (let i = 0; i < 6; i++) {
          const x = -1 + f;
          const z = -1.75 + i * 0.7;
          if (f === 1) o.esfera(0.2, "#E9863A", [x, 0.28, z], [1.1, 0.8, 1.1]);
          else o.cono(0.2, 0.55 + azar(i + f * 6, 46) * 0.2, 5, f ? VERDE_OSCURO : VERDE, [x, 0.42, z]);
        }
      }
      for (let i = 0; i <= 8; i++) {
        const z = -2.4 + i * 0.6;
        o.caja(0.09, 0.85, 0.09, "#D7C9B1", [1.75, 0.42, z]);
        o.caja(0.09, 0.85, 0.09, "#D7C9B1", [-1.75, 0.42, z]);
      }
      for (let i = 0; i <= 6; i++) {
        const x = -1.75 + i * 0.58;
        o.caja(0.09, 0.85, 0.09, "#D7C9B1", [x, 0.42, 2.4]);
        o.caja(0.09, 0.85, 0.09, "#D7C9B1", [x, 0.42, -2.4]);
      }
      for (const y of [0.32, 0.64]) {
        o.caja(3.6, 0.06, 0.05, "#C8B89E", [0, y, 2.4]);
        o.caja(3.6, 0.06, 0.05, "#C8B89E", [0, y, -2.4]);
        o.caja(0.05, 0.06, 4.9, "#C8B89E", [1.75, y, 0]);
      }
    });

    l.caja(0.26, 0.3, 0.26, LUZ_CALIDA, [-0.3, 2.65, 2.5]);
  });
}

function observatorio(a: Obras) {
  const { marco, o, m, l } = a;
  marco.en(OBSERVATORIO, 0, () => {
    o.cilindro(3.5, 3.75, 0.8, 26, PIEDRA_OSCURA, [0, 0.2, 0]);
    o.cilindro(2.9, 3.1, 3.5, 26, "#ECE8F4", [0, 2.35, 0]);
    for (const y of [1.3, 2.95]) o.cilindro(3.05, 3.05, 0.14, 26, "#BBB3CF", [0, y, 0]);
    o.cilindro(3.18, 3.18, 0.28, 26, "#8F88A8", [0, 4.14, 0]);

    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * PI * 2 + 0.3;
      marco.en([Math.sin(ang) * 3.05, 0, Math.cos(ang) * 3.05], ang, () => {
        o.caja(0.34, 3.5, 0.3, "#D6D0E2", [0, 2.35, 0]);
      });
    }
    for (let i = 0; i < 6; i++) {
      const ang = GIRO_PUERTA_OBSERVATORIO + 0.95 + i * 0.86;
      marco.en([Math.sin(ang) * 3.02, 0, Math.cos(ang) * 3.02], ang, () => {
        ventana(a, 0.5, 0.8, [0, 2.3, 0], 0, "#BFD4FF");
      });
    }

    // Portal hacia el sendero
    marco.en([0, 0, 0], GIRO_PUERTA_OBSERVATORIO, () => {
      o.caja(1.9, 2.8, 0.6, "#D6D0E2", [0, 1.75, 3]);
      o.caja(1.3, 2.2, 0.1, "#2E234A", [0, 1.5, 3.33]);
      o.cilindro(0.95, 0.95, 0.6, 18, "#D6D0E2", [0, 3.14, 3], [PI / 2, 0, 0], [1, 1, 0.5]);
      for (let i = 0; i < 3; i++) o.caja(2.2 - i * 0.2, 0.18, 0.5, PIEDRA, [0, 0.1 + i * 0.16, 3.85 - i * 0.34]);
      m.esfera(0.06, ORO, [0.42, 1.4, 3.42]);
    });

    o.aro(3.2, 0.05, PIEDRA_OSCURA, [0, 4.32, 0], [PI / 2, 0, 0]);
    void l;
  });
}

function consultorio(a: Obras) {
  const { marco, o, l } = a;
  marco.en(CONSULTORIO, 0, () => {
    o.caja(7.1, 0.36, 5.9, "#DCE5E2", [0, 0.18, 0]);
    o.caja(6.5, 2.8, 5.3, "#FFFFFF", [0, 1.76, 0]);
    o.caja(6.56, 0.26, 5.36, MENTA, [0, 3.06, 0]);
    o.caja(6.56, 0.26, 5.36, "#BFE8D3", [0, 0.5, 0]);

    // Techo curvo
    o.agregar(new THREE.CylinderGeometry(2.8, 2.8, 7, 26, 1, false, 0, PI), MENTA, [0, 3.18, 0], [0, 0, PI / 2], [0.62, 1, 1]);
    for (let i = 0; i < 6; i++) {
      o.agregar(new THREE.TorusGeometry(2.82, 0.05, 6, 22, PI), "#3C9C70", [-3.1 + i * 1.24, 3.18, 0], [0, PI / 2, 0], [1, 0.62, 1]);
    }

    // Marquesina y puerta de vidrio
    o.caja(3.3, 0.14, 1.5, MENTA, [0.6, 2.82, 3.3]);
    for (const x of [-0.8, 2]) o.cilindro(0.06, 0.06, 2.6, 8, "#FFFFFF", [x, 1.5, 3.9]);
    o.caja(2, 2.45, 0.08, "#DCE5E2", [0.6, 1.5, 2.67]);
    l.caja(1.74, 2.2, 0.06, "#BDEFF5", [0.6, 1.42, 2.72]);
    o.caja(0.06, 2.2, 0.1, "#DCE5E2", [0.6, 1.42, 2.74]);
    for (let i = 0; i < 2; i++) o.caja(2.4 - i * 0.3, 0.13, 0.5, "#DCE5E2", [0.6, 0.08 + i * 0.12, 3.5 - i * 0.3]);

    // Vitrales de colores
    const panes = ["#7DD3FC", "#86EFAC", "#FDE68A", "#FCA5A5", "#C4B5FD"];
    const vitral = (ancho: number) => {
      o.caja(ancho + 0.2, 1.5, 0.06, MENTA, [0, 0, 0]);
      for (let f = 0; f < 3; f++) {
        for (let c = 0; c < 3; c++) {
          l.caja(ancho / 3 - 0.04, 0.42, 0.05, panes[(f * 3 + c) % panes.length], [(c - 1) * (ancho / 3), (f - 1) * 0.45, 0.05]);
        }
      }
    };
    marco.en([2.75, 1.95, 2.66], 0, () => vitral(0.9));
    for (const z of [-1.2, 1.2]) {
      marco.en([3.26, 1.95, z], PI / 2, () => vitral(1.1));
      marco.en([-3.26, 1.95, z], -PI / 2, () => vitral(1.1));
    }

    // Disco del emblema médico
    o.cilindro(0.72, 0.72, 0.06, 26, "#E3F8EC", [-2.1, 2.1, 2.66], [PI / 2, 0, 0]);

    // Jardineras con plantas
    for (const x of [-2.6, -1.1, 2.7]) {
      o.caja(1.2, 0.46, 0.6, MADERA, [x, 0.4, 3.35]);
      for (let i = 0; i < 4; i++) {
        const verde = i % 2 ? VERDE : VERDE_OSCURO;
        o.esfera(0.2 + azar(i + x * 3, 50) * 0.1, verde, [x - 0.4 + i * 0.27, 0.74 + azar(i, 51) * 0.14, 3.35], undefined, 1);
      }
    }
  });
}

function plaza(a: Obras) {
  const { marco, o, l } = a;
  marco.en(PLAZA, 0, () => {
    const giro: V3 = [0, PI / 8, 0];
    o.cilindro(4.9, 5.1, 0.26, 8, PIEDRA, [0, 0.13, 0], giro);
    o.cilindro(4.4, 4.6, 0.26, 8, "#E9E3D4", [0, 0.39, 0], giro);

    // Piso de tablero
    const celda = 0.82;
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const x = i * celda;
        const z = j * celda;
        if (Math.hypot(x, z) > 3.75) continue;
        const color = (i + j) % 2 === 0 ? "#FFC928" : (i + j) % 4 === 1 || (i + j) % 4 === -3 ? "#FFF3C4" : "#4C9EFF";
        o.caja(celda - 0.04, 0.05, celda - 0.04, color, [x, 0.53, z]);
      }
    }

    // Pérgola octogonal
    const radio = 4.02;
    const colores = ["#FF8A73", "#4C9EFF", "#FFC928", "#2DBE70", "#5636D9"];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * PI * 2 + PI / 8;
      const siguiente = ang + PI / 4;
      const px = Math.sin(ang) * radio;
      const pz = Math.cos(ang) * radio;
      o.cilindro(0.13, 0.16, 3, 8, MADERA, [px, 2.02, pz]);
      o.caja(0.42, 0.18, 0.42, MADERA_OSCURA, [px, 0.6, pz]);

      const mitadX = (px + Math.sin(siguiente) * radio) / 2;
      const mitadZ = (pz + Math.cos(siguiente) * radio) / 2;
      const giroViga = ang + PI / 8;
      o.caja(3.4, 0.16, 0.16, MADERA_OSCURA, [mitadX, 3.56, mitadZ], [0, giroViga, 0]);

      // Viga hacia el centro
      marco.en([px * 0.68, 3.68, pz * 0.68], ang, () => {
        o.caja(0.13, 0.12, 2.9, MADERA, [0, 0, 0], [-0.08, 0, 0]);
      });

      // Banderines entre columnas
      for (let b = 0; b < 4; b++) {
        const t = (b + 0.5) / 4;
        const bx = px + (Math.sin(siguiente) * radio - px) * t;
        const bz = pz + (Math.cos(siguiente) * radio - pz) * t;
        const caida = Math.sin(t * PI) * 0.16;
        o.cono(0.17, 0.34, 3, colores[(i + b) % colores.length], [bx, 3.28 - caida, bz], [PI, giroViga, 0], [1, 1, 0.16]);
      }
    }

    o.cilindro(0.72, 0.95, 0.5, 8, PIEDRA_OSCURA, [0, 0.8, 0], giro);
    o.cilindro(0.5, 0.66, 0.65, 8, PIEDRA, [0, 1.35, 0], giro);
    o.cilindro(0.72, 0.56, 0.14, 8, PIEDRA_CLARA, [0, 1.72, 0], giro);
    l.aro(0.62, 0.035, LUZ_CALIDA, [0, 1.8, 0], [PI / 2, 0, 0]);
  });
}

function arena(a: Obras) {
  const { marco, o, m, l } = a;
  marco.en(ARENA, 0, () => {
    const muro = "#E8DCC8";
    o.cilindro(5.75, 5.95, 0.32, 30, PIEDRA, [0, 0.16, 0]);
    o.tubo(5.05, 3, 30, "#B6A992", [0, 1.8, 0]);

    // Arcos alrededor del muro
    const total = 18;
    for (let i = 0; i < total; i++) {
      const ang = (i / total) * PI * 2 + PI / total;
      marco.en([Math.sin(ang) * 5.42, 0, Math.cos(ang) * 5.42], ang, () => {
        o.caja(0.62, 2.7, 0.62, muro, [-0.92, 1.68, 0]);
        o.caja(1.3, 0.46, 0.5, muro, [0, 2.8, 0]);
        o.cilindro(0.62, 0.62, 0.5, 14, muro, [0, 2.42, 0], [PI / 2, 0, 0], [1, 1, 0.42]);
      });
    }
    o.tubo(5.68, 0.5, 30, muro, [0, 3.2, 0]);
    o.corona(4.95, 5.7, 30, "#F2E9D8", [0, 3.46, 0]);
    o.tubo(4.96, 0.5, 30, muro, [0, 3.2, 0]);

    // Graderías que suben hacia afuera
    for (let s = 0; s < 4; s++) {
      const interior = 2.9 + s * 0.55;
      const y = 0.46 + s * 0.52;
      o.corona(interior, interior + 0.57, 30, s % 2 ? "#D8CCB7" : "#CABDA6", [0, y, 0]);
      o.tubo(interior, 0.52, 30, "#AFA28C", [0, y - 0.26, 0]);
    }
    o.cilindro(2.92, 2.92, 0.3, 28, "#D9C9A8", [0, 0.2, 0]);
    o.cilindro(2, 2.2, 0.26, 24, "#8F8578", [0, 0.44, 0]);
    l.corona(1.25, 1.55, 28, "#FF8A73", [0, 0.59, 0]);
    l.corona(0.35, 0.55, 20, "#FFC928", [0, 0.59, 0]);

    // Portón con torres hacia el valle
    o.caja(3.2, 3.2, 0.9, muro, [0, 1.92, 5.5]);
    o.caja(2, 2.4, 0.3, "#3C3128", [0, 1.5, 5.86]);
    o.cilindro(1, 1, 0.3, 18, "#3C3128", [0, 2.7, 5.86], [PI / 2, 0, 0], [1, 1, 0.55]);
    for (const x of [-2, 2]) {
      o.cilindro(0.72, 0.82, 4, 12, muro, [x, 2.2, 5.75]);
      o.cono(0.92, 0.9, 12, "#D9583F", [x, 4.62, 5.75]);
      m.cilindro(0.04, 0.04, 1, 6, ORO, [x, 5.4, 5.75]);
    }
  });
}

/** Puente de piedra y madera con barandas y rampas. */
function puente(a: Obras) {
  const { marco, o, l } = a;
  marco.en([RIO_X, 0, 0], 0, () => {
    const superficie = ALTURA_TABLERO;
    for (const x of [-3, 3]) o.caja(1, 1.7, 4.4, PIEDRA, [x, -0.5, 0]);
    for (const x of [-1.2, 1.2]) o.caja(0.8, 1.6, 3.6, PIEDRA_OSCURA, [x, -0.7, 0]);

    o.caja(6.1, 0.14, 3.5, MADERA_OSCURA, [0, superficie - 0.14, 0]);
    for (let i = 0; i < 20; i++) {
      const tono = i % 3 === 0 ? "#9A6A3B" : i % 3 === 1 ? MADERA : "#7D5129";
      o.caja(0.28, 0.08, 3.5, tono, [-2.85 + i * 0.3, superficie - 0.04, 0]);
    }
    for (const lado of [-1, 1]) {
      o.caja(1.2, 0.08, 3.1, MADERA, [lado * 3.5, superficie - 0.18, 0], [0, 0, lado * -0.28]);
      for (const z of [-1.72, 1.72]) {
        for (let i = 0; i <= 6; i++) o.caja(0.12, 0.85, 0.12, MADERA_OSCURA, [-3 + i, superficie + 0.4, z]);
        o.caja(6.2, 0.1, 0.12, MADERA, [0, superficie + 0.82, z]);
        o.caja(6.2, 0.07, 0.08, MADERA, [0, superficie + 0.45, z]);
      }
    }
    for (const x of [-3, 3]) {
      for (const z of [-1.72, 1.72]) {
        o.caja(0.26, 1.3, 0.26, PIEDRA, [x, superficie + 0.65, z]);
        o.caja(0.34, 0.08, 0.34, MADERA_OSCURA, [x, superficie + 1.32, z]);
        l.caja(0.22, 0.28, 0.22, LUZ_CALIDA, [x, superficie + 1.5, z]);
        o.cono(0.24, 0.2, 4, MADERA_OSCURA, [x, superficie + 1.74, z], [0, PI / 4, 0]);
      }
    }
  });
}

function faroles({ marco, o, l }: Obras) {
  for (const [x, z] of FAROLES) {
    marco.en([x, calcularAlturaTerreno(x, z), z], 0, () => {
      o.cilindro(0.16, 0.2, 0.2, 8, PIEDRA_OSCURA, [0, 0.1, 0]);
      o.cilindro(0.06, 0.09, 2, 8, MADERA_OSCURA, [0, 1.1, 0]);
      o.caja(0.42, 0.05, 0.05, MADERA_OSCURA, [0, 2.02, 0]);
      l.caja(0.26, 0.34, 0.26, LUZ_CALIDA, [0, 2.26, 0]);
      for (const dx of [-0.13, 0.13]) for (const dz of [-0.13, 0.13]) o.caja(0.03, 0.34, 0.03, MADERA_OSCURA, [dx, 2.26, dz]);
      o.cono(0.27, 0.2, 4, MADERA_OSCURA, [0, 2.53, 0], [0, PI / 4, 0]);
    });
  }
}

/** Todas las piezas fijas del valle, unidas por tipo de material. */
export function construirAldea() {
  const marco = new Marco();
  const obras: Obras = { marco, o: new Obra(marco), m: new Obra(marco), l: new Obra(marco) };
  escuela(obras);
  casa(obras);
  observatorio(obras);
  consultorio(obras);
  plaza(obras);
  arena(obras);
  puente(obras);
  faroles(obras);
  return { opaca: obras.o.geometria(), metal: obras.m.geometria(), luz: obras.l.geometria() };
}

/** Cúpula del observatorio: gira entera sobre su eje. */
export function construirCupula() {
  const metal = new Obra();
  const detalle = new Obra();
  metal.cupula(2.85, "#CDD3DE", [0, 0, 0]);
  for (let i = 0; i < 8; i++) {
    metal.aro(2.87, 0.035, "#9FA8B8", [0, 0, 0], [0, (i / 8) * PI, 0], PI);
  }
  detalle.caja(0.75, 2.9, 0.5, "#17164F", [0, 1.55, 2.05], [0.72, 0, 0]);
  detalle.cilindro(0.17, 0.26, 2.6, 14, "#C98A45", [0, 2.4, 2.1], [0.72, 0, 0]);
  detalle.cilindro(0.3, 0.3, 0.16, 14, "#E2B93B", [0, 3.3, 3.15], [0.72, 0, 0]);
  return { metal: metal.geometria(), detalle: detalle.geometria() };
}

/** Planeta con anillos sobre el portal del observatorio. */
export function construirPlaneta() {
  const o = new Obra();
  o.esfera(0.3, "#7C5CE6", [0, 0, 0], undefined, 2);
  o.agregar(new THREE.RingGeometry(0.44, 0.62, 28), "#FFC928", [0, 0, 0], [PI / 2 + 0.3, 0, 0]);
  return o.geometria();
}

export function construirCruz() {
  const o = new Obra();
  o.caja(0.86, 0.3, 0.14, "#2DBE70", [0, 0, 0]);
  o.caja(0.3, 0.86, 0.14, "#2DBE70", [0, 0, 0]);
  return o.geometria();
}

/** Dado biselado con sus puntos en relieve; las caras opuestas suman siete. */
export function construirDado() {
  const o = new Obra();
  o.agregar(new RoundedBoxGeometry(1.25, 1.25, 1.25, 4, 0.16), "#FFF9E6");

  const mapa: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  };
  const caras: { valor: number; eje: 0 | 1 | 2; signo: number }[] = [
    { valor: 1, eje: 2, signo: 1 },
    { valor: 6, eje: 2, signo: -1 },
    { valor: 2, eje: 0, signo: 1 },
    { valor: 5, eje: 0, signo: -1 },
    { valor: 3, eje: 1, signo: 1 },
    { valor: 4, eje: 1, signo: -1 },
  ];
  const paso = 0.31;
  for (const { valor, eje, signo } of caras) {
    for (const [u, v] of mapa[valor]) {
      const p: V3 = [0, 0, 0];
      const escala: V3 = [1, 1, 1];
      p[eje] = signo * 0.62;
      escala[eje] = 0.4;
      p[(eje + 1) % 3] = u * paso;
      p[(eje + 2) % 3] = v * paso;
      o.esfera(0.105, "#17164F", p, escala, 1);
    }
  }
  return o.geometria();
}

/** Estandarte: un paño con franja que ondea en su asta. */
export function construirEstandarte(color: string, franja: string) {
  const o = new Obra();
  o.caja(0.82, 1.15, 0.03, color, [0.45, 0, 0]);
  o.caja(0.82, 0.14, 0.04, franja, [0.45, 0.3, 0]);
  o.cono(0.41, 0.3, 3, color, [0.45, -0.68, 0], [PI, 0, 0], [1, 1, 0.05]);
  return o.geometria();
}

export function construirBanderin() {
  const o = new Obra();
  o.caja(0.72, 0.42, 0.02, "#4C9EFF", [0.36, 0, 0]);
  o.caja(0.72, 0.1, 0.03, "#FFC928", [0.36, 0, 0]);
  return o.geometria();
}

/** Explorador en cinco piezas, para que brazos y piernas se muevan desde el hombro y la cadera. */
export function construirExplorador() {
  const cuerpo = new Obra();
  const CHAQUETA = "#5636D9";
  const PIEL = "#F2C9A8";

  cuerpo.cilindro(0.22, 0.26, 0.56, 12, CHAQUETA, [0, 0, 0]);
  cuerpo.caja(0.06, 0.5, 0.04, "#FFC928", [0, 0, 0.25]);
  cuerpo.aro(0.17, 0.06, "#FFC928", [0, 0.27, 0], [PI / 2, 0, 0]);
  cuerpo.caja(0.42, 0.46, 0.22, "#8B5A2B", [0, 0.03, -0.31]);
  cuerpo.caja(0.3, 0.18, 0.06, "#6E4423", [0, -0.06, -0.44]);
  cuerpo.cilindro(0.1, 0.1, 0.46, 10, "#2DBE70", [0, 0.31, -0.3], [0, 0, PI / 2]);

  cuerpo.esfera(0.28, PIEL, [0, 0.56, 0], undefined, 2);
  for (const x of [-0.1, 0.1]) {
    cuerpo.esfera(0.05, "#FFFFFF", [x, 0.58, 0.24], undefined, 1);
    cuerpo.esfera(0.03, "#17164F", [x, 0.58, 0.28], undefined, 1);
  }
  cuerpo.caja(0.1, 0.022, 0.02, "#C9806B", [0, 0.46, 0.27]);
  cuerpo.agregar(new THREE.SphereGeometry(0.3, 18, 10, 0, PI * 2, 0, PI / 2), "#4C9EFF", [0, 0.6, 0]);
  cuerpo.cilindro(0.3, 0.31, 0.05, 18, "#2472CC", [0, 0.6, 0]);
  cuerpo.caja(0.34, 0.035, 0.22, "#2472CC", [0, 0.6, 0.31], [0.12, 0, 0]);

  const brazo = () => {
    const o = new Obra();
    o.esfera(0.09, CHAQUETA, [0, 0, 0]);
    o.cilindro(0.075, 0.08, 0.38, 10, CHAQUETA, [0, -0.19, 0]);
    o.esfera(0.075, PIEL, [0, -0.42, 0]);
    return o.geometria();
  };
  const pierna = () => {
    const o = new Obra();
    o.cilindro(0.09, 0.085, 0.34, 10, "#2E234A", [0, -0.17, 0]);
    o.caja(0.17, 0.12, 0.27, "#4A2E1B", [0, -0.38, 0.05]);
    return o.geometria();
  };
  return { cuerpo: cuerpo.geometria(), brazoI: brazo(), brazoD: brazo(), piernaI: pierna(), piernaD: pierna() };
}

/** Cada guía tiene cuerpo y cabeza separados: la cabeza gira hacia quien se acerca. */
export function construirGuia(id: "elena" | "mateo" | "vega") {
  const cuerpo = new Obra();
  const cabeza = new Obra();

  const cara = (piel: string) => {
    cabeza.esfera(0.25, piel, [0, 0, 0], undefined, 2);
    for (const x of [-0.09, 0.09]) {
      cabeza.esfera(0.045, "#FFFFFF", [x, 0.03, 0.21], undefined, 1);
      cabeza.esfera(0.026, "#17164F", [x, 0.03, 0.25], undefined, 1);
    }
    cabeza.caja(0.09, 0.02, 0.02, "#B3695A", [0, -0.09, 0.235]);
  };

  if (id === "elena") {
    cuerpo.cilindro(0.2, 0.38, 0.95, 14, "#8E2845", [0, 0.48, 0]);
    cuerpo.cilindro(0.17, 0.21, 0.32, 14, "#A93A58", [0, 1.05, 0]);
    cuerpo.aro(0.17, 0.06, "#F7F3E6", [0, 1.2, 0], [PI / 2, 0, 0]);
    for (const x of [-0.27, 0.27]) cuerpo.cilindro(0.06, 0.07, 0.56, 10, "#A93A58", [x, 0.92, 0.08], [0.55, 0, x > 0 ? 0.14 : -0.14]);
    cuerpo.caja(0.42, 0.3, 0.06, "#2472CC", [0, 0.72, 0.36], [0.5, 0, 0]);
    cuerpo.caja(0.38, 0.27, 0.07, "#FFFFFF", [0, 0.735, 0.34], [0.5, 0, 0]);
    cara("#F2C9A8");
    cabeza.esfera(0.265, "#3D2314", [0, 0.07, -0.05], [1, 0.95, 0.95]);
    cabeza.esfera(0.12, "#3D2314", [0, 0.26, -0.16]);
    for (const x of [-0.09, 0.09]) cabeza.aro(0.065, 0.012, "#17164F", [x, 0.03, 0.235]);
  } else if (id === "mateo") {
    cuerpo.cilindro(0.14, 0.16, 0.4, 10, "#3A2F2B", [-0.11, 0.2, 0]);
    cuerpo.cilindro(0.14, 0.16, 0.4, 10, "#3A2F2B", [0.11, 0.2, 0]);
    cuerpo.cono(0.62, 0.95, 8, "#C85A32", [0, 0.82, 0], [0, PI / 8, 0]);
    for (const [y, r, c] of [
      [0.46, 0.53, "#FFC928"],
      [0.6, 0.44, "#2DBE70"],
      [0.72, 0.36, "#FFC928"],
    ] as [number, number, string][]) {
      cuerpo.cilindro(r, r + 0.03, 0.06, 8, c, [0, y, 0], [0, PI / 8, 0]);
    }
    cuerpo.cilindro(0.04, 0.04, 0.8, 6, "#6E4423", [0, 0.82, 0.18], [0.1, 0, 0.72]);
    cuerpo.caja(0.32, 0.34, 0.14, "#8B5A2B", [0.42, 0.56, 0.2], [0, -0.3, 0]);
    cuerpo.caja(0.32, 0.1, 0.16, "#6E4423", [0.42, 0.68, 0.21], [0, -0.3, 0]);
    cara("#D7A17A");
    cabeza.esfera(0.13, "#ECECEC", [0, -0.14, 0.15], [1.1, 1, 0.8]);
    cabeza.cono(0.27, 0.4, 14, "#2DBE70", [0, 0.27, 0]);
    cabeza.cilindro(0.27, 0.27, 0.08, 14, "#FFC928", [0, 0.09, 0]);
    cabeza.esfera(0.06, "#C85A32", [0, 0.5, 0]);
    for (const x of [-0.24, 0.24]) cabeza.caja(0.06, 0.26, 0.13, "#C85A32", [x, -0.02, 0], [0, 0, x > 0 ? -0.2 : 0.2]);
  } else {
    cuerpo.cilindro(0.17, 0.17, 0.42, 10, "#0D1B2A", [-0.11, 0.21, 0]);
    cuerpo.cilindro(0.17, 0.17, 0.42, 10, "#0D1B2A", [0.11, 0.21, 0]);
    cuerpo.cilindro(0.23, 0.29, 0.68, 12, "#27406B", [0, 0.76, 0]);
    cuerpo.caja(0.6, 0.09, 0.42, "#E2B93B", [0, 0.48, 0]);
    cuerpo.esfera(0.07, "#FFC928", [0.1, 0.9, 0.24], undefined, 1);
    for (const x of [-0.31, 0.31]) cuerpo.cilindro(0.07, 0.08, 0.6, 10, "#27406B", [x, 0.76, 0], [0, 0, x > 0 ? 0.12 : -0.12]);
    cuerpo.cilindro(0.07, 0.07, 0.62, 10, "#CD7F32", [-0.2, 0.86, -0.28], [0.1, 0, 0.42]);
    cara("#F2C9A8");
    cabeza.esfera(0.26, "#2B1D0C", [0, 0.06, -0.07]);
    cabeza.esfera(0.09, "#2B1D0C", [0, 0.02, -0.3]);
    cabeza.caja(0.42, 0.11, 0.08, "#25CFE0", [0, 0.11, 0.21], [0.08, 0, 0]);
    cabeza.aro(0.26, 0.02, "#E2B93B", [0, 0.14, 0], [PI / 2, 0, 0]);
  }
  return { cuerpo: cuerpo.geometria(), cabeza: cabeza.geometria() };
}
