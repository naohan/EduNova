"use client";

import { memo, useLayoutEffect, useMemo, useRef, type ComponentRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Clouds, Sky, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  FAROLES,
  RIO_X,
  SENDEROS,
  calcularAlturaTerreno,
  distanciaASendero,
  hayEspacioLibre,
  type CalidadGrafica,
  type ClimaHora,
} from "./valleData";
import { Obra, azar } from "./valleObra";

interface Props {
  clima: ClimaHora;
  calidad: CalidadGrafica;
  prefersReducedMotion: boolean;
}

const TAMANO_TERRENO = 150;
const NIVEL_AGUA = -0.3;

/** Reloj del viento: lo comparten los árboles y se actualiza en cada cuadro. */
const VIENTO = { value: 0 };

interface Ambiente {
  luz: [number, number, number];
  colorLuz: string;
  intensidadLuz: number;
  /** Sol que dibuja el cielo. De noche queda bajo el horizonte y el cielo se apaga solo. */
  sol: [number, number, number];
  astro: [number, number, number];
  colorAstro: string;
  cielo: string;
  suelo: string;
  intensidadCielo: number;
  niebla: string;
  densidadNiebla: number;
  rayleigh: number;
  turbiedad: number;
  /** El cielo de drei está pensado para una exposición menor que la del valle. */
  exposicionCielo: number;
  tinteCielo: string;
  brilloAgua: number;
  reflejoAgua: string;
  halos: number;
  nubes: string;
  particulas: string;
}

// Se usa el mismo sol para el cielo, la esfera y la luz principal; de noche la luz pasa a ser la luna.
const AMBIENTES: Record<ClimaHora, Ambiente> = {
  dia: {
    luz: [26, 40, 22],
    colorLuz: "#FFF3DE",
    intensidadLuz: 2.5,
    sol: [26, 40, 22],
    astro: [80, 125, 70],
    colorAstro: "#FFF4CC",
    cielo: "#D6ECFF",
    suelo: "#7FA36A",
    intensidadCielo: 1.15,
    niebla: "#CFE6F5",
    densidadNiebla: 0.0058,
    rayleigh: 1.1,
    turbiedad: 2.2,
    exposicionCielo: 0.42,
    tinteCielo: "#000000",
    brilloAgua: 1,
    reflejoAgua: "#FFFFFF",
    halos: 0,
    nubes: "#FFFFFF",
    particulas: "#FFE066",
  },
  atardecer: {
    luz: [48, 12, -40],
    colorLuz: "#FF9D5C",
    intensidadLuz: 2.3,
    sol: [48, 7, -62],
    astro: [115, 17, -150],
    colorAstro: "#FFB56B",
    cielo: "#FFC9A6",
    suelo: "#6B5444",
    intensidadCielo: 1,
    niebla: "#E9A988",
    densidadNiebla: 0.0105,
    rayleigh: 2.6,
    turbiedad: 8,
    exposicionCielo: 0.62,
    tinteCielo: "#000000",
    brilloAgua: 0.72,
    reflejoAgua: "#FFB070",
    halos: 0.55,
    nubes: "#FFD3BD",
    particulas: "#FFB040",
  },
  noche: {
    luz: [-24, 34, 26],
    colorLuz: "#A9BEFF",
    intensidadLuz: 1.1,
    sol: [10, -40, -60],
    astro: [-34, 21, -165],
    colorAstro: "#E5ECFF",
    cielo: "#46569C",
    suelo: "#1C2340",
    intensidadCielo: 1.05,
    niebla: "#141B3A",
    densidadNiebla: 0.0115,
    rayleigh: 0.2,
    turbiedad: 2,
    exposicionCielo: 0.06,
    tinteCielo: "#0D1542",
    brilloAgua: 0.32,
    reflejoAgua: "#BFD0FF",
    halos: 1,
    nubes: "#4C5A85",
    particulas: "#9CF0B8",
  },
};

/** Lleva un valor hacia su meta con la misma suavidad sin importar los cuadros por segundo. */
const paso = (dt: number) => 1 - Math.exp(-dt * 2.4);

