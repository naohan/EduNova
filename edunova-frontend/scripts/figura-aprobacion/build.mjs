// Genera components/landing/figura/arte.ts: la mesa de aprobación de la landing.
// Uso: node scripts/figura-aprobacion/build.mjs
// La unidad entra por la bandeja, la IA la lee, y la compuerta solo sube con el botón del docente.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "components", "landing", "figura", "arte.ts");

const WIDTH = 760;
const HEIGHT = 350;

const PLATE = { x: -196, y: -64, w: 392, d: 128, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const BELT_FROM = -184;
const BELT_TO = 88;

const ARCH_X = -70;
const ARCH_Z = 62;
const GATE_X = 30;
const GATE_H = 42;
const GATE_RISE = 26;
const GUIDE_Z = 72;

const BOTON = [30, 47];
const BOTON_R = 8;
const BOTON_Z = 7;
const BOTON_H = 6;

const CARRO = { x: -21, y: -14, w: 42, d: 28, r: 2 };
const CARD = { x: -16, y: -10, w: 32, d: 20, r: 1.2 };
const CARD_Z = 6;
const CARD_H = 3;

const BINS = [
  { x: 96, w: 28, h: 8 },
  { x: 128, w: 28, h: 16 },
  { x: 160, w: 28, h: 24 },
];
const BIN_Y = -22;
const BIN_D = 44;

const POS = { inicio: -146, escaner: ARCH_X, espera: -12, final: 62 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners({ x: ARCH_X - 9, y: -42, w: 18, d: 84 }, 0, ARCH_Z + 10), ...k.boxCorners({ x: GATE_X - 9, y: -34, w: 18, d: 68 }, 0, GUIDE_Z + 10)],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 62 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = [...k.corners(PLATE, 24)].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // Regla grabada en el borde delantero: marca el recorrido de la unidad.
  const strip = { x: -176, y: 48, w: 176, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  return out.join("");
}

function belt() {
  const out = [];
  const bed = { x: BELT_FROM, y: -17, w: BELT_TO - BELT_FROM, d: 34, r: 1.5 };
  out.push(S(k.slabOf(bed, 0, 1.4, P, 3), { tone: "lo", crease: "none" }));
  // Costillas de la banda: cada una llega de riel a riel.
  const ribs = [];
  for (let x = BELT_FROM + 10; x < BELT_TO - 4; x += 12) ribs.push(k.lineOnTop([x, -17], [x, 17], 1.4, P));
  out.push(L(ribs.join(""), { tone: "faint" }));
  for (const y of [-22, 17]) {
    out.push(S(k.slabOf({ x: BELT_FROM, y, w: BELT_TO - BELT_FROM, d: 5, r: 1 }, 0, 3.4, P, 3, 0.4), { tone: "mid" }));
    const pins = [];
    for (let x = BELT_FROM + 8; x < BELT_TO; x += 44) pins.push(at([x, y + 2.5, 3.4]));
    out.push(D(pins, { size: 0.4 }));
  }
  for (const x of [BELT_FROM - 5, BELT_TO]) {
    out.push(S(k.slabOf({ x, y: -25, w: 5, d: 50, r: 1.2 }, 0, 7, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 2.5, -20, 7]), at([x + 2.5, 20, 7])], { size: 0.45 }));
  }
  return out.join("");
}

// Bandeja de entrada detrás de la banda: el material que sube el docente.
function bandeja() {
  const out = [];
  const tray = { x: -176, y: -56, w: 58, d: 30, r: 2 };
  out.push(S(k.slabOf(tray, 0, 4, P, 4, 0.5), { tone: "mid" }));
  [0, 1, 2, 3, 4].forEach((i) => {
    const sheet = { x: tray.x + 6 + i * 0.7, y: tray.y + 5 - i * 0.5, w: 42, d: 20, r: 0.8 };
    out.push(S(k.slabOf(sheet, 4 + i * 1.6, 1.6, P, 2), { tone: "mid", crease: "none" }));
  });
  const top = 4 + 5 * 1.6;
  const lines = [0, 1, 2].map((i) => k.lineOnTop([tray.x + 13, tray.y + 8 + i * 4], [tray.x + 37, tray.y + 8 + i * 4], top, P));
  out.push(L(lines.join(""), { tone: "lo", free: true }));
  out.push(D([at([tray.x + 3, tray.y + 3, 4]), at([tray.x + tray.w - 3, tray.y + 3, 4])], { size: 0.45 }));
  return out.join("");
}

