import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Construye modelos a partir de muchas piezas y las une en una sola malla con colores por vértice.
// Así un edificio con cientos de detalles cuesta una llamada de dibujo, que es lo que importa en un
// celular: pesa la cantidad de llamadas, no la cantidad de piezas.

export type V3 = [number, number, number];

const CERO: V3 = [0, 0, 0];
const UNO: V3 = [1, 1, 1];

const vector = (v: V3) => new THREE.Vector3(v[0], v[1], v[2]);
const giro = (r: V3) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2]));

/** Marco compartido: varias obras pueden trabajar en la misma posición sin repetir coordenadas. */
export class Marco {
  matriz = new THREE.Matrix4();

  /** Lo que se agregue dentro de `fn` queda relativo a esta posición y giro en Y. */
  en(p: V3, rotY: number, fn: () => void) {
    const previa = this.matriz.clone();
    this.matriz.multiply(new THREE.Matrix4().compose(vector(p), giro([0, rotY, 0]), vector(UNO)));
    fn();
    this.matriz.copy(previa);
  }
}

export class Obra {
  private partes: THREE.BufferGeometry[] = [];

  constructor(private marco = new Marco()) {}

  agregar(geo: THREE.BufferGeometry, color: string, p: V3 = CERO, r: V3 = CERO, s: V3 = UNO) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const local = new THREE.Matrix4().compose(vector(p), giro(r), vector(s));
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(this.marco.matriz, local));
    if (g.getAttribute("uv")) g.deleteAttribute("uv");

    const c = new THREE.Color(color);
    const total = g.getAttribute("position").count;
    const colores = new Float32Array(total * 3);
    for (let i = 0; i < total; i++) {
      colores[i * 3] = c.r;
      colores[i * 3 + 1] = c.g;
      colores[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colores, 3));
    this.partes.push(g);
  }

  caja(w: number, h: number, d: number, color: string, p: V3, r?: V3) {
    this.agregar(new THREE.BoxGeometry(w, h, d), color, p, r);
  }

  cilindro(rArriba: number, rAbajo: number, h: number, lados: number, color: string, p: V3, r?: V3, s?: V3) {
    this.agregar(new THREE.CylinderGeometry(rArriba, rAbajo, h, lados), color, p, r, s);
  }

  /** Cilindro sin tapas: sirve para muros circulares que se ven por dentro y por fuera. */
  tubo(radio: number, h: number, lados: number, color: string, p: V3) {
    this.agregar(new THREE.CylinderGeometry(radio, radio, h, lados, 1, true), color, p);
  }

  cono(radio: number, h: number, lados: number, color: string, p: V3, r?: V3, s?: V3) {
    this.agregar(new THREE.ConeGeometry(radio, h, lados), color, p, r, s);
  }

  esfera(radio: number, color: string, p: V3, s?: V3, detalle = 1) {
    this.agregar(new THREE.IcosahedronGeometry(radio, detalle), color, p, CERO, s);
  }

  /** Media esfera con la parte plana abajo. */
  cupula(radio: number, color: string, p: V3) {
    this.agregar(new THREE.SphereGeometry(radio, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), color, p);
  }

  aro(radio: number, grosor: number, color: string, p: V3, r?: V3, arco = Math.PI * 2) {
    this.agregar(new THREE.TorusGeometry(radio, grosor, 6, 28, arco), color, p, r);
  }

  /** Corona plana, mirando hacia arriba. */
  corona(interior: number, exterior: number, lados: number, color: string, p: V3) {
    this.agregar(new THREE.RingGeometry(interior, exterior, lados), color, p, [-Math.PI / 2, 0, 0]);
  }

  /** Techo a dos aguas: base de `ancho` en X, cumbrera a lo largo de Z. */
  prisma(ancho: number, alto: number, largo: number, color: string, p: V3, r?: V3) {
    const perfil = new THREE.Shape();
    perfil.moveTo(-ancho / 2, 0);
    perfil.lineTo(ancho / 2, 0);
    perfil.lineTo(0, alto);
    perfil.closePath();
    const geo = new THREE.ExtrudeGeometry(perfil, { depth: largo, bevelEnabled: false });
    geo.translate(0, 0, -largo / 2);
    this.agregar(geo, color, p, r);
  }

  geometria() {
    if (!this.partes.length) return new THREE.BufferGeometry();
    const unida = mergeGeometries(this.partes, false);
    for (const parte of this.partes) parte.dispose();
    this.partes = [];
    return unida;
  }
}

/** Número pseudoaleatorio estable: el valle se ve igual en cada visita y en cada aparato. */
export function azar(i: number, semilla = 1) {
  const v = Math.sin(i * 12.9898 + semilla * 78.233) * 43758.5453;
  return v - Math.floor(v);
}
