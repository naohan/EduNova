"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Obra } from "../valle/valleObra";
import { PLANETAS, RADIO_SOL, type IdPlaneta } from "./espacioData";

// Generador procedural y cargador de recursos para Piloto Espacial y Ordena los Planetas.
// Funciona 100% offline sin peticiones externas y con cero errores 404.

// PRNG determinista con semilla fija para evitar cualquier impureza durante el prerenderizado
function crearPrng(semilla = 123456789) {
  let s = semilla >>> 0;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

// Ruido pseudo-aleatorio suave para fBm
const prngGlobal = crearPrng(987654321);
const PERM = new Uint8Array(512);
for (let i = 0; i < 256; i++) PERM[i] = i;
for (let i = 255; i > 0; i--) {
  const j = Math.floor(prngGlobal() * (i + 1));
  const temp = PERM[i];
  PERM[i] = PERM[j];
  PERM[j] = temp;
}
for (let i = 0; i < 256; i++) PERM[256 + i] = PERM[i];

function grad2D(hash: number, x: number, y: number): number {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise2D(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  // Fade curves
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);

  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];

  const x1 = (1 - u) * grad2D(aa, xf, yf) + u * grad2D(ba, xf - 1, yf);
  const x2 = (1 - u) * grad2D(ab, xf, yf - 1) + u * grad2D(bb, xf - 1, yf - 1);
  return (1 - v) * x1 + v * x2;
}

function fbm2D(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  let max = 0;
  for (let o = 0; o < octaves; o++) {
    val += noise2D(x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return val / max;
}

// Cache en memoria para que cada textura se cree una sola vez
const TEXTURE_CACHE = new Map<string, THREE.CanvasTexture>();

function parseHex(hex: string): [number, number, number] {
  const c = new THREE.Color(hex);
  return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)];
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  const clampT = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * clampT),
    Math.round(c1[1] + (c2[1] - c1[1]) * clampT),
    Math.round(c1[2] + (c2[2] - c1[2]) * clampT),
  ];
}

