"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Obra } from "../valle/valleObra";
import { PLANETAS, RADIO_SOL, type IdPlaneta } from "./espacioData";

// Sol, planetas, galaxia y cohete de Piloto Espacial y Ordena los Planetas.
// Todo se genera en memoria: no descarga nada y funciona sin conexión.

// -----------------------------------------------------------------------------
// RUIDO DETERMINISTA
// -----------------------------------------------------------------------------

function crearPrng(semilla = 123456789) {
  let s = semilla >>> 0;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

const PERM = new Uint8Array(512);
{
  const prng = crearPrng(987654321);
  for (let i = 0; i < 256; i++) PERM[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = PERM[i];
    PERM[i] = PERM[j];
    PERM[j] = temp;
  }
  for (let i = 0; i < 256; i++) PERM[256 + i] = PERM[i];
}

function gradiente(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

const curva = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ruido en 3D: se evalúa sobre la esfera, así la textura no tiene costura ni se repite en espejo. */
function ruido(x: number, y: number, z: number) {
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const fz = Math.floor(z);
  const X = fx & 255;
  const Y = fy & 255;
  const Z = fz & 255;
  const dx = x - fx;
  const dy = y - fy;
  const dz = z - fz;
  const u = curva(dx);
  const v = curva(dy);
  const w = curva(dz);
  const A = PERM[X] + Y;
  const B = PERM[X + 1] + Y;
  const AA = PERM[A] + Z;
  const AB = PERM[A + 1] + Z;
  const BA = PERM[B] + Z;
  const BB = PERM[B + 1] + Z;
  return lerp(
    lerp(
      lerp(gradiente(PERM[AA], dx, dy, dz), gradiente(PERM[BA], dx - 1, dy, dz), u),
      lerp(gradiente(PERM[AB], dx, dy - 1, dz), gradiente(PERM[BB], dx - 1, dy - 1, dz), u),
      v,
    ),
    lerp(
      lerp(gradiente(PERM[AA + 1], dx, dy, dz - 1), gradiente(PERM[BA + 1], dx - 1, dy, dz - 1), u),
      lerp(gradiente(PERM[AB + 1], dx, dy - 1, dz - 1), gradiente(PERM[BB + 1], dx - 1, dy - 1, dz - 1), u),
      v,
    ),
    w,
  );
}

const limitar = (t: number) => Math.max(0, Math.min(1, t));

/** Ruido fractal entre 0 y 1, con media 0,5. El ruido crudo gira alrededor de 0. */
function fractal(x: number, y: number, z: number, octavas = 4) {
  let valor = 0;
  let amplitud = 0.5;
  let frecuencia = 1;
  let total = 0;
  for (let o = 0; o < octavas; o++) {
    valor += ruido(x * frecuencia, y * frecuencia, z * frecuencia) * amplitud;
    total += amplitud;
    amplitud *= 0.5;
    frecuencia *= 2;
  }
  return limitar(0.5 + (valor / total) * 1.35);
}

const suave = (a: number, b: number, x: number) => {
  const t = limitar((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type RGB = [number, number, number];

const mezcla = (a: RGB, b: RGB, t: number): RGB => {
  const k = limitar(t);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};

// -----------------------------------------------------------------------------
// TEXTURAS DE PLANETAS
// -----------------------------------------------------------------------------

const ANCHO_TEXTURA = 384;
const ALTO_TEXTURA = 192;

type Punto = { x: number; y: number; z: number; lat: number; u: number; v: number };

/** Óvalo sobre la textura: devuelve 1 en el centro y 0 afuera. */
function ovalo(p: Punto, u: number, v: number, ancho: number, alto: number) {
  const d = ((p.u - u) / ancho) ** 2 + ((p.v - v) / alto) ** 2;
  return d < 1 ? 1 - Math.sqrt(d) : 0;
}

const PINTORES: Record<IdPlaneta, (p: Punto) => RGB> = {
  mercurio: ({ x, y, z }) => mezcla([92, 88, 84], [182, 176, 168], fractal(x * 3, y * 3, z * 3, 4)),
  venus: ({ x, y, z }) => {
    const giro = fractal(x * 2, y * 2, z * 2, 3);
    return mezcla([198, 132, 56], [252, 226, 164], fractal(x * 2.4 + giro * 2.4, y * 5 + giro * 2, z * 2.4, 4));
  },
  tierra: ({ x, y, z, lat }) => {
    const n = fractal(x * 1.7 + 4, y * 1.7, z * 1.7, 6);
    const polo = Math.abs(lat) / (Math.PI / 2);
    if (polo + (n - 0.5) * 0.18 > 0.86) return [244, 249, 255];
    if (n < 0.53) return mezcla([12, 44, 112], [38, 116, 196], suave(0.3, 0.53, n));
    const seco = suave(0.1, 0.32, 1 - Math.abs(polo - 0.28) * 3.2);
    const verde = mezcla([44, 138, 72], [112, 158, 74], suave(0.53, 0.68, n));
    return mezcla(verde, [206, 170, 104], seco * suave(0.56, 0.66, n));
  },
  marte: ({ x, y, z, lat }) => {
    const polo = Math.abs(lat) / (Math.PI / 2);
    const n = fractal(x * 2.4, y * 2.4, z * 2.4, 5);
    if (polo + (n - 0.5) * 0.12 > 0.9) return [246, 240, 234];
    const base = mezcla([168, 66, 32], [232, 132, 78], n);
    const canon = 1 - Math.abs(fractal(x * 3 + 7, y * 7, z * 3, 3) - 0.5) * 16;
    return mezcla(base, [104, 40, 26], limitar(canon) * suave(0.5, 0.2, polo) * 0.75);
  },
  jupiter: (p) => {
    const { x, y, z, lat } = p;
    const onda = (fractal(x * 3, y * 11, z * 3, 3) - 0.5) * 0.2;
    const franja = Math.sin((lat + onda) * 11);
    const tono = mezcla([176, 98, 52], [246, 228, 200], suave(-0.45, 0.45, franja));
    const fino = (fractal(x * 5, y * 30, z * 5, 2) - 0.5) * 0.45;
    const base = mezcla(tono, fino > 0 ? [255, 244, 224] : [128, 70, 40], Math.abs(fino));
    return mezcla(base, [204, 66, 38], suave(0, 0.42, ovalo(p, 0.3, 0.64, 0.07, 0.06)));
  },
  saturno: ({ x, y, z, lat }) => {
    const onda = (fractal(x * 2, y * 9, z * 2, 2) - 0.5) * 0.14;
    return mezcla([206, 170, 112], [246, 232, 186], suave(-0.8, 0.8, Math.sin((lat + onda) * 9)));
  },
  urano: ({ x, y, z, lat }) => {
    const n = fractal(x * 1.6, y * 5, z * 1.6, 2);
    return mezcla([116, 212, 214], [190, 244, 240], Math.abs(lat) * 0.5 + (n - 0.5) * 0.35);
  },
  neptuno: (p) => {
    const { x, y, z } = p;
    const base = mezcla([22, 54, 158], [62, 128, 238], fractal(x * 2, y * 5, z * 2, 4));
    const viento = suave(0.6, 0.76, fractal(x * 3, y * 15, z * 3, 3));
    const nubes = mezcla(base, [228, 240, 255], viento * 0.75);
    return mezcla(nubes, [12, 28, 88], suave(0, 0.4, ovalo(p, 0.3, 0.6, 0.075, 0.07)));
  },
};

function nuevoLienzo(ancho: number, alto: number) {
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  return { lienzo, ctx: lienzo.getContext("2d") };
}

function aTextura(lienzo: HTMLCanvasElement, repetir = false) {
  const tex = new THREE.CanvasTexture(lienzo);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repetir) tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** Recorre la esfera en la proyección de la textura. La fila 0 del lienzo es el polo norte. */
function recorrerEsfera(ctx: CanvasRenderingContext2D, pintar: (p: Punto) => [number, number, number, number]) {
  const imagen = ctx.createImageData(ANCHO_TEXTURA, ALTO_TEXTURA);
  for (let fila = 0; fila < ALTO_TEXTURA; fila++) {
    const v = (fila + 0.5) / ALTO_TEXTURA;
    const lat = (0.5 - v) * Math.PI;
    const cosLat = Math.cos(lat);
    const y = Math.sin(lat);
    for (let col = 0; col < ANCHO_TEXTURA; col++) {
      const u = (col + 0.5) / ANCHO_TEXTURA;
      const lon = u * Math.PI * 2;
      const color = pintar({ x: cosLat * Math.sin(lon), y, z: cosLat * Math.cos(lon), lat, u, v });
      const i = (fila * ANCHO_TEXTURA + col) * 4;
      imagen.data[i] = color[0];
      imagen.data[i + 1] = color[1];
      imagen.data[i + 2] = color[2];
      imagen.data[i + 3] = color[3];
    }
  }
  ctx.putImageData(imagen, 0, 0);
}

/** Cráteres de Mercurio: anillo claro con centro oscuro. */
function pintarCrateres(ctx: CanvasRenderingContext2D) {
  const prng = crearPrng(5151);
  for (let i = 0; i < 44; i++) {
    const cx = prng() * ANCHO_TEXTURA;
    const cy = 28 + prng() * (ALTO_TEXTURA - 56);
    const r = 2.5 + prng() * prng() * 12;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(52, 48, 46, 0.5)";
    ctx.fill();
    ctx.lineWidth = Math.max(1, r * 0.22);
    ctx.strokeStyle = "rgba(226, 220, 210, 0.55)";
    ctx.stroke();
  }
}

function crearTexturaPlaneta(id: IdPlaneta) {
  const { lienzo, ctx } = nuevoLienzo(ANCHO_TEXTURA, ALTO_TEXTURA);
  if (!ctx) return aTextura(lienzo, true);
  const pintor = PINTORES[id];
  recorrerEsfera(ctx, (p) => {
    const [r, g, b] = pintor(p);
    return [r, g, b, 255];
  });
  if (id === "mercurio") pintarCrateres(ctx);
  const tex = aTextura(lienzo, true);
  tex.anisotropy = 4;
  return tex;
}

function crearTexturaNubes() {
  const { lienzo, ctx } = nuevoLienzo(ANCHO_TEXTURA, ALTO_TEXTURA);
  if (!ctx) return aTextura(lienzo, true);
  recorrerEsfera(ctx, ({ x, y, z }) => [255, 255, 255, suave(0.54, 0.72, fractal(x * 2.6, y * 4.4, z * 2.6, 4)) * 235]);
  return aTextura(lienzo, true);
}

function crearTexturaAnillos() {
  const { lienzo, ctx } = nuevoLienzo(256, 1);
  if (!ctx) return aTextura(lienzo);
  const imagen = ctx.createImageData(256, 1);
  for (let x = 0; x < 256; x++) {
    const t = x / 255; // del borde interior al exterior
    const cassini = t > 0.68 && t < 0.75;
    const brillo = 0.72 + Math.sin(t * 38) * 0.14 + Math.sin(t * 91) * 0.08;
    const color = mezcla([190, 158, 112], [246, 232, 196], brillo);
    imagen.data[x * 4] = color[0];
    imagen.data[x * 4 + 1] = color[1];
    imagen.data[x * 4 + 2] = color[2];
    imagen.data[x * 4 + 3] = cassini ? 18 : suave(0, 0.05, t) * suave(1, 0.95, t) * brillo * 245;
  }
  ctx.putImageData(imagen, 0, 0);
  return aTextura(lienzo);
}

/** Corona del Sol con rayos: el degradado termina en amarillo pálido para no dejar un borde marrón. */
function crearTexturaCorona() {
  const S = 256;
  const { lienzo, ctx } = nuevoLienzo(S, S);
  if (!ctx) return aTextura(lienzo);
  const c = S / 2;
  const degradado = ctx.createRadialGradient(c, c, S * 0.2, c, c, S * 0.5);
  degradado.addColorStop(0, "rgba(255, 236, 150, 0.95)");
  degradado.addColorStop(0.22, "rgba(255, 214, 96, 0.5)");
  degradado.addColorStop(0.55, "rgba(255, 226, 150, 0.12)");
  degradado.addColorStop(1, "rgba(255, 236, 190, 0)");
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, S, S);

  const prng = crearPrng(2024);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 46; i++) {
    const a = prng() * Math.PI * 2;
    const largo = S * (0.32 + prng() * 0.15);
    const rayo = ctx.createLinearGradient(c, c, c + Math.cos(a) * largo, c + Math.sin(a) * largo);
    rayo.addColorStop(0.5, "rgba(255, 224, 130, 0.3)");
    rayo.addColorStop(1, "rgba(255, 224, 130, 0)");
    ctx.strokeStyle = rayo;
    ctx.lineWidth = 1 + prng() * 2.5;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(c + Math.cos(a) * largo, c + Math.sin(a) * largo);
    ctx.stroke();
  }
  return aTextura(lienzo);
}

/** Punto redondo y difuso: sin esto, cada estrella de la galaxia se dibuja como un cuadrado. */
function crearTexturaBrillo() {
  const S = 64;
  const { lienzo, ctx } = nuevoLienzo(S, S);
  if (!ctx) return aTextura(lienzo);
  const degradado = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  degradado.addColorStop(0, "rgba(255, 255, 255, 1)");
  degradado.addColorStop(0.3, "rgba(255, 255, 255, 0.5)");
  degradado.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, S, S);
  return aTextura(lienzo);
}

// Cada textura se crea una sola vez y se comparte entre Piloto y Ordena.
const TEXTURAS = new Map<string, THREE.CanvasTexture>();

function textura(clave: string, crear: () => THREE.CanvasTexture) {
  const existente = TEXTURAS.get(clave);
  if (existente) return existente;
  const nueva = crear();
  TEXTURAS.set(clave, nueva);
  return nueva;
}

// Pintar un planeta tarda decenas de milisegundos, y mucho más en un celular. Se pintan de a uno y
// con pausas para que la pantalla no se congele al entrar: mientras tanto se ve el color del planeta.
const COLA: Array<() => void> = [];
let colaActiva = false;

function atenderCola() {
  const tarea = COLA.shift();
  if (!tarea) {
    colaActiva = false;
    return;
  }
  tarea();
  setTimeout(atenderCola, 24);
}

function encolar(tarea: () => void) {
  COLA.push(tarea);
  if (!colaActiva) {
    colaActiva = true;
    setTimeout(atenderCola, 0);
  }
}

function useTexturaDiferida(clave: string | null, crear: () => THREE.CanvasTexture) {
  const [, avisar] = useState(0);
  const fabrica = useRef(crear);

  useEffect(() => {
    if (!clave || TEXTURAS.has(clave)) return;
    let vigente = true;
    encolar(() => {
      if (!vigente) return;
      textura(clave, fabrica.current);
      avisar((n) => n + 1);
    });
    return () => {
      vigente = false;
    };
  }, [clave]);

  return clave ? (TEXTURAS.get(clave) ?? null) : null;
}

// -----------------------------------------------------------------------------
// SHADERS
// -----------------------------------------------------------------------------

const VERT_ATMOSFERA = `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

// Se dibuja la cara trasera de la esfera: ahí la normal apunta en contra de la vista, por eso el
// signo. El brillo nace fuerte junto al planeta y llega a cero en el borde, sin aro marcado.
const FRAG_ATMOSFERA = `
uniform vec3 uColor;
uniform float uPower;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float cercania = clamp(-dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
  gl_FragColor = vec4(uColor, pow(cercania, uPower) * 0.95);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const VERT_SOL = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDir;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

const FRAG_SOL = `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDir;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec3 p = normalize(vPosition);
  float t = uTime * 0.18;
  float n1 = snoise(p * 3.5 + vec3(0.0, t, 0.0));
  float n2 = snoise(p * 8.0 - vec3(t * 0.7, 0.0, t * 0.7));
  float turb = (n1 * 0.65 + n2 * 0.35) * 0.5 + 0.5;

  // Valores lineales: colorspace_fragment los aclara, por eso se ven más oscuros aquí.
  vec3 colDeep = vec3(0.78, 0.10, 0.0);
  vec3 colMid  = vec3(1.0, 0.36, 0.01);
  vec3 colHot  = vec3(1.0, 0.82, 0.30);

  vec3 plasma = mix(colDeep, colMid, smoothstep(0.2, 0.55, turb));
  plasma = mix(plasma, colHot, smoothstep(0.55, 0.85, turb));

  float borde = 1.0 - max(0.0, dot(normalize(vNormal), normalize(vViewDir)));
  vec3 finalColor = mix(plasma, vec3(1.0, 0.9, 0.55), pow(borde, 2.4) * 0.8);

  gl_FragColor = vec4(finalColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// -----------------------------------------------------------------------------
// ASPECTO DE CADA PLANETA
// -----------------------------------------------------------------------------

const HALOS_ATMOSFERA: Record<IdPlaneta, string> = {
  mercurio: "#B8B5AE",
  venus: "#FFE4A0",
  tierra: "#52B2FF",
  marte: "#FF9A6A",
  jupiter: "#F0C090",
  saturno: "#F4DF9E",
  urano: "#7FE5D9",
  neptuno: "#4A82FF",
};

const COLOR_PLANETA = Object.fromEntries(PLANETAS.map((p) => [p.id, p.color])) as Record<IdPlaneta, string>;

// La cámara mira desde arriba. Sin inclinar el eje se verían los polos, y Júpiter parecería una diana.
const INCLINACION: Partial<Record<IdPlaneta, [number, number, number]>> = {
  saturno: [-0.5, 0, 0.16],
  urano: [-0.55, 0, 1.3],
};
const INCLINACION_NORMAL: [number, number, number] = [-0.8, 0, 0.14];

/** Corona plana cuyas coordenadas de textura van del borde interior al exterior. */
function crearAnilloRadial(interior: number, exterior: number) {
  const geo = new THREE.RingGeometry(interior, exterior, 72, 1);
  const pos = geo.getAttribute("position");
  const uv = geo.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - interior) / (exterior - interior), 0.5);
  }
  return geo;
}

// -----------------------------------------------------------------------------
// COMPONENTES
// -----------------------------------------------------------------------------

/** Sol con plasma animado y corona aditiva. */
export function SolVisual() {
  const solMatRef = useRef<THREE.ShaderMaterial>(null);
  const coronaRef = useRef<THREE.Sprite>(null);

  const solMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_SOL,
        fragmentShader: FRAG_SOL,
        uniforms: { uTime: { value: 0 } },
        toneMapped: false,
      }),
    [],
  );

  const coronaTextura = useMemo(() => textura("corona", crearTexturaCorona), []);

  useFrame((state) => {
    if (solMatRef.current) solMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (coronaRef.current) {
      const pulso = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      coronaRef.current.scale.set(RADIO_SOL * 4.2 * pulso, RADIO_SOL * 4.2 * pulso, 1);
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[RADIO_SOL, 48, 36]} />
        <primitive object={solMaterial} ref={solMatRef} attach="material" />
      </mesh>
      <sprite ref={coronaRef} scale={[RADIO_SOL * 4.2, RADIO_SOL * 4.2, 1]}>
        <spriteMaterial map={coronaTextura} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  );
}

const NEBULOSAS: Array<{ color: string; posicion: [number, number, number]; escala: number; opacidad: number }> = [
  { color: "#5636D9", posicion: [-46, -42, -26], escala: 120, opacidad: 0.3 },
  { color: "#1E7FBF", posicion: [52, -44, 18], escala: 130, opacidad: 0.24 },
  { color: "#B0389A", posicion: [6, -46, 62], escala: 100, opacidad: 0.17 },
];

/** Galaxia de fondo: nebulosas difusas y una sola nube de puntos con brazos en espiral. */
export function GalaxiaEspiral() {
  const puntosRef = useRef<THREE.Points>(null);
  const brillo = useMemo(() => textura("brillo", crearTexturaBrillo), []);

  const { geo, mat } = useMemo(() => {
    const prng = crearPrng(442211);
    const total = 2600;
    const posiciones = new Float32Array(total * 3);
    const colores = new Float32Array(total * 3);

    const colorNucleo = new THREE.Color("#FFE9B0");
    const colorBrazos = new THREE.Color("#7CC4FF");
    const colorExterior = new THREE.Color("#B48CF0");
    const c = new THREE.Color();

    const brazos = 3;
    for (let i = 0; i < total; i++) {
      const r = Math.pow(prng(), 1.5) * 130 + 8;
      const angulo = r * 0.05 + ((i % brazos) * Math.PI * 2) / brazos;
      // Suma de dos azares: junta las estrellas cerca del brazo sin dibujar una línea.
      const dispersion = (prng() + prng() - 1) * (10 + r * 0.42);
      posiciones[i * 3] = Math.cos(angulo) * r + Math.sin(angulo) * dispersion;
      posiciones[i * 3 + 1] = -34 + (prng() - 0.5) * 12;
      posiciones[i * 3 + 2] = Math.sin(angulo) * r - Math.cos(angulo) * dispersion;

      if (r < 30) c.copy(colorNucleo).lerp(colorBrazos, r / 30);
      else c.copy(colorBrazos).lerp(colorExterior, Math.min(1, (r - 30) / 90));
      const intensidad = 0.35 + prng() * 0.65;
      colores[i * 3] = c.r * intensidad;
      colores[i * 3 + 1] = c.g * intensidad;
      colores[i * 3 + 2] = c.b * intensidad;
    }

    const geometria = new THREE.BufferGeometry();
    geometria.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
    geometria.setAttribute("color", new THREE.BufferAttribute(colores, 3));

    const material = new THREE.PointsMaterial({
      size: 0.85,
      map: brillo,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

    return { geo: geometria, mat: material };
  }, [brillo]);

  useFrame((_, dt) => {
    if (puntosRef.current) puntosRef.current.rotation.y += dt * 0.012;
  });

  return (
    <group>
      {NEBULOSAS.map((n) => (
        <sprite key={n.color} position={n.posicion} scale={[n.escala, n.escala, 1]}>
          <spriteMaterial
            map={brillo}
            color={new THREE.Color(n.color)}
            opacity={n.opacidad}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
      <points ref={puntosRef} geometry={geo} material={mat} />
    </group>
  );
}

interface PlanetaVisualProps {
  id: IdPlaneta;
  radio: number;
  esObjetivo?: boolean;
  children?: ReactNode;
}

/** Planeta con textura propia, atmósfera y rotación sobre su eje. */
export function PlanetaVisual({ id, radio, esObjetivo, children }: PlanetaVisualProps) {
  const cuerpoRef = useRef<THREE.Mesh>(null);
  const nubesRef = useRef<THREE.Mesh>(null);
  const aroRef = useRef<THREE.Mesh>(null);

  const mapa = useTexturaDiferida(`planeta-${id}`, () => crearTexturaPlaneta(id));
  const nubes = useTexturaDiferida(id === "tierra" ? "nubes" : null, crearTexturaNubes);
  const anillos = useMemo(() => (id === "saturno" ? textura("anillos", crearTexturaAnillos) : null), [id]);
  const geoAnillos = useMemo(() => (id === "saturno" ? crearAnilloRadial(radio * 1.28, radio * 2.05) : null), [id, radio]);

  const matAtmosfera = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_ATMOSFERA,
        fragmentShader: FRAG_ATMOSFERA,
        uniforms: {
          uColor: { value: new THREE.Color(HALOS_ATMOSFERA[id]) },
          uPower: { value: 2.6 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
        toneMapped: false,
      }),
    [id],
  );

  useFrame((state, dt) => {
    if (cuerpoRef.current) cuerpoRef.current.rotation.y += dt * 0.35;
    if (nubesRef.current) nubesRef.current.rotation.y += dt * 0.45;
    if (aroRef.current) aroRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.12);
  });

  return (
    <group>
      <group rotation={INCLINACION[id] ?? INCLINACION_NORMAL}>
        <mesh ref={cuerpoRef}>
          <sphereGeometry args={[radio, 36, 28]} />
          {/* La clave rehace el material: pasar de color a textura cambia su programa. */}
          {mapa ? (
            <meshStandardMaterial key="textura" map={mapa} roughness={0.8} metalness={0} />
          ) : (
            <meshStandardMaterial key="color" color={COLOR_PLANETA[id]} roughness={0.8} metalness={0} />
          )}
        </mesh>

        {nubes ? (
          <mesh ref={nubesRef} scale={1.02}>
            <sphereGeometry args={[radio, 32, 24]} />
            <meshStandardMaterial map={nubes} transparent opacity={0.8} depthWrite={false} roughness={1} />
          </mesh>
        ) : null}

        {geoAnillos && anillos ? (
          <mesh geometry={geoAnillos} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial map={anillos} side={THREE.DoubleSide} transparent depthWrite={false} />
          </mesh>
        ) : null}

        {id === "urano" ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radio * 1.4, radio * 1.52, 48]} />
            <meshBasicMaterial color="#BDF3EC" side={THREE.DoubleSide} transparent opacity={0.45} depthWrite={false} />
          </mesh>
        ) : null}
      </group>

      <mesh scale={1.16}>
        <sphereGeometry args={[radio, 24, 20]} />
        <primitive object={matAtmosfera} attach="material" />
      </mesh>

      {esObjetivo ? (
        <mesh ref={aroRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radio + 1, radio + 1.35, 48]} />
          <meshBasicMaterial color="#FFC928" side={THREE.DoubleSide} />
        </mesh>
      ) : null}

      {children}
    </group>
  );
}

/** Cohete con llama que crece con la velocidad. */
export function CoheteVisual({ velocidad }: { velocidad?: RefObject<THREE.Vector3> }) {
  const llamaRef = useRef<THREE.Group>(null);
  const chispasRef = useRef<THREE.Points>(null);

  const { naveGeo, naveMat } = useMemo(() => {
    const o = new Obra();
    o.cilindro(0.42, 0.58, 1.6, 16, "#F7F4FF", [0, 0, 0]);
    o.cono(0.42, 0.85, 16, "#E85D5D", [0, 1.22, 0]);
    o.cilindro(0.59, 0.59, 0.14, 16, "#E85D5D", [0, -0.4, 0]);
    // Con el cohete acostado, el lado -Z de la pieza es el que mira a la cámara.
    o.esfera(0.3, "#25CFE0", [0, 0.32, -0.34], [1, 1, 0.75], 2);
    o.esfera(0.15, "#FFC928", [0, 0.32, -0.5], [1, 1, 0.6], 1);
    for (let i = 0; i < 3; i++) {
      o.caja(1.4, 0.5, 0.08, "#5636D9", [0, -0.65, 0], [0, (i * Math.PI * 2) / 3, 0]);
    }
    o.cilindro(0.32, 0.25, 0.35, 12, "#4B4453", [0, -0.92, 0]);

    return {
      naveGeo: o.geometria(),
      naveMat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.15 }),
    };
  }, []);

  const { estelaGeo, estelaMat } = useMemo(() => {
    const total = 30;
    const pos = new Float32Array(total * 3);
    const prng = crearPrng(999);
    for (let i = 0; i < total; i++) {
      pos[i * 3] = (prng() - 0.5) * 0.4;
      pos[i * 3 + 1] = -1.2 - prng() * 1.6;
      pos[i * 3 + 2] = (prng() - 0.5) * 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      size: 0.3,
      map: textura("brillo", crearTexturaBrillo),
      color: new THREE.Color("#FFA439"),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { estelaGeo: g, estelaMat: m };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const rapidez = velocidad?.current.length() ?? 0;
    const fuerza = Math.min(1.5, 0.45 + rapidez * 0.12);

    if (llamaRef.current) {
      const pulso = 1 + Math.sin(state.clock.elapsedTime * 35) * 0.18;
      llamaRef.current.scale.set(pulso, fuerza * pulso, pulso);
    }
    if (chispasRef.current) {
      chispasRef.current.visible = rapidez > 0.5;
      const atributo = chispasRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = atributo.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] -= dt * (3 + rapidez * 0.8);
        if (arr[i * 3 + 1] < -2.8) arr[i * 3 + 1] = -1.2;
      }
      atributo.needsUpdate = true;
    }
  });

  return (
    // La ojiva está en +Y: se acuesta para que apunte hacia +Z, que es el frente de avance.
    <group rotation={[Math.PI / 2, 0, 0]} scale={1.15}>
      <mesh geometry={naveGeo} material={naveMat} />

      <group ref={llamaRef} position={[0, -1.05, 0]}>
        <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.34, 1.2, 14]} />
          <meshBasicMaterial color="#FF7A18" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.18, 0.8, 12]} />
          <meshBasicMaterial color="#A8F5FF" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      <points ref={chispasRef} geometry={estelaGeo} material={estelaMat} />
    </group>
  );
}

function crearGeometriaEstrella() {
  const figura = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.62 : 0.28;
    const a = (i * Math.PI) / 5 + Math.PI / 2;
    if (i === 0) figura.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else figura.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  figura.closePath();
  const geo = new THREE.ExtrudeGeometry(figura, { depth: 0.14, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.05, bevelThickness: 0.05 });
  geo.center();
  return geo;
}

/** Estrella dorada. Se inclina hacia la cámara; quien la usa decide cómo gira. */
export function EstrellaMoneda3D({ position }: { position: THREE.Vector3 }) {
  const geo = useMemo(() => crearGeometriaEstrella(), []);

  return (
    <mesh position={position} rotation={[-0.96, 0, 0]} geometry={geo}>
      <meshStandardMaterial color="#FFD700" emissive="#FFB800" emissiveIntensity={0.65} roughness={0.25} metalness={0.4} />
    </mesh>
  );
}

/** Roca irregular. El relieve sale del ruido: así los vértices repetidos se mueven juntos y no hay grietas. */
function crearGeometriaAsteroide() {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const pos = geo.getAttribute("position");
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.multiplyScalar(0.82 + fractal(v.x * 1.5, v.y * 1.5, v.z * 1.5, 3) * 0.42);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function Asteroide3D() {
  const geo = useMemo(() => crearGeometriaAsteroide(), []);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#7A7385" roughness={0.9} metalness={0.1} flatShading />
    </mesh>
  );
}
