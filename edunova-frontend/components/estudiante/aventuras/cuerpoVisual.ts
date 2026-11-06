import * as THREE from "three";
import { Obra, type V3 } from "../valle/valleObra";
import { type IdOrgano } from "./cuerpoData";

// Visuales médicos optimizados para Doctor Detective (Consultorio).
// Cero descargas pesadas de 7 MB: modelos paramétricos de alta precisión anatómica en memoria.

/** Elipsoide invisible que recibe el toque, relativo al centro del órgano. */
export interface ZonaToque {
  centro: V3;
  radio: number;
  escala?: V3;
}

export interface ConfigOrganoVisual {
  posicion: [number, number, number];
  etiquetaEn: [number, number, number];
  hitRadio: number;
  colorBase: string;
  /** Más holgadas que el órgano, pero sin tapar a sus vecinos: si no, tocar uno marca el de al lado. */
  zonas: ZonaToque[];
}

export const CONFIG_ORGANOS_VISUAL: Record<IdOrgano, ConfigOrganoVisual> = {
  cerebro: {
    posicion: [0, 3.34, 0.02],
    etiquetaEn: [0, 3.86, 0.5],
    hitRadio: 0.65,
    colorBase: "#F4A6B8",
    zonas: [{ centro: [0, 0, 0], radio: 0.5 }],
  },
  pulmones: {
    posicion: [0, 1.35, 0.05],
    etiquetaEn: [-0.95, 1.9, 0.4],
    hitRadio: 0.85,
    colorBase: "#F28B82",
    zonas: [
      { centro: [-0.44, 0.08, 0], radio: 0.5, escala: [0.9, 1.3, 0.8] },
      { centro: [0.44, 0.08, 0], radio: 0.5, escala: [0.9, 1.3, 0.8] },
    ],
  },
  corazon: {
    posicion: [0.15, 1.32, 0.28],
    etiquetaEn: [0.35, 1.35, 0.75],
    hitRadio: 0.5,
    colorBase: "#D31238",
    zonas: [{ centro: [0, 0, 0], radio: 0.44 }],
  },
  higado: {
    posicion: [-0.38, 0.55, 0.18],
    etiquetaEn: [-0.9, 0.55, 0.55],
    hitRadio: 0.62,
    colorBase: "#94382A",
    zonas: [{ centro: [0, 0, 0], radio: 0.5, escala: [1.1, 0.62, 0.85] }],
  },
  estomago: {
    posicion: [0.38, 0.52, 0.18],
    etiquetaEn: [0.95, 0.52, 0.55],
    hitRadio: 0.58,
    colorBase: "#E5A844",
    zonas: [{ centro: [0.04, 0.08, 0], radio: 0.44, escala: [0.95, 1, 0.8] }],
  },
  intestinos: {
    posicion: [0, -0.22, 0.14],
    etiquetaEn: [0, -0.85, 0.6],
    hitRadio: 0.72,
    colorBase: "#E27E6A",
    zonas: [{ centro: [0, -0.16, 0], radio: 0.62, escala: [1, 0.72, 0.7] }],
  },
  rinones: {
    posicion: [0, 0.25, -0.28],
    etiquetaEn: [0.95, 0.25, -0.4],
    hitRadio: 0.75,
    colorBase: "#7E3258",
    zonas: [
      { centro: [-0.44, 0, 0], radio: 0.34, escala: [0.9, 1.3, 1] },
      { centro: [0.44, 0, 0], radio: 0.34, escala: [0.9, 1.3, 1] },
    ],
  },
};

// -----------------------------------------------------------------------------
// SHADERS GLSL MÉDICOS
// -----------------------------------------------------------------------------