/** Genera en memoria la textura equirectangular (512x256) de un planeta usando fBm determinista */
export function obtenerTexturaPlaneta(id: IdPlaneta): THREE.CanvasTexture {
  const cacheKey = `planet_${id}`;
  const existente = TEXTURE_CACHE.get(cacheKey);
  if (existente) return existente;

  if (typeof document === "undefined") {
    // SSR fallback: textura mínima en blanco
    const canvas = { width: 1, height: 1 } as unknown as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const W = 512;
  const H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let y = 0; y < H; y++) {
    const v = y / H;
    const lat = (v - 0.5) * Math.PI; // -PI/2 a PI/2
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);

    for (let x = 0; x < W; x++) {
      const u = x / W;
      const lon = (u - 0.5) * Math.PI * 2; // -PI a PI
      const px = cosLat * Math.sin(lon);
      const py = sinLat;
      const pz = cosLat * Math.cos(lon);

      const idx = (y * W + x) * 4;
      let r = 128;
      let g = 128;
      let b = 128;

      if (id === "mercurio") {
        // Cráteres de impacto y roca gris
        const n1 = fbm2D(px * 4 + 10, py * 4 + 10, 5);
        const n2 = fbm2D(px * 12, pz * 12, 3);
        const craters = Math.sin(n1 * 12 + n2 * 6) * 0.5 + 0.5;
        const col = lerpColor([92, 90, 86], [176, 172, 165], craters * 0.7 + n1 * 0.3);
        [r, g, b] = col;
      } else if (id === "venus") {
        // Atmósfera densa con remolinos ámbar y domain warping
        const warpX = fbm2D(px * 3 + 2, py * 3, 4);
        const warpY = fbm2D(py * 3, pz * 3 + 4, 4);
        const flow = fbm2D((px + warpX * 0.4) * 5, (py + warpY * 0.4) * 5, 5);
        const col = lerpColor([168, 110, 42], [245, 205, 126], flow * 0.8 + v * 0.2);
        [r, g, b] = col;
      } else if (id === "tierra") {
        // Continentes verdes/ocres, océanos profundos y casquetes polares
        const n = fbm2D(px * 3.5, (py + 0.1) * 3.5, 6);
        const polo = Math.abs(lat) / (Math.PI / 2);
        if (polo > 0.82) {
          // Casquetes polares
          [r, g, b] = [245, 250, 255];
        } else if (n > 0.48) {
          // Tierra: costa a bosque/montaña
          const tLand = (n - 0.48) / 0.52;
          const col = lerpColor([46, 111, 64], [168, 142, 88], tLand);
          [r, g, b] = col;
        } else {
          // Océano profundo con costa
          const tWater = n / 0.48;
          const col = lerpColor([10, 34, 68], [24, 76, 140], tWater);
          [r, g, b] = col;
        }
      } else if (id === "marte") {
        // Terreno rojizo, cañones oscuros y casquetes polares
        const polo = Math.abs(lat) / (Math.PI / 2);
        if (polo > 0.88) {
          [r, g, b] = [240, 245, 250];
        } else {
          const n = fbm2D(px * 4, py * 4, 5);
          const canyon = fbm2D(px * 8 + 3, pz * 8, 4);
          const mixFactor = n * 0.6 + canyon * 0.4;
          const col = lerpColor([105, 30, 16], [210, 85, 45], mixFactor);
          [r, g, b] = col;
        }
      } else if (id === "jupiter") {
        // Bandas zonales alternadas con turbulencia y Gran Mancha Roja
        const perturb = fbm2D(px * 3, py * 2, 4) * 0.14;
        const bandVal = Math.sin((v + perturb) * Math.PI * 14) * 0.5 + 0.5;
        let col = lerpColor([168, 85, 42], [236, 218, 192], bandVal);

        // Gran Mancha Roja en el hemisferio sur (~22° S, longitud centrada)
        const spotX = 0.62 * W;
        const spotY = 0.65 * H;
        const dx = (x - spotX) / 26;
        const dy = (y - spotY) / 14;
        const distSpot = dx * dx + dy * dy;
        if (distSpot < 1.0) {
          const tSpot = 1.0 - Math.sqrt(distSpot);
          col = lerpColor(col, [180, 45, 25], tSpot * 0.9);
        }
        [r, g, b] = col;
      } else if (id === "saturno") {
        // Bandas doradas suaves
        const perturb = fbm2D(px * 2, py * 2, 3) * 0.08;
        const bandVal = Math.sin((v + perturb) * Math.PI * 18) * 0.5 + 0.5;
        const col = lerpColor([190, 155, 102], [238, 222, 172], bandVal);
        [r, g, b] = col;
      } else if (id === "urano") {
        // Cian perlado con bandas muy tenues
        const n = fbm2D(px * 2, py * 2, 3) * 0.15;
        const col = lerpColor([80, 188, 180], [168, 240, 232], v * 0.5 + n);
        [r, g, b] = col;
      } else if (id === "neptuno") {
        // Azul cobalto profundo con vientos y tormenta oscura
        const n = fbm2D(px * 3.5, py * 3.5, 5);
        let col = lerpColor([16, 40, 112], [40, 96, 216], n);

        // Vientos blancos sutiles
        const streaks = Math.pow(fbm2D(px * 8, py * 2, 4) * 0.5 + 0.5, 4.0);
        col = lerpColor(col, [220, 235, 255], streaks * 0.6);

        // Mancha oscura
        const dx = (x - 0.45 * W) / 22;
        const dy = (y - 0.58 * H) / 12;
        const distSpot = dx * dx + dy * dy;
        if (distSpot < 1.0) {
          const tSpot = 1.0 - Math.sqrt(distSpot);
          col = lerpColor(col, [10, 25, 75], tSpot * 0.8);
        }
        [r, g, b] = col;
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  TEXTURE_CACHE.set(cacheKey, tex);
  return tex;
}

/** Textura procedural semitransparente para las nubes terrestres */
export function obtenerTexturaNubesTierra(): THREE.CanvasTexture {
  const cacheKey = "earth_clouds";
  const existente = TEXTURE_CACHE.get(cacheKey);
  if (existente) return existente;

  if (typeof document === "undefined") {
    const canvas = { width: 1, height: 1 } as unknown as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const W = 512;
  const H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const u = x / W;
      const v = y / H;
      const n = fbm2D(u * 12, v * 6, 5);
      const alpha = Math.max(0, Math.min(255, Math.floor((n - 0.35) * 380)));
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  TEXTURE_CACHE.set(cacheKey, tex);
  return tex;
}

/** Textura procedural para los anillos de Saturno con la división de Cassini */
export function obtenerTexturaAnillosSaturno(): THREE.CanvasTexture {
  const cacheKey = "saturn_rings";
  const existente = TEXTURE_CACHE.get(cacheKey);
  if (existente) return existente;

  if (typeof document === "undefined") {
    const canvas = { width: 1, height: 1 } as unknown as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const W = 256;
  const H = 1;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let x = 0; x < W; x++) {
    const t = x / W; // de interior a exterior
    const idx = x * 4;

    // División de Cassini entre 0.70 y 0.76
    const enCassini = t > 0.7 && t < 0.76;
    if (enCassini || t < 0.05 || t > 0.98) {
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 0;
    } else {
      const brillo = Math.sin(t * Math.PI * 18) * 0.2 + 0.8;
      const col = lerpColor([185, 155, 110], [240, 225, 185], brillo);
      data[idx] = col[0];
      data[idx + 1] = col[1];
      data[idx + 2] = col[2];
      data[idx + 3] = Math.round(brillo * 215);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  TEXTURE_CACHE.set(cacheKey, tex);
  return tex;
}

/** Textura suave para la corona solar (sin aros marrones, pura luminiscencia aditiva) */
export function obtenerTexturaCoronaSolar(): THREE.CanvasTexture {
  const cacheKey = "sun_corona";
  const existente = TEXTURE_CACHE.get(cacheKey);
  if (existente) return existente;

  if (typeof document === "undefined") {
    const canvas = { width: 1, height: 1 } as unknown as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = S / 2;
  const cy = S / 2;
  const grad = ctx.createRadialGradient(cx, cy, S * 0.12, cx, cy, S * 0.5);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.25, "rgba(255, 210, 80, 0.75)");
  grad.addColorStop(0.65, "rgba(255, 140, 20, 0.25)");
  grad.addColorStop(1, "rgba(255, 80, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  const tex = new THREE.CanvasTexture(canvas);
  TEXTURE_CACHE.set(cacheKey, tex);
  return tex;
}

// -----------------------------------------------------------------------------
// SHADERS GLSL PERSONALIZADOS
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

const FRAG_ATMOSFERA = `
uniform vec3 uColor;
uniform float uPower;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float fresnel = 1.0 - max(0.0, dot(vNormal, vViewDir));
  float alpha = pow(fresnel, uPower);
  gl_FragColor = vec4(uColor, alpha * 0.7);
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
  float n2 = snoise(p * 7.5 - vec3(t * 0.7, 0.0, t * 0.7));
  float turb = (n1 * 0.65 + n2 * 0.35) * 0.5 + 0.5;

  vec3 colDeep = vec3(0.92, 0.22, 0.02);
  vec3 colMid  = vec3(1.0, 0.68, 0.08);
  vec3 colHot  = vec3(1.0, 0.98, 0.75);

  vec3 plasma = mix(colDeep, colMid, smoothstep(0.18, 0.65, turb));
  plasma = mix(plasma, colHot, smoothstep(0.65, 0.95, turb));

  float fresnel = 1.0 - max(0.0, dot(vNormal, vViewDir));
  float limb = pow(fresnel, 1.8);
  vec3 finalColor = mix(plasma, colHot, limb * 0.75);

  gl_FragColor = vec4(finalColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// Colores atmosféricos para el halo Rayleigh de cada planeta
const HALOS_ATMOSFERA: Record<IdPlaneta, string> = {
  mercurio: "#B8B5AE",
  venus: "#FFE4A0",
  tierra: "#52B2FF",
  marte: "#FF8C5A",
  jupiter: "#E8B27A",
  saturno: "#F4DF9E",
  urano: "#7FE5D9",
  neptuno: "#4A82FF",
};

// -----------------------------------------------------------------------------
// COMPONENTES 3D
// -----------------------------------------------------------------------------

/** Sol 3D con shader de plasma vivo y corona solar suave */
export function SolVisual() {
  const solMatRef = useRef<THREE.ShaderMaterial>(null);
  const coronaRef = useRef<THREE.Sprite>(null);

  const solMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_SOL,
        fragmentShader: FRAG_SOL,
        uniforms: { uTime: { value: 0 } },
      }),
    [],
  );

  const coronaTextura = useMemo(() => obtenerTexturaCoronaSolar(), []);

  useFrame((state, dt) => {
    if (solMatRef.current) solMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (coronaRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
      coronaRef.current.scale.set(RADIO_SOL * 4.2 * pulse, RADIO_SOL * 4.2 * pulse, 1);
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[RADIO_SOL, 48, 36]} />
        <primitive object={solMaterial} ref={solMatRef} attach="material" />
      </mesh>
      {/* Corona solar aditiva (sin aros marrones) */}
      <sprite ref={coronaRef} scale={[RADIO_SOL * 4.2, RADIO_SOL * 4.2, 1]}>
        <spriteMaterial
          map={coronaTextura}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color={new THREE.Color("#FFBE3B")}
        />
      </sprite>
    </group>
  );
}

/** Galaxia espiral de fondo construida con un único Points en 1 draw call */
export function GalaxiaEspiral() {
  const puntosRef = useRef<THREE.Points>(null);

  const { geo, mat } = useMemo(() => {
    const prng = crearPrng(442211);
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorNucleo = new THREE.Color("#FFECA0");
    const colorBrazos = new THREE.Color("#5CB2FF");
    const colorExterior = new THREE.Color("#A266E8");

    const brazos = 2;
    for (let i = 0; i < count; i++) {
      const brazo = i % brazos;
      const r = Math.pow(prng(), 1.6) * 110 + 6;
      const angulo = r * 0.08 + (brazo * Math.PI * 2) / brazos;

      const dispersion = (prng() - 0.5) * (r * 0.22);
      const x = Math.cos(angulo) * r + Math.sin(angulo) * dispersion;
      const z = Math.sin(angulo) * r - Math.cos(angulo) * dispersion;
      const y = (prng() - 0.5) * (8 * Math.exp(-r * 0.02)) - 25;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color según radio
      const c = new THREE.Color();
      if (r < 25) {
        c.copy(colorNucleo).lerp(colorBrazos, r / 25);
      } else {
        const t = Math.min(1, (r - 25) / 80);
        c.copy(colorBrazos).lerp(colorExterior, t);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geo: geometry, mat: material };
  }, []);

  useFrame((_, dt) => {
    if (puntosRef.current) puntosRef.current.rotation.y += dt * 0.015;
  });

  return <primitive object={new THREE.Points(geo, mat)} ref={puntosRef} />;
}

interface PlanetaVisualProps {
  id: IdPlaneta;
  radio: number;
  esObjetivo?: boolean;
  etiqueta?: boolean;
  nombre?: string;
  rotacionY?: number;
  onPointerDown?: (e: any) => void;
  children?: React.ReactNode;
}

/** Planeta con textura equirectangular realista, atmósfera Rayleigh y rotación axial */
export function PlanetaVisual({
  id,
  radio,
  esObjetivo,
  etiqueta,
  nombre,
  rotacionY = 0,
  onPointerDown,
  children,
}: PlanetaVisualProps) {
  const cuerpoRef = useRef<THREE.Mesh>(null);
  const nubesRef = useRef<THREE.Mesh>(null);
  const aroRef = useRef<THREE.Mesh>(null);

  const textura = useMemo(() => obtenerTexturaPlaneta(id), [id]);
  const nubesTextura = useMemo(() => (id === "tierra" ? obtenerTexturaNubesTierra() : null), [id]);
  const anillosTextura = useMemo(() => (id === "saturno" ? obtenerTexturaAnillosSaturno() : null), [id]);

  const matAtmosfera = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_ATMOSFERA,
        fragmentShader: FRAG_ATMOSFERA,
        uniforms: {
          uColor: { value: new THREE.Color(HALOS_ATMOSFERA[id]) },
          uPower: { value: 2.2 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [id],
  );

  useFrame((state, dt) => {
    if (cuerpoRef.current) cuerpoRef.current.rotation.y += dt * 0.45;
    if (nubesRef.current) nubesRef.current.rotation.y += dt * 0.6;
    if (aroRef.current) {
      aroRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.12);
    }
  });

  return (
    <group rotation={[0, rotacionY, 0]}>
      {/* Esfera del planeta */}
      <mesh ref={cuerpoRef} onPointerDown={onPointerDown}>
        <sphereGeometry args={[radio, 36, 28]} />
        <meshStandardMaterial map={textura} roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Halo de atmósfera Rayleigh */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[radio, 24, 20]} />
        <primitive object={matAtmosfera} attach="material" />
      </mesh>

      {/* Capa de nubes giratoria para la Tierra */}
      {id === "tierra" && nubesTextura ? (
        <mesh ref={nubesRef} scale={[1.025, 1.025, 1.025]}>
          <sphereGeometry args={[radio, 32, 24]} />
          <meshStandardMaterial map={nubesTextura} transparent opacity={0.65} depthWrite={false} />
        </mesh>
      ) : null}

      {/* Anillos de Saturno con canal alfa y división de Cassini */}
      {id === "saturno" && anillosTextura ? (
        <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[radio * 1.3, radio * 2.2, 54]} />
          <meshStandardMaterial map={anillosTextura} side={THREE.DoubleSide} transparent opacity={0.88} />
        </mesh>
      ) : null}

      {/* Anillos inclinados tenues de Urano */}
      {id === "urano" ? (
        <mesh rotation={[-Math.PI / 1.18, 0, 0]}>
          <ringGeometry args={[radio * 1.35, radio * 1.55, 40]} />
          <meshBasicMaterial color="#9AEAE2" side={THREE.DoubleSide} transparent opacity={0.35} />
        </mesh>
      ) : null}

      {/* Aro indicador de objetivo actual */}
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

/** Cohete explorador modelado con Obra y propulsión animada */
export function CoheteVisual({ velocidad = 0 }: { velocidad?: number }) {
  const llamaRef = useRef<THREE.Group>(null);
  const chispasPropulsionRef = useRef<THREE.Points>(null);

  const { naveGeo, naveMat } = useMemo(() => {
    const o = new Obra();
    // Fuselaje principal blanco estilizado
    o.cilindro(0.42, 0.58, 1.6, 16, "#F7F4FF", [0, 0, 0]);
    // Ojiva / cono frontal rojo
    o.cono(0.42, 0.85, 16, "#E85D5D", [0, 1.22, 0]);
    // Ventana de cabina con visor dorado de astronauta adentro
    o.esfera(0.26, "#25CFE0", [0, 0.35, 0.42], [1, 1, 0.7], 2);
    o.esfera(0.12, "#FFC928", [0, 0.35, 0.45], [1, 1, 1], 1);
    // Aletas estabilizadoras
    for (let i = 0; i < 3; i++) {
      const rot = (i * Math.PI * 2) / 3;
      o.caja(1.4, 0.5, 0.08, "#5636D9", [0, -0.65, 0], [0, rot, 0]);
    }
    // Tobera metálica
    o.cilindro(0.32, 0.25, 0.35, 12, "#4B4453", [0, -0.92, 0]);

    const geo = o.geometria();
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.15,
    });
    return { naveGeo: geo, naveMat: mat };
  }, []);

  // Partículas de estela de propulsión
  const { estelaGeo, estelaMat } = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    const prng = crearPrng(999);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (prng() - 0.5) * 0.4;
      pos[i * 3 + 1] = -1.2 - prng() * 1.6;
      pos[i * 3 + 2] = (prng() - 0.5) * 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      size: 0.35,
      color: new THREE.Color("#FFA439"),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { estelaGeo: g, estelaMat: m };
  }, []);

  useFrame((state) => {
    const ahora = state.clock.elapsedTime;
    if (llamaRef.current) {
      const pulse = 1 + Math.sin(ahora * 35) * 0.18;
      const fuerza = Math.min(1.5, Math.max(0.4, 0.5 + velocidad * 0.2));
      llamaRef.current.scale.set(pulse, fuerza * pulse, pulse);
    }
    if (chispasPropulsionRef.current) {
      const posAttr = chispasPropulsionRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] -= 0.12;
        if (arr[i * 3 + 1] < -2.8) arr[i * 3 + 1] = -1.2;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    // Rotamos para que la ojiva (+Y en local) apunte hacia el frente de avance (+Z en mundo)
    <group rotation={[Math.PI / 2, 0, 0]} scale={1.15}>
      <mesh geometry={naveGeo} material={naveMat} />

      {/* Llama multicapa animada */}
      <group ref={llamaRef} position={[0, -1.05, 0]}>
        {/* Envolvente exterior naranja */}
        <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.34, 1.2, 14]} />
          <meshBasicMaterial color="#FF7A18" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* Núcleo interior blanco-azul */}
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.18, 0.8, 12]} />
          <meshBasicMaterial color="#A8F5FF" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* Chispas de escape */}
      <primitive object={new THREE.Points(estelaGeo, estelaMat)} ref={chispasPropulsionRef} />
    </group>
  );
}

/** Estrella de 5 puntas biselada en oro brillante con rotación suave */
export function EstrellaMoneda3D({ position }: { position: [number, number, number] | THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const starGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const puntos = 5;
    const rExt = 0.55;
    const rInt = 0.26;
    for (let i = 0; i < puntos * 2; i++) {
      const r = i % 2 === 0 ? rExt : rInt;
      const a = (i * Math.PI) / puntos - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
  }, []);

  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 2.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={starGeo}>
      <meshStandardMaterial color="#FFD700" emissive="#FFB800" emissiveIntensity={0.65} roughness={0.25} metalness={0.4} />
    </mesh>
  );
}

/** Asteroide irregular facetado con cráteres */
export function Asteroide3D({ scale = 1 }: { scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(1, 1);
    const pos = g.getAttribute("position");
    const prng = crearPrng(777);
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      const dist = v.length();
      const n = (prng() - 0.5) * 0.28;
      v.setLength(dist + n);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geo} scale={scale}>
      <meshStandardMaterial color="#6E6779" roughness={0.9} metalness={0.1} flatShading />
    </mesh>
  );
}