/** Textura de nube en memoria: drei la bajaría de internet si no se le pasa una. */
function crearNube() {
  const lienzo = document.createElement("canvas");
  lienzo.width = 128;
  lienzo.height = 128;
  const ctx = lienzo.getContext("2d");
  if (ctx) {
    const degradado = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
    degradado.addColorStop(0, "rgba(255,255,255,0.95)");
    degradado.addColorStop(0.4, "rgba(255,255,255,0.6)");
    degradado.addColorStop(0.75, "rgba(255,255,255,0.14)");
    degradado.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = degradado;
    ctx.fillRect(0, 0, 128, 128);
  }
  return lienzo.toDataURL("image/png");
}

/** Pinta el suelo del valle: pasto con matices, senderos y arena del río. */
function crearTexturaSuelo(lado: number) {
  const lienzo = document.createElement("canvas");
  lienzo.width = lado;
  lienzo.height = lado;
  const ctx = lienzo.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(lienzo);

  const escala = lado / TAMANO_TERRENO;
  const px = (v: number) => (v + TAMANO_TERRENO / 2) * escala;

  ctx.fillStyle = "#62B04F";
  ctx.fillRect(0, 0, lado, lado);

  // Manchas de pasto: dan textura sin descargar imágenes.
  const verdes = ["#57A547", "#6FBB58", "#4E9A44", "#7CC45F", "#67B04C"];
  for (let i = 0; i < 2600; i++) {
    const x = (azar(i, 60) - 0.5) * 80;
    const z = (azar(i, 61) - 0.5) * 80;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = verdes[i % verdes.length];
    ctx.beginPath();
    ctx.ellipse(px(x), px(z), (0.5 + azar(i, 62) * 2.4) * escala, (0.3 + azar(i, 63) * 1.4) * escala, azar(i, 64) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Orillas de arena
  const orilla = ctx.createLinearGradient(px(RIO_X - 4.2), 0, px(RIO_X + 4.2), 0);
  orilla.addColorStop(0, "rgba(232,212,160,0)");
  orilla.addColorStop(0.24, "rgba(232,212,160,1)");
  orilla.addColorStop(0.76, "rgba(232,212,160,1)");
  orilla.addColorStop(1, "rgba(232,212,160,0)");
  ctx.fillStyle = orilla;
  ctx.fillRect(px(RIO_X - 4.2), 0, 8.4 * escala, lado);

  // Senderos de tierra: un borde suave y un centro más claro
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const trazar = (ancho: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = ancho * escala;
    for (const sendero of SENDEROS) {
      ctx.beginPath();
      sendero.forEach(([x, z], i) => (i ? ctx.lineTo(px(x), px(z)) : ctx.moveTo(px(x), px(z))));
      ctx.stroke();
    }
  };
  trazar(2.3, "rgba(141,112,66,0.45)");
  trazar(1.75, "#BE9F6B");
  trazar(1.2, "#CDB07D");

  // Plaza central donde se cruzan los senderos
  ctx.fillStyle = "#CDB07D";
  ctx.beginPath();
  ctx.ellipse(px(0), px(4), 2.3 * escala, 1.7 * escala, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hacia la cordillera el color lo pone la malla: aquí se desvanece a blanco.
  const fin = ctx.createRadialGradient(px(0), px(0), 29 * escala, px(0), px(0), 37 * escala);
  fin.addColorStop(0, "rgba(255,255,255,0)");
  fin.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = fin;
  ctx.fillRect(0, 0, lado, lado);

  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;
  return textura;
}

function crearTerreno() {
  const lados = 170;
  const geo = new THREE.PlaneGeometry(TAMANO_TERRENO, TAMANO_TERRENO, lados, lados);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colores = new Float32Array(pos.count * 3);
  const pasto = new THREE.Color("#3F8A45");
  const roca = new THREE.Color("#7F7A78");
  const rocaOscura = new THREE.Color("#5F5B5E");
  const nieve = new THREE.Color("#F6F8FC");
  const blanco = new THREE.Color("#FFFFFF");
  const color = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = calcularAlturaTerreno(x, z);
    pos.setY(i, y);

    const r = Math.hypot(x, z);
    const veta = Math.sin(x * 0.9 + z * 0.4) * 0.5 + Math.sin(z * 1.3 - x * 0.3) * 0.5;
    const limiteNieve = 12.5 + veta * 1.6;

    if (y > limiteNieve) color.copy(nieve);
    else if (y > 5.4 + veta) color.copy(roca).lerp(rocaOscura, 0.5 + veta * 0.5).lerp(nieve, Math.max(0, (y - limiteNieve + 2) / 2) * 0.6);
    else color.copy(pasto).lerp(roca, Math.max(0, (y - 3) / 3));

    // En el valle manda la textura pintada; la malla solo colorea la cordillera.
    color.lerp(blanco, 1 - Math.min(1, Math.max(0, (r - 29) / 8)));
    colores[i * 3] = color.r;
    colores[i * 3 + 1] = color.g;
    colores[i * 3 + 2] = color.b;
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colores, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Río con ondas, reflejo del sol y espuma donde el agua es poco profunda. */
function crearRio() {
  const geo = new THREE.PlaneGeometry(6.6, 72, 14, 110);
  geo.rotateX(-Math.PI / 2);
  geo.translate(RIO_X, NIVEL_AGUA, 0);

  const pos = geo.attributes.position;
  const profundidad = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    profundidad[i] = NIVEL_AGUA - calcularAlturaTerreno(pos.getX(i), pos.getZ(i));
  }
  geo.setAttribute("aProfundidad", new THREE.BufferAttribute(profundidad, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTiempo: { value: 0 },
      uSol: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
      uBrillo: { value: 1 },
      uReflejo: { value: new THREE.Color("#FFFFFF") },
      uHondo: { value: new THREE.Color("#1F7FB8") },
      uBajo: { value: new THREE.Color("#4FC4DC") },
      uNiebla: { value: new THREE.Color("#CFE6F5") },
      uDensidad: { value: 0.0058 },
    },
    vertexShader: `
      attribute float aProfundidad;
      uniform float uTiempo;
      varying vec3 vMundo;
      varying float vProfundidad;
      void main() {
        vec3 p = position;
        p.y += sin(p.x * 2.4 + uTiempo * 1.6) * 0.018 + cos(p.z * 1.2 + uTiempo * 1.1) * 0.022;
        vMundo = (modelMatrix * vec4(p, 1.0)).xyz;
        vProfundidad = aProfundidad;
        gl_Position = projectionMatrix * viewMatrix * vec4(vMundo, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTiempo;
      uniform vec3 uSol;
      uniform float uBrillo;
      uniform vec3 uReflejo;
      uniform vec3 uHondo;
      uniform vec3 uBajo;
      uniform vec3 uNiebla;
      uniform float uDensidad;
      varying vec3 vMundo;
      varying float vProfundidad;
      void main() {
        vec2 p = vMundo.xz;
        float a = sin(p.x * 3.1 + p.y * 1.3 + uTiempo * 1.5);
        float b = sin(p.x * 1.7 - p.y * 2.3 - uTiempo * 1.1);
        float c = sin(p.y * 4.6 + uTiempo * 2.2) * 0.5;
        vec3 normal = normalize(vec3((a + c) * 0.09, 1.0, (b + c) * 0.09));
        vec3 vista = normalize(cameraPosition - vMundo);
        float reflejo = pow(max(dot(normal, normalize(uSol + vista)), 0.0), 120.0);
        float fresnel = pow(1.0 - max(dot(normal, vista), 0.0), 3.0);

        vec3 color = mix(uBajo, uHondo, smoothstep(0.05, 0.62, vProfundidad));
        color += uReflejo * (reflejo * 0.9 + fresnel * 0.18);
        float espuma = 1.0 - smoothstep(0.02, 0.17, vProfundidad + a * 0.022);
        color = mix(color, vec3(1.0), espuma * 0.75);
        color *= uBrillo;

        float distancia = length(cameraPosition - vMundo);
        float niebla = 1.0 - exp(-uDensidad * uDensidad * distancia * distancia);
        gl_FragColor = vec4(mix(color, uNiebla, niebla), 0.94);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  return { geo, material };
}

/** Material con viento en el vértice: mover 100 árboles así no le cuesta nada al procesador. */
function crearMaterialViento() {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uViento = VIENTO;
    shader.vertexShader = `uniform float uViento;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      float alturaHoja = max(position.y - 0.8, 0.0);
      float fase = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.5;
      transformed.x += sin(uViento * 1.3 + fase) * 0.04 * alturaHoja;
      transformed.z += cos(uViento * 1.05 + fase) * 0.03 * alturaHoja;`,
    );
  };
  material.customProgramCacheKey = () => "valle-viento";
  return material;
}

function crearPino() {
  const o = new Obra();
  o.cilindro(0.16, 0.26, 1.2, 6, "#5A3A22", [0, 0.6, 0]);
  o.cono(1.45, 1.9, 8, "#1F6B40", [0, 1.95, 0]);
  o.cono(1.15, 1.7, 8, "#27804C", [0, 3, 0]);
  o.cono(0.82, 1.5, 8, "#2F9358", [0, 3.95, 0]);
  o.cono(0.46, 1.1, 8, "#3AA565", [0, 4.8, 0]);
  return o.geometria();
}

function crearArbol() {
  const o = new Obra();
  o.cilindro(0.17, 0.28, 1.5, 7, "#6B4427", [0, 0.75, 0]);
  o.cilindro(0.06, 0.1, 0.9, 5, "#6B4427", [0.32, 1.65, 0.1], [0, 0, -0.7]);
  o.esfera(1.05, "#3E9E4C", [0, 2.35, 0], [1.15, 0.95, 1.1]);
  o.esfera(0.78, "#4DB25A", [0.72, 2.75, 0.3]);
  o.esfera(0.72, "#338A41", [-0.68, 2.6, -0.32]);
  o.esfera(0.62, "#57BE63", [0.05, 3.15, 0.34]);
  o.esfera(0.56, "#3E9E4C", [-0.25, 2.25, 0.74]);
  return o.geometria();
}

function crearArbusto() {
  const o = new Obra();
  o.esfera(0.55, "#3F9A4C", [0, 0.42, 0], [1.2, 0.85, 1]);
  o.esfera(0.4, "#4FB05B", [0.42, 0.36, 0.14]);
  o.esfera(0.36, "#338A41", [-0.4, 0.32, -0.12]);
  return o.geometria();
}

function crearRoca() {
  const o = new Obra();
  o.agregar(new THREE.DodecahedronGeometry(0.75, 0), "#8E949C", [0, 0.3, 0], [0.3, 0.5, 0.2], [1.2, 0.72, 0.95]);
  o.agregar(new THREE.DodecahedronGeometry(0.38, 0), "#A3A8AF", [0.58, 0.14, 0.26], [0.8, 0.2, 0.1], [1, 0.75, 1]);
  return o.geometria();
}

function crearFlor() {
  const o = new Obra();
  for (let i = 0; i < 3; i++) {
    const x = (azar(i, 70) - 0.5) * 0.42;
    const z = (azar(i, 71) - 0.5) * 0.42;
    o.cilindro(0.012, 0.016, 0.26, 4, "#DDF2C9", [x, 0.13, z]);
    o.esfera(0.075, "#FFFFFF", [x, 0.28, z], [1, 0.7, 1], 0);
  }
  return o.geometria();
}

function crearMatoja() {
  const o = new Obra();
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    o.cono(0.055, 0.36, 3, i % 2 ? "#5FAE4E" : "#78C260", [Math.cos(ang) * 0.1, 0.16, Math.sin(ang) * 0.1], [Math.sin(ang) * 0.3, 0, Math.cos(ang) * 0.3]);
  }
  return o.geometria();
}

function crearLosa() {
  const o = new Obra();
  o.cilindro(0.34, 0.38, 0.07, 7, "#FFFFFF", [0, 0, 0]);
  return o.geometria();
}

interface Instancia {
  x: number;
  y: number;
  z: number;
  escala: number | [number, number, number];
  giro: number;
  color?: string;
}

/** Muchas copias de un modelo en una sola llamada de dibujo. */
function Coleccion({
  geometria,
  material,
  items,
  sombra,
}: {
  geometria: THREE.BufferGeometry;
  material: THREE.Material;
  items: Instancia[];
  sombra: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const malla = ref.current;
    if (!malla) return;
    const objeto = new THREE.Object3D();
    const color = new THREE.Color();
    items.forEach((item, i) => {
      objeto.position.set(item.x, item.y, item.z);
      objeto.rotation.set(0, item.giro, 0);
      if (typeof item.escala === "number") objeto.scale.setScalar(item.escala);
      else objeto.scale.set(...item.escala);
      objeto.updateMatrix();
      malla.setMatrixAt(i, objeto.matrix);
      malla.setColorAt(i, color.set(item.color ?? "#FFFFFF"));
    });
    malla.instanceMatrix.needsUpdate = true;
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
  }, [items]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometria, material, items.length]}
      castShadow={sombra}
      receiveShadow={sombra}
      frustumCulled={false}
    />
  );
}

/** Reparte la vegetación sin tapar senderos, puertas, edificios ni personajes. */
function sembrar() {
  const pinos: Instancia[] = [];
  const arboles: Instancia[] = [];
  const arbustos: Instancia[] = [];
  const rocas: Instancia[] = [];
  const flores: Instancia[] = [];
  const matojas: Instancia[] = [];
  const losas: Instancia[] = [];

  const tonos = ["#FFFFFF", "#E8F5D8", "#D6EBC4", "#F5F7D8"];

  // Bosque en las faldas de la cordillera
  for (let i = 0; pinos.length < 110 && i < 500; i++) {
    const ang = azar(i, 2) * Math.PI * 2;
    const r = 24 + azar(i, 3) * 19;
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    const y = calcularAlturaTerreno(x, z);
    if (y > 8 || !hayEspacioLibre(x, z, 1.6) || distanciaASendero(x, z) < 2) continue;
    pinos.push({ x, y: y - 0.1, z, escala: 0.75 + azar(i, 4) * 0.7, giro: azar(i, 5) * 6.3, color: tonos[i % tonos.length] });
  }

  // Árboles de copa redonda, lejos del centro para no tapar al explorador
  for (let i = 0; arboles.length < 44 && i < 500; i++) {
    const ang = azar(i, 6) * Math.PI * 2;
    const r = 12 + azar(i, 7) * 16;
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    if (z > 0 && z < 23 && Math.abs(x) < 19) continue;
    if (!hayEspacioLibre(x, z, 1.8) || distanciaASendero(x, z) < 2.6) continue;
    arboles.push({ x, y: calcularAlturaTerreno(x, z) - 0.05, z, escala: 0.8 + azar(i, 8) * 0.5, giro: azar(i, 9) * 6.3, color: tonos[i % tonos.length] });
  }

  for (let i = 0; arbustos.length < 56 && i < 500; i++) {
    const ang = azar(i, 10) * Math.PI * 2;
    const r = 6 + azar(i, 11) * 21;
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    if (!hayEspacioLibre(x, z, 0.7) || distanciaASendero(x, z) < 1.5) continue;
    arbustos.push({ x, y: calcularAlturaTerreno(x, z), z, escala: 0.65 + azar(i, 12) * 0.6, giro: azar(i, 13) * 6.3, color: tonos[i % tonos.length] });
  }

  // Rocas en la orilla, fuera del puente
  for (let i = 0; rocas.length < 34 && i < 300; i++) {
    const lado = azar(i, 14) > 0.5 ? 1 : -1;
    const x = RIO_X + lado * (2.1 + azar(i, 15) * 1.6);
    const z = (azar(i, 16) - 0.5) * 54;
    if (Math.abs(z) < 3.6) continue;
    rocas.push({ x, y: calcularAlturaTerreno(x, z) - 0.05, z, escala: 0.4 + azar(i, 17) * 0.75, giro: azar(i, 18) * 6.3 });
  }
  for (let i = 0; i < 16; i++) {
    const ang = azar(i, 19) * Math.PI * 2;
    const r = 20 + azar(i, 72) * 9;
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    if (hayEspacioLibre(x, z, 1)) rocas.push({ x, y: calcularAlturaTerreno(x, z) - 0.05, z, escala: 0.6 + azar(i, 73), giro: azar(i, 74) * 6.3 });
  }

  const coloresFlor = ["#FFD24A", "#FF7D6B", "#E05CA6", "#FFFFFF", "#A77BF3", "#FFA53D"];
  for (let i = 0; flores.length < 130 && i < 700; i++) {
    const x = (azar(i, 20) - 0.5) * 50;
    const z = (azar(i, 21) - 0.5) * 50;
    if (Math.hypot(x, z) > 25 || !hayEspacioLibre(x, z, 0.3) || distanciaASendero(x, z) < 1.2) continue;
    flores.push({ x, y: calcularAlturaTerreno(x, z), z, escala: 0.8 + azar(i, 22) * 0.7, giro: azar(i, 23) * 6.3, color: coloresFlor[i % coloresFlor.length] });
  }

  for (let i = 0; matojas.length < 320 && i < 1200; i++) {
    const x = (azar(i, 24) - 0.5) * 56;
    const z = (azar(i, 25) - 0.5) * 56;
    if (Math.hypot(x, z) > 27 || !hayEspacioLibre(x, z, 0.1) || distanciaASendero(x, z) < 1.1) continue;
    matojas.push({ x, y: calcularAlturaTerreno(x, z), z, escala: 0.8 + azar(i, 26) * 0.9, giro: azar(i, 27) * 6.3 });
  }

  // Lajas de piedra a los lados del sendero
  const tonosLaja = ["#D9D2C3", "#C9C1B1", "#E4DDCF", "#BDB5A5"];
  let n = 0;
  for (const sendero of SENDEROS) {
    for (let i = 1; i < sendero.length - 1; i += 1) {
      const [ax, az] = sendero[i - 1];
      const [bx, bz] = sendero[i + 1];
      const largo = Math.hypot(bx - ax, bz - az) || 1;
      const lado = (azar(n, 28) - 0.5) * 1.5;
      const x = sendero[i][0] + (-(bz - az) / largo) * lado;
      const z = sendero[i][1] + ((bx - ax) / largo) * lado;
      n += 1;
      if (azar(n, 29) > 0.62) continue;
      const tam = 0.7 + azar(n, 30) * 0.8;
      losas.push({ x, y: calcularAlturaTerreno(x, z) + 0.035, z, escala: [tam, 1, tam * (0.7 + azar(n, 31) * 0.4)], giro: azar(n, 32) * 6.3, color: tonosLaja[n % tonosLaja.length] });
    }
  }

  return { pinos, arboles, arbustos, rocas, flores, matojas, losas };
}

/** Halos cálidos de faroles y puente en un solo dibujo; se encienden al caer la tarde. */
function crearHalos() {
  const posiciones: number[] = [];
  for (const [x, z] of FAROLES) posiciones.push(x, calcularAlturaTerreno(x, z) + 2.26, z);
  for (const x of [-3, 3]) for (const z of [-1.72, 1.72]) posiciones.push(RIO_X + x, 1.86, z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(posiciones, 3));

  const lienzo = document.createElement("canvas");
  lienzo.width = 64;
  lienzo.height = 64;
  const ctx = lienzo.getContext("2d");
  if (ctx) {
    const degradado = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    degradado.addColorStop(0, "rgba(255,214,140,1)");
    degradado.addColorStop(0.3, "rgba(255,190,100,0.45)");
    degradado.addColorStop(1, "rgba(255,170,70,0)");
    ctx.fillStyle = degradado;
    ctx.fillRect(0, 0, 64, 64);
  }
  const material = new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(lienzo),
    size: 3.2,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  return { geo, material };
}

function ValleEntornoBase({ clima, calidad, prefersReducedMotion }: Props) {
  const alta = calidad === "alta";
  const ambiente = AMBIENTES[clima];

  const texturaNube = useMemo(() => crearNube(), []);
  const terreno = useMemo(() => crearTerreno(), []);
  const sueloTextura = useMemo(() => crearTexturaSuelo(alta ? 2048 : 1024), [alta]);
  const rio = useMemo(() => crearRio(), []);
  const halos = useMemo(() => crearHalos(), []);
  const siembra = useMemo(() => sembrar(), []);

  const materialViento = useMemo(() => crearMaterialViento(), []);
  const materialPlano = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true }), []);
  const materialLaja = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), []);

  const modelos = useMemo(
    () => ({
      pino: crearPino(),
      arbol: crearArbol(),
      arbusto: crearArbusto(),
      roca: crearRoca(),
      flor: crearFlor(),
      matoja: crearMatoja(),
      losa: crearLosa(),
    }),
    [],
  );

  const cieloRef = useRef<ComponentRef<typeof Sky>>(null);
  const solRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const astroRef = useRef<THREE.Mesh>(null);
  const nieblaRef = useRef<THREE.FogExp2>(null);
  const nubesRef = useRef<THREE.Group>(null);
  const rioRef = useRef<THREE.Mesh>(null);
  const halosRef = useRef<THREE.Points>(null);

  useLayoutEffect(() => {
    const material = cieloRef.current?.material;
    if (!material || material.uniforms.uExposicion) return;
    material.uniforms.uExposicion = { value: AMBIENTES.dia.exposicionCielo };
    material.uniforms.uTinte = { value: new THREE.Color("#000000") };
    material.fragmentShader = `uniform float uExposicion;\nuniform vec3 uTinte;\n${material.fragmentShader}`.replace(
      "gl_FragColor = vec4( retColor, 1.0 );",
      "gl_FragColor = vec4( retColor * uExposicion + uTinte, 1.0 );",
    );
    material.needsUpdate = true;
  }, []);

  const metas = useMemo(
    () => ({
      luz: new THREE.Vector3(...ambiente.luz),
      colorLuz: new THREE.Color(ambiente.colorLuz),
      sol: new THREE.Vector3(...ambiente.sol),
      astro: new THREE.Vector3(...ambiente.astro),
      colorAstro: new THREE.Color(ambiente.colorAstro),
      cielo: new THREE.Color(ambiente.cielo),
      suelo: new THREE.Color(ambiente.suelo),
      niebla: new THREE.Color(ambiente.niebla),
      reflejo: new THREE.Color(ambiente.reflejoAgua),
      tinte: new THREE.Color(ambiente.tinteCielo),
    }),
    [ambiente],
  );

  useFrame((state, dt) => {
    const k = paso(Math.min(dt, 0.1));
    const lerp = THREE.MathUtils.lerp;

    if (solRef.current) {
      solRef.current.position.lerp(metas.luz, k);
      solRef.current.color.lerp(metas.colorLuz, k);
      solRef.current.intensity = lerp(solRef.current.intensity, ambiente.intensidadLuz, k);
    }
    if (hemiRef.current) {
      hemiRef.current.color.lerp(metas.cielo, k);
      hemiRef.current.groundColor.lerp(metas.suelo, k);
      hemiRef.current.intensity = lerp(hemiRef.current.intensity, ambiente.intensidadCielo, k);
    }
    if (astroRef.current) {
      astroRef.current.position.lerp(metas.astro, k);
      (astroRef.current.material as THREE.MeshBasicMaterial).color.lerp(metas.colorAstro, k);
    }
    if (nieblaRef.current) {
      nieblaRef.current.color.lerp(metas.niebla, k);
      nieblaRef.current.density = lerp(nieblaRef.current.density, ambiente.densidadNiebla, k);
    }
    if (cieloRef.current) {
      const u = cieloRef.current.material.uniforms;
      (u.sunPosition.value as THREE.Vector3).lerp(metas.sol, k);
      u.rayleigh.value = lerp(u.rayleigh.value, ambiente.rayleigh, k);
      u.turbidity.value = lerp(u.turbidity.value, ambiente.turbiedad, k);
      u.uExposicion.value = lerp(u.uExposicion.value, ambiente.exposicionCielo, k);
      (u.uTinte.value as THREE.Color).lerp(metas.tinte, k);
    }
    if (rioRef.current) {
      const u = (rioRef.current.material as THREE.ShaderMaterial).uniforms;
      if (!prefersReducedMotion) u.uTiempo.value = state.clock.elapsedTime;
      (u.uSol.value as THREE.Vector3).copy(solRef.current?.position ?? metas.luz).normalize();
      u.uBrillo.value = lerp(u.uBrillo.value, ambiente.brilloAgua, k);
      (u.uReflejo.value as THREE.Color).lerp(metas.reflejo, k);
      (u.uNiebla.value as THREE.Color).lerp(metas.niebla, k);
      u.uDensidad.value = lerp(u.uDensidad.value, ambiente.densidadNiebla, k);
    }
    if (halosRef.current) {
      const m = halosRef.current.material as THREE.PointsMaterial;
      m.opacity = lerp(m.opacity, ambiente.halos, k);
      halosRef.current.visible = m.opacity > 0.02;
    }

    if (!prefersReducedMotion) {
      VIENTO.value = state.clock.elapsedTime;
      if (nubesRef.current) {
        nubesRef.current.position.x += dt * 0.4;
        if (nubesRef.current.position.x > 44) nubesRef.current.position.x = -44;
      }
    }
  });

  return (
    <>
      <fogExp2 ref={nieblaRef} attach="fog" args={[AMBIENTES.dia.niebla, AMBIENTES.dia.densidadNiebla]} />

      {/* El sol del cielo se mueve desde useFrame para que el cambio de hora sea suave. */}
      <Sky
        ref={cieloRef}
        distance={450000}
        sunPosition={AMBIENTES.dia.sol}
        turbidity={AMBIENTES.dia.turbiedad}
        rayleigh={AMBIENTES.dia.rayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.82}
      />
      {clima === "noche" ? <Stars radius={150} depth={40} count={1400} factor={5} saturation={0} fade speed={prefersReducedMotion ? 0 : 0.6} /> : null}

      <mesh ref={astroRef} position={AMBIENTES.dia.astro}>
        <sphereGeometry args={[6.5, 24, 16]} />
        <meshBasicMaterial color={AMBIENTES.dia.colorAstro} fog={false} toneMapped={false} />
      </mesh>

      <hemisphereLight ref={hemiRef} args={[AMBIENTES.dia.cielo, AMBIENTES.dia.suelo, AMBIENTES.dia.intensidadCielo]} />
      <directionalLight
        ref={solRef}
        position={AMBIENTES.dia.luz}
        intensity={AMBIENTES.dia.intensidadLuz}
        color={AMBIENTES.dia.colorLuz}
        castShadow={alta}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={130}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
      />

      <mesh geometry={terreno} receiveShadow={alta}>
        <meshStandardMaterial key={alta ? "alta" : "ligera"} map={sueloTextura} vertexColors roughness={0.95} />
      </mesh>

      <mesh ref={rioRef} geometry={rio.geo} material={rio.material} />

      <Coleccion geometria={modelos.pino} material={materialViento} items={siembra.pinos} sombra={alta} />
      <Coleccion geometria={modelos.arbol} material={materialViento} items={siembra.arboles} sombra={alta} />
      <Coleccion geometria={modelos.arbusto} material={materialViento} items={siembra.arbustos} sombra={false} />
      <Coleccion geometria={modelos.roca} material={materialPlano} items={siembra.rocas} sombra={alta} />
      <Coleccion geometria={modelos.flor} material={materialPlano} items={siembra.flores} sombra={false} />
      <Coleccion geometria={modelos.matoja} material={materialPlano} items={siembra.matojas} sombra={false} />
      <Coleccion geometria={modelos.losa} material={materialLaja} items={siembra.losas} sombra={false} />

      <points ref={halosRef} geometry={halos.geo} material={halos.material} />

      {/* Las nubes van al fondo, donde la cámara alcanza a verlas sobre la cordillera. */}
      <group ref={nubesRef}>
        <Clouds texture={texturaNube} limit={110} material={THREE.MeshBasicMaterial}>
          {[
            [-34, 21, -100, 1],
            [8, 25, -112, 2],
            [44, 20, -96, 3],
            [-62, 26, -120, 4],
          ].map(([x, y, z, semilla]) => (
            <Cloud
              key={semilla}
              seed={semilla}
              position={[x, y, z]}
              segments={alta ? 24 : 14}
              bounds={[15, 2.2, 4]}
              volume={15}
              growth={5}
              fade={0}
              speed={0}
              color={ambiente.nubes}
              opacity={clima === "noche" ? 0.35 : 0.9}
            />
          ))}
        </Clouds>
      </group>

      {alta && !prefersReducedMotion ? (
        <Sparkles
          count={60}
          scale={[44, 5, 34]}
          position={[0, 2.6, -2]}
          size={clima === "dia" ? 2.4 : 3.8}
          speed={0.5}
          color={ambiente.particulas}
          opacity={clima === "dia" ? 0.5 : 0.95}
        />
      ) : null}
    </>
  );
}

// Solo cambia con la hora o la calidad: caminar no vuelve a dibujar todo el entorno en React.
export const ValleEntorno = memo(ValleEntornoBase);