export const VERT_PIEL_FRESNEL = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const FRAG_PIEL_FRESNEL = /* glsl */ `
uniform vec3 uRimColor;
uniform vec3 uBaseColor;
uniform float uRimPower;
uniform float uBaseAlpha;
uniform float uRimAlpha;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = 1.0 - abs(dot(normal, viewDir));
  fresnel = clamp(pow(fresnel, uRimPower), 0.0, 1.0);

  vec3 color = mix(uBaseColor, uRimColor, fresnel);
  float alpha = mix(uBaseAlpha, uRimAlpha, fresnel);

  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const VERT_ESCANER = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const FRAG_ESCANER = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  // Gradiente suave radial hacia los bordes del haz
  float dist = length(vUv - vec2(0.5));
  float halo = smoothstep(0.5, 0.0, dist);
  float pulse = 0.85 + sin(uTime * 4.0) * 0.15;
  gl_FragColor = vec4(uColor, halo * 0.45 * pulse);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// -----------------------------------------------------------------------------
// GENERADORES PARAMÉTRICOS DE ÓRGANOS (ALTA PRECISIÓN ANATÓMICA)
// -----------------------------------------------------------------------------

/** Cerebro: dos hemisferios con circunvoluciones y cisuras, más cerebelo inferior */
export function crearGeometriaCerebro(): THREE.BufferGeometry {
  const o = new Obra();

  // Función para crear un hemisferio con surcos esculpidos en vértices
  function hemisferio(lado: number) {
    const geo = new THREE.SphereGeometry(0.38, 28, 22);
    const pos = geo.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Aplanamiento medial en la cisura interhemisférica
      if ((lado > 0 && x < 0.02) || (lado < 0 && x > -0.02)) {
        x *= 0.3;
      }
      // Esculpido sinusoidal de circunvoluciones (gyri / sulci)
      const g1 = Math.sin(x * 18 + y * 14) * Math.cos(z * 16);
      const g2 = Math.sin(y * 22 + z * 18) * 0.5;
      const disp = (g1 + g2) * 0.022;

      pos.setXYZ(i, x * 0.95 + disp, y * 0.88 + disp, z * 1.15 + disp);
    }
    geo.computeVertexNormals();
    o.agregar(geo, "#F4A6B8", [lado * 0.16, 0, 0]);
  }

  // Hemisferio izquierdo y derecho
  hemisferio(-1);
  hemisferio(1);

  // Cerebelo posterior/inferior con folias transversales
  const cerGeo = new THREE.SphereGeometry(0.24, 20, 16);
  const cerPos = cerGeo.getAttribute("position");
  for (let i = 0; i < cerPos.count; i++) {
    const y = cerPos.getY(i);
    const z = cerPos.getZ(i);
    const estrías = Math.sin(y * 45) * 0.012;
    cerPos.setXYZ(i, cerPos.getX(i) * 1.25, y * 0.65 + estrías, z * 0.9);
  }
  cerGeo.computeVertexNormals();
  o.agregar(cerGeo, "#E08CA0", [0, -0.22, -0.16]);

  // Bulbo raquídeo / tronco encefálico descendente
  o.cilindro(0.08, 0.06, 0.28, 12, "#EAC4CE", [0, -0.32, -0.06]);

  return o.geometria();
}

/** Corazón: cardioide asimétrico real con aurículas, ventrículos, aorta y vena cava */
export function crearGeometriaCorazon(): THREE.BufferGeometry {
  const o = new Obra();

  // Masa ventricular cardioide asimétrica orientada hacia la izquierda anatómica
  const ventGeo = new THREE.SphereGeometry(0.26, 24, 20);
  const pos = ventGeo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i);

    // Vértice puntiagudo hacia el ápex (abajo a la izquierda)
    if (y < 0) {
      const taper = 1 + y * 1.2;
      x *= Math.max(0.2, taper);
      z *= Math.max(0.25, taper);
      x += Math.abs(y) * 0.18; // Desvío hacia el ápex izquierdo
    } else {
      // Surco interventricular superior
      x *= 1.1;
      z *= 1.05;
    }
    pos.setXYZ(i, x, y * 1.2, z);
  }
  ventGeo.computeVertexNormals();
  o.agregar(ventGeo, "#C8102E", [0, 0, 0]);

  // Aurícula derecha (azulada / venosa)
  o.esfera(0.14, "#8E1834", [-0.14, 0.2, -0.02], [1, 1.2, 0.9]);
  // Aurícula izquierda
  o.esfera(0.13, "#A61435", [0.12, 0.2, -0.02], [1, 1.1, 0.9]);

  // Cayado aórtico (arco rojo curvado superior)
  const curvaAorta = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.02, 0.18, 0.04),
    new THREE.Vector3(0.02, 0.44, 0.06),
    new THREE.Vector3(0.16, 0.22, -0.04),
  );
  const aortaGeo = new THREE.TubeGeometry(curvaAorta, 16, 0.06, 10, false);
  o.agregar(aortaGeo, "#DC2626", [0, 0, 0]);

  // Arterias braquiocefálicas que emergen del arco
  o.cilindro(0.02, 0.02, 0.1, 8, "#EF4444", [0.02, 0.38, 0.04]);
  o.cilindro(0.02, 0.02, 0.1, 8, "#EF4444", [0.08, 0.36, 0.03]);

  // Vena cava superior (azul medial)
  o.cilindro(0.05, 0.05, 0.24, 10, "#2563EB", [-0.12, 0.32, -0.04]);
  // Tronco pulmonar
  o.cilindro(0.052, 0.052, 0.18, 10, "#4B7BEC", [0.04, 0.24, 0.12], [0.3, 0, -0.2]);

  return o.geometria();
}

/** Pulmones: 3 lóbulos derechos, 2 izquierdos con muesca cardíaca y tráquea anillada */
export function crearGeometriaPulmones(): THREE.BufferGeometry {
  const o = new Obra();

  // Tráquea anillada central
  o.cilindro(0.065, 0.065, 0.42, 14, "#E2E8F0", [0, 0.65, 0.02]);
  // Anillos cartilaginosos de la tráquea
  for (let y = 0.5; y <= 0.82; y += 0.06) {
    o.aro(0.07, 0.015, "#CBD5E1", [0, y, 0.02], [Math.PI / 2, 0, 0]);
  }
  // Bronquios principales izquierdo y derecho
  o.cilindro(0.045, 0.04, 0.2, 10, "#E2E8F0", [-0.1, 0.44, 0], [0, 0, 0.65]);
  o.cilindro(0.045, 0.04, 0.2, 10, "#E2E8F0", [0.1, 0.44, 0], [0, 0, -0.65]);

  // Pulmón derecho: 3 lóbulos (superior, medio, inferior)
  const pulmDerGeo = new THREE.SphereGeometry(0.36, 24, 20);
  const pDer = pulmDerGeo.getAttribute("position");
  for (let i = 0; i < pDer.count; i++) {
    const x = pDer.getX(i);
    const y = pDer.getY(i);
    const z = pDer.getZ(i);
    // Cisuras horizontal y oblicua marcadas
    const cisura1 = Math.abs(y - 0.08) < 0.03 ? 0.85 : 1.0;
    const cisura2 = Math.abs(y + 0.16 + x * 0.2) < 0.03 ? 0.85 : 1.0;
    const factor = cisura1 * cisura2;
    pDer.setXYZ(i, x * 0.9 * factor, y * 1.55, z * 0.82 * factor);
  }
  pulmDerGeo.computeVertexNormals();
  o.agregar(pulmDerGeo, "#F28B82", [-0.38, 0.08, 0]);

  // Pulmón izquierdo: 2 lóbulos con escotadura cardíaca profunda
  const pulmIzqGeo = new THREE.SphereGeometry(0.35, 24, 20);
  const pIzq = pulmIzqGeo.getAttribute("position");
  for (let i = 0; i < pIzq.count; i++) {
    let x = pIzq.getX(i);
    const y = pIzq.getY(i);
    const z = pIzq.getZ(i);

    // Concavidad para el corazón en el borde anteromedial inferior
    if (x < 0.1 && y < 0.1 && z > -0.05) {
      x += 0.12; // Muesca cardíaca
    }
    const cisuraOblicua = Math.abs(y - 0.02 + x * 0.25) < 0.03 ? 0.86 : 1.0;
    pIzq.setXYZ(i, x * 0.86 * cisuraOblicua, y * 1.52, z * 0.82 * cisuraOblicua);
  }
  pulmIzqGeo.computeVertexNormals();
  o.agregar(pulmIzqGeo, "#F28B82", [0.38, 0.08, 0]);

  return o.geometria();
}

/** Hígado: cuña cuneiforme bilobular con vesícula biliar */
export function crearGeometriaHigado(): THREE.BufferGeometry {
  const o = new Obra();

  const higadoGeo = new THREE.SphereGeometry(0.36, 26, 20);
  const pos = higadoGeo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Forma cuneiforme: grueso a la derecha (-X en pantalla), afilado a la izquierda
    const cuña = 1 + x * 0.5;
    y *= Math.max(0.35, cuña) * 0.75;
    z *= Math.max(0.4, cuña) * 0.85;

    // Cara superior diafragmática lisa convexa, cara visceral inferior cóncava
    if (y < 0) y *= 0.65;
    pos.setXYZ(i, x * 1.35, y, z);
  }
  higadoGeo.computeVertexNormals();
  o.agregar(higadoGeo, "#94382A", [0, 0, 0]);

  // Vesícula biliar (pequeño saco piriforme verde oliva en cara inferior)
  o.esfera(0.085, "#4D7C0F", [-0.08, -0.16, 0.12], [0.8, 1.4, 0.8]);

  return o.geometria();
}

/** Estómago: bolsa curva en 'J' con cardias, fundus, curvatura mayor y menor */
export function crearGeometriaEstomago(): THREE.BufferGeometry {
  const o = new Obra();

  // Curva central de la 'J' gástrica
  const curvaJ = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.08, 0.32, 0.02), // Cardias / esófago
    new THREE.Vector3(0.08, 0.36, 0.05), // Fundus superior
    new THREE.Vector3(0.22, 0.12, 0.06), // Cuerpo curvatura mayor
    new THREE.Vector3(0.14, -0.18, 0.04), // Fondo inferior
    new THREE.Vector3(-0.06, -0.12, 0.02), // Antro pilórico
    new THREE.Vector3(-0.16, -0.04, 0), // Píloro hacia duodeno
  ]);

  const estomagoGeo = new THREE.TubeGeometry(curvaJ, 32, 0.16, 16, false);
  const pos = estomagoGeo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // Dilatación del fundus y cuerpo gástrico: gradual, porque un corte en seco rasga la malla
    const bolsa = 1 + 0.26 * Math.exp(-(((y - 0.12) / 0.2) ** 2));
    pos.setXYZ(i, pos.getX(i) * bolsa, y, pos.getZ(i) * bolsa);
  }
  estomagoGeo.computeVertexNormals();
  o.agregar(estomagoGeo, "#E5A844", [0, 0, 0]);

  // Esfínter pilórico y duodeno inicial
  o.cilindro(0.06, 0.07, 0.12, 12, "#E8BA64", [-0.2, -0.02, 0], [0, 0, 1.2]);

  return o.geometria();
}

/** Intestinos: marco del colon con haustras alrededor del intestino delgado sinuoso */
export function crearGeometriaIntestinos(): THREE.BufferGeometry {
  const o = new Obra();

  // 1. Marco del Intestino Grueso (Colon ascendente, transverso, descendente y sigmoide)
  const caminoColon = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.46, -0.42, 0.02), // Ciego y apéndice
    new THREE.Vector3(-0.48, -0.1, 0.04), // Colon ascendente
    new THREE.Vector3(-0.44, 0.22, 0.05), // Ángulo hepático
    new THREE.Vector3(0.0, 0.24, 0.06), // Colon transverso
    new THREE.Vector3(0.44, 0.2, 0.05), // Ángulo esplénico
    new THREE.Vector3(0.48, -0.12, 0.04), // Colon descendente
    new THREE.Vector3(0.38, -0.42, 0.02), // Colon sigmoide
    new THREE.Vector3(0.12, -0.52, -0.04), // Recto
  ]);

  const colonGeo = new THREE.TubeGeometry(caminoColon, 48, 0.1, 14, false);
  const cPos = colonGeo.getAttribute("position");
  for (let i = 0; i < cPos.count; i++) {
    // Modelado de abolladuras / haustras del colon
    const onda = Math.sin(i * 1.8) * 0.018;
    cPos.setXYZ(i, cPos.getX(i) + onda, cPos.getY(i) + onda, cPos.getZ(i) + onda);
  }
  colonGeo.computeVertexNormals();
  o.agregar(colonGeo, "#D97764", [0, 0, 0]);

  // Apéndice vermiforme
  o.cilindro(0.022, 0.015, 0.14, 8, "#E28B78", [-0.46, -0.52, 0.02], [0.4, 0, 0.3]);

  // 2. Intestino Delgado (asas sinuosas compactas en el centro)
  const asasGeo = new THREE.TorusKnotGeometry(0.24, 0.075, 72, 12, 3, 4);
  o.agregar(asasGeo, "#F28C77", [0, -0.08, 0.06], [0.35, 0, 0], [1.1, 0.9, 0.8]);

  return o.geometria();
}

/** Riñones: par de órganos en forma de frijol en la zona dorsal a ambos lados */
export function crearGeometriaRinones(): THREE.BufferGeometry {
  const o = new Obra();

  function rinon(lado: number, posY: number) {
    const geo = new THREE.SphereGeometry(0.22, 22, 18);
    const pos = geo.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Forma reniforme / frijol: concavidad medial (hilio renal)
      if ((lado > 0 && x < 0.04) || (lado < 0 && x > -0.04)) {
        x *= 0.55;
      } else {
        x *= 1.15;
      }
      y *= 1.45;
      z *= 0.85;
      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    o.agregar(geo, "#7E3258", [lado * 0.44, posY, 0]);

    // Glándula suprarrenal (pequeño casquete triangular amarillo/ocre superior)
    o.cono(0.08, 0.09, 8, "#D99B26", [lado * 0.44, posY + 0.3, 0], [0, 0, lado * 0.2]);

    // Uréteres que descienden hacia la vejiga
    o.cilindro(0.02, 0.02, 0.45, 8, "#E5E7EB", [lado * 0.38, posY - 0.3, 0.02], [0, 0, -lado * 0.15]);
  }

  // Riñón derecho (ligeramente más bajo por el hígado) e izquierdo
  rinon(-1, -0.04);
  rinon(1, 0.04);

  return o.geometria();
}

// -----------------------------------------------------------------------------
// SILUETA HUMANA CONTINUA + GUÍA TORÁCICA (FRESNEL TRANSLÚCIDO)
// -----------------------------------------------------------------------------

/** Paciente estilizado y amigable con proporciones educativas continuas */
export function crearGeometriaCuerpo(): THREE.BufferGeometry {
  const o = new Obra();

  // Cabeza serena amigable
  o.esfera(0.78, "#A5F3FC", [0, 3.1, 0], [0.92, 1.05, 0.94]);
  // Orejas
  o.esfera(0.18, "#A5F3FC", [-0.76, 3.1, 0], [0.4, 0.9, 0.6]);
  o.esfera(0.18, "#A5F3FC", [0.76, 3.1, 0], [0.4, 0.9, 0.6]);
  // Nariz suave
  o.esfera(0.09, "#A5F3FC", [0, 3.02, 0.74], [1, 1, 1]);

  // Cuello
  o.cilindro(0.3, 0.34, 0.45, 18, "#A5F3FC", [0, 2.25, 0]);

  // Torso continuo estilizado (pecho y abdomen)
  o.cilindro(0.88, 0.8, 1.45, 20, "#A5F3FC", [0, 1.4, 0], [0, 0, 0], [1, 1, 0.68]);
  // Pelvis / cadera
  o.cilindro(0.8, 0.74, 0.7, 20, "#A5F3FC", [0, 0.4, 0], [0, 0, 0], [1, 1, 0.68]);

  // Hombros redondeados
  o.esfera(0.34, "#A5F3FC", [-1.02, 1.95, 0]);
  o.esfera(0.34, "#A5F3FC", [1.02, 1.95, 0]);

  // Brazos a los costados
  o.cilindro(0.24, 0.2, 1.25, 14, "#A5F3FC", [-1.15, 1.28, 0], [0, 0, -0.1]);
  o.cilindro(0.2, 0.17, 1.15, 14, "#A5F3FC", [-1.26, 0.18, 0.05], [0.1, 0, -0.06]);
  // Manos descansando
  o.esfera(0.18, "#A5F3FC", [-1.3, -0.48, 0.1], [0.7, 1.1, 0.8]);

  o.cilindro(0.24, 0.2, 1.25, 14, "#A5F3FC", [1.15, 1.28, 0], [0, 0, 0.1]);
  o.cilindro(0.2, 0.17, 1.15, 14, "#A5F3FC", [1.26, 0.18, 0.05], [0.1, 0, 0.06]);
  o.esfera(0.18, "#A5F3FC", [1.3, -0.48, 0.1], [0.7, 1.1, 0.8]);

  // Piernas completas apoyadas sobre la plataforma (de Y=0.0 a Y=-2.6)
  // Muslos
  o.cilindro(0.32, 0.26, 1.25, 16, "#A5F3FC", [-0.42, -0.5, 0]);
  o.cilindro(0.32, 0.26, 1.25, 16, "#A5F3FC", [0.42, -0.5, 0]);
  // Rodillas
  o.esfera(0.26, "#A5F3FC", [-0.42, -1.18, 0.04]);
  o.esfera(0.26, "#A5F3FC", [0.42, -1.18, 0.04]);
  // Pantorrillas
  o.cilindro(0.25, 0.2, 1.2, 16, "#A5F3FC", [-0.42, -1.82, 0]);
  o.cilindro(0.25, 0.2, 1.2, 16, "#A5F3FC", [0.42, -1.82, 0]);
  // Pies planos sobre la plataforma (Y=-2.55)
  o.esfera(0.3, "#A5F3FC", [-0.42, -2.43, 0.14], [0.7, 0.42, 1.25], 2);
  o.esfera(0.3, "#A5F3FC", [0.42, -2.43, 0.14], [0.7, 0.42, 1.25], 2);

  return o.geometria();
}

/** Cara amable del paciente: ojos y sonrisa, debajo del cerebro. */
export function crearGeometriaCara(): THREE.BufferGeometry {
  const o = new Obra();
  o.esfera(0.07, "#0F766E", [-0.25, 2.92, 0.68], [1, 1.2, 0.5], 2);
  o.esfera(0.07, "#0F766E", [0.25, 2.92, 0.68], [1, 1.2, 0.5], 2);
  o.aro(0.17, 0.022, "#0F766E", [0, 2.76, 0.66], [-0.3, 0, Math.PI], Math.PI);
  return o.geometria();
}

/** Guía esquelética sutil (columna, esternón y costillas de referencia) */
export function crearGeometriaEsqueletoGuia(): THREE.BufferGeometry {
  const o = new Obra();

  // Columna vertebral dorsal
  for (let y = 0.0; y <= 2.1; y += 0.14) {
    o.caja(0.16, 0.08, 0.14, "#E2E8F0", [0, y, -0.28]);
  }

  // Esternón anterior
  o.caja(0.12, 0.75, 0.06, "#E2E8F0", [0, 1.35, 0.38]);

  // Arcos de costillas superiores sutiles
  for (let i = 0; i < 4; i++) {
    const y = 1.65 - i * 0.18;
    const r = 0.62 + i * 0.04;
    o.aro(r, 0.02, "#CBD5E1", [0, y, 0.05], [Math.PI / 2, 0, 0], Math.PI * 1.85);
  }

  return o.geometria();
}

// -----------------------------------------------------------------------------
// ENTORNO DEL CONSULTORIO Y PLATAFORMA DE BIO-ESCÁNER
// -----------------------------------------------------------------------------

const RADIO_SALA = 15;

/** Pared circular. Se dibuja solo por dentro: al girar el paciente, la cámara nunca queda tapada. */
export function crearGeometriaParedSala(): THREE.BufferGeometry {
  const o = new Obra();
  o.tubo(RADIO_SALA, 30, 48, "#EDF9F2", [0, 12.2, 0]);
  return o.geometria();
}

/** Suelo, zócalo y ventanas a los lados: detrás del paciente no va nada que compita con los órganos. */
export function crearGeometriaSala(): THREE.BufferGeometry {
  const o = new Obra();

  o.cilindro(RADIO_SALA, RADIO_SALA, 0.4, 48, "#D3EFE0", [0, -3, 0]);
  o.aro(RADIO_SALA - 0.1, 0.16, "#7FD8C2", [0, -2.5, 0], [Math.PI / 2, 0, 0]);

  for (const lado of [-1, 1]) {
    const x = lado * 7.2;
    const z = -Math.sqrt(RADIO_SALA ** 2 - x ** 2) + 0.5;
    const giro: V3 = [0, -Math.asin(x / RADIO_SALA), 0];
    o.caja(4.6, 6.4, 0.2, "#7FD8C2", [x, 2.6, z], giro);
    o.caja(4.1, 5.9, 0.24, "#FFFDF0", [x, 2.6, z], giro);
    o.caja(0.14, 5.9, 0.28, "#7FD8C2", [x, 2.6, z], giro);
    o.caja(4.1, 0.14, 0.28, "#7FD8C2", [x, 2.9, z], giro);
  }

  return o.geometria();
}

/** Planta y mesa auxiliar: reciben luz, a diferencia de la sala. */
export function crearGeometriaMuebles(): THREE.BufferGeometry {
  const o = new Obra();

  o.cilindro(0.65, 0.45, 1.2, 14, "#F8FAFC", [-4.2, -2.2, -3.2]);
  o.cilindro(0.08, 0.1, 1.5, 8, "#3F8F5A", [-4.2, -0.9, -3.2]);
  for (let i = 0; i < 7; i++) {
    const ang = (i * Math.PI * 2) / 7;
    const alto = i % 2 === 0 ? -0.35 : 0.05;
    o.esfera(0.42, i % 2 === 0 ? "#22A95A" : "#3CC274", [-4.2 + Math.cos(ang) * 0.55, alto, -3.2 + Math.sin(ang) * 0.55], [1.15, 0.4, 0.7], 2);
  }
  o.esfera(0.42, "#3CC274", [-4.2, 0.28, -3.2], [0.9, 0.7, 0.9], 2);

  o.caja(1.8, 1.4, 1.2, "#FFFFFF", [4.2, -2.1, -2.8]);
  o.caja(1.9, 0.12, 1.3, "#0D9488", [4.2, -1.35, -2.8]);

  return o.geometria();
}

/** Plataforma circular del paciente con anillos LED de escáner */
export function crearGeometriaPlataforma(): THREE.BufferGeometry {
  const o = new Obra();

  // Base circular escalonada
  o.cilindro(1.9, 2.1, 0.22, 36, "#14B8A6", [0, -2.68, 0]);
  o.cilindro(1.7, 1.85, 0.15, 36, "#F0FDFA", [0, -2.52, 0]);

  // Anillos luminosos concéntricos
  o.aro(1.4, 0.04, "#06B6D4", [0, -2.44, 0], [Math.PI / 2, 0, 0]);
  o.aro(0.9, 0.035, "#10B981", [0, -2.44, 0], [Math.PI / 2, 0, 0]);

  return o.geometria();
}