function postArco(y) {
  const out = [];
  out.push(S(k.slabOf({ x: ARCH_X - 9, y: y - 9, w: 18, d: 18, r: 2 }, 0, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(D(k.corners({ x: ARCH_X - 9, y: y - 9, w: 18, d: 18 }, 3).map(([a, b]) => at([a, b, 3])), { size: 0.4 }));
  out.push(S(k.cylinder(ARCH_X, y, 4.4, 3, ARCH_Z - 3, P, 28), { tone: "mid", crease: "none" }));
  out.push(L([18, 44].map((z) => k.sideArc(ARCH_X, y, 4.4, z, P, 16)).join(""), { tone: "lo" }));
  return out.join("");
}

function arcoFrente() {
  const out = [postArco(34)];
  const bar = { x: ARCH_X - 9, y: -42, w: 18, d: 84, r: 2 };
  out.push(S(k.slabOf({ x: ARCH_X - 7, y: -12, w: 14, d: 24, r: 1.5 }, ARCH_Z - 13, 13, P, 3, 0.5), { tone: "mid" }));
  out.push(L(k.ring(ARCH_X, 0, 3.4, ARCH_Z - 13, P, 20), { tone: "lo" }));
  out.push(S(k.slabOf(bar, ARCH_Z, 8, P, 4, 0.7), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(bar, 3), ARCH_Z + 8, P, 3), { tone: "faint" }));
  out.push(D([-34, -14, 14, 34].map((y) => at([ARCH_X, y, ARCH_Z + 8])), { size: 0.45 }));
  // Placa con el nombre de la estación.
  const plate = { x: ARCH_X - 5.5, y: -11, w: 11, d: 22, r: 0.8 };
  out.push(S(k.slabOf(plate, ARCH_Z + 8, 0.6, P, 2), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.topMatrix([ARCH_X + 1.6, -5], ARCH_Z + 8.6, P, "y"), "IA", { size: 6, tone: "hi" }));
  return out.join("");
}

function guia(y) {
  const out = [];
  const foot = { x: GATE_X - 9, y: y - 7, w: 18, d: 14, r: 2 };
  out.push(S(k.slabOf(foot, 0, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(D(k.corners(foot, 3).map(([a, b]) => at([a, b, 3])), { size: 0.4 }));
  const post = { x: GATE_X - 5, y: y - 3.5, w: 10, d: 7, r: 1 };
  out.push(S(k.slabOf(post, 3, GUIDE_Z - 3, P, 3, 0.5), { tone: "mid" }));
  return out.join("");
}

function compuerta() {
  const out = [];
  const plan = { x: GATE_X - 2, y: -24, w: 4, d: 48, r: 0.6 };
  out.push(S(k.slabOf(plan, 4, GATE_H, P, 2, 0.3), { tone: "hi", crease: "lo" }));
  // Rejilla grabada: cada línea corre de borde a borde en la cara de la compuerta.
  const face = GATE_X + 2;
  const rows = [14, 24, 34].map((z) => k.segment([face, -24, z], [face, 24, z], P));
  out.push(L(rows.join(""), { tone: "faint" }));
  out.push(D([-20, 20].flatMap((y) => [10, 40].map((z) => at([face, y, z]))), { size: 0.45 }));
  return out.join("");
}

function cabezal() {
  const out = [];
  const head = { x: GATE_X - 9, y: -34, w: 18, d: 68, r: 2 };
  out.push(S(k.slabOf(head, GUIDE_Z, 7, P, 4, 0.7), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(head, 3), GUIDE_Z + 7, P, 3), { tone: "faint" }));
  out.push(D([-27, -9, 9, 27].map((y) => at([GATE_X, y, GUIDE_Z + 7])), { size: 0.45 }));
  return out.join("");
}

function botonBase() {
  const out = [];
  const [x, y] = BOTON;
  const box = { x: x - 15, y: y - 12, w: 30, d: 24, r: 3 };
  out.push(S(k.slabOf(box, 0, BOTON_Z, P, 5, 0.7), { tone: "mid" }));
  out.push(D(k.corners(box, 3.4).map(([a, b]) => at([a, b, BOTON_Z])), { size: 0.4 }));
  out.push(L(k.ring(x, y, BOTON_R + 2.4, BOTON_Z, P, 36), { tone: "lo" }));
  const tag = { x: x - 52, y: y - 5, w: 32, d: 10, r: 1 };
  out.push(S(k.slabOf(tag, 0, 0.6, P, 2), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.topMatrix([tag.x + 3.5, tag.y + 6.6], 0.6, P, "x"), "DOCENTE", { size: 3.6, tone: "hi" }));
  return out.join("");
}

function botonCapuchon() {
  const [x, y] = BOTON;
  const out = [S(k.cylinder(x, y, BOTON_R, BOTON_Z, BOTON_H, P, 40, 0.8), { tone: "hi", crease: "lo", className: "fig-boton" })];
  out.push(L(k.ring(x, y, BOTON_R - 2.4, BOTON_Z + BOTON_H, P, 32), { tone: "lo" }));
  return out.join("");
}

function plataformas() {
  const out = [];
  BINS.forEach((bin, i) => {
    const plan = { x: bin.x, y: BIN_Y, w: bin.w, d: BIN_D, r: 2.5 };
    out.push(S(k.slabOf(plan, 0, bin.h, P, 4, 0.6), { tone: "mid" }));
    out.push(L(k.planOutline(k.insetPlan(plan, 2.6), bin.h, P, 3), { tone: "faint" }));
    out.push(D(k.corners(plan, 3.4).map(([a, b]) => at([a, b, bin.h])), { size: 0.4 }));
    out.push(L(k.sideSeam(plan, bin.h * 0.5, P, 3), { tone: "faint" }));
    // Muescas de edad en el frente: una, dos y tres.
    const notch = [];
    for (let n = 0; n <= i; n++) {
      const y = BIN_Y + BIN_D / 2 + (n - i / 2) * 5;
      notch.push(k.segment([bin.x + bin.w, y, bin.h * 0.28], [bin.x + bin.w, y, bin.h * 0.72], P));
    }
    out.push(L(notch.join(""), { tone: "mid", free: true }));
  });
  return out.join("");
}

function miniTarjeta(bin) {
  const plan = { x: bin.x + 5, y: BIN_Y + 11, w: 18, d: 22, r: 1 };
  const out = [S(k.slabOf(plan, bin.h, 2.6, P, 2, 0.3), { tone: "hi", crease: "lo", lit: true })];
  const lines = [0, 1, 2].map((i) => k.lineOnTop([plan.x + 4, plan.y + 6 + i * 5], [plan.x + 14, plan.y + 6 + i * 5], bin.h + 2.6, P));
  out.push(L(lines.join(""), { tone: "faint", free: true }));
  return out.join("");
}

function carro() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CARRO, 2), 2, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.slabOf(CARRO, 3, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(D(k.corners(CARRO, 2.6).map(([a, b]) => at([a, b, 6])), { size: 0.4, tone: "lo" }));
  out.push(S(k.slabOf(CARD, CARD_Z, CARD_H, P, 3, 0.4), { tone: "hi", crease: "lo", lit: true }));
  return out.join("");
}

// Lo que escribe la IA sobre la unidad: subtemas y rúbrica.
function rubrica() {
  const z = CARD_Z + CARD_H;
  const lines = [-5, 0, 5].map((y) => k.lineOnTop([CARD.x + 5, y], [CARD.x + CARD.w - 5, y], z, P));
  return L(lines.join(""), { tone: "faint", free: true });
}

const haz = `<path class="fig-haz" d="${k.pathOf([at([ARCH_X - 7, -9, ARCH_Z - 13]), at([ARCH_X + 7, -9, ARCH_Z - 13]), at([ARCH_X + 12, -10, CARD_Z + CARD_H]), at([ARCH_X + 12, 10, CARD_Z + CARD_H]), at([ARCH_X - 12, 10, CARD_Z + CARD_H]), at([ARCH_X - 12, -10, CARD_Z + CARD_H])], true)}"/>`;

const paso = (x) => k.axisVector(P, [x, 0, 0]);
const data = {
  width: WIDTH,
  height: HEIGHT,
  fondo: [base(), belt(), bandeja(), postArco(-34), guia(-31)].join(""),
  haz,
  carro: carro(),
  rubrica: rubrica(),
  compuerta: compuerta(),
  frente: [guia(25), cabezal(), arcoFrente(), botonBase()].join(""),
  boton: botonCapuchon(),
  salida: plataformas(),
  tarjetas: BINS.map(miniTarjeta),
  pos: Object.fromEntries(Object.entries(POS).map(([name, x]) => [name, paso(x)])),
  subeCompuerta: k.axisVector(P, [0, 0, GATE_RISE]),
  bajaBoton: k.axisVector(P, [0, 0, -3.4]),
  subeTarjeta: k.axisVector(P, [0, 0, 7]),
};

writeFileSync(
  OUT,
  `// Generado por scripts/figura-aprobacion/build.mjs. No editar a mano.\nexport const ARTE = ${JSON.stringify(data)} as const;\n`,
);
console.log("escrito", OUT, Math.round(JSON.stringify(data).length / 1024), "KB");
