"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ORGANOS, type IdOrgano } from "./cuerpoData";
import { HtmlInicial } from "./HtmlInicial";
import {
  CONFIG_ORGANOS_VISUAL,
  FRAG_ESCANER,
  FRAG_PIEL_FRESNEL,
  VERT_ESCANER,
  VERT_PIEL_FRESNEL,
  crearGeometriaCara,
  crearGeometriaCerebro,
  crearGeometriaCorazon,
  crearGeometriaCuerpo,
  crearGeometriaEsqueletoGuia,
  crearGeometriaEstomago,
  crearGeometriaHigado,
  crearGeometriaIntestinos,
  crearGeometriaMuebles,
  crearGeometriaParedSala,
  crearGeometriaPlataforma,
  crearGeometriaPulmones,
  crearGeometriaRinones,
  crearGeometriaSala,
} from "./cuerpoVisual";

type Props = {
  encontrados: IdOrgano[];
  nombres: boolean;
  onTocar: (id: IdOrgano) => void;
};

const MOVIMIENTO_MAXIMO_PX = 8; // más que esto es girar el cuerpo, no tocar un órgano
const sinToque = () => null;

// El paciente, desde la plataforma hasta la coronilla.
const CENTRO_ESCENA = new THREE.Vector3(0, 0.58, 0);
const ALTO_ESCENA = 7.5;
const ANCHO_ESCENA = 3.6;

/**
 * Deja al paciente entero debajo de la burbuja. La distancia depende del tamaño de la pantalla, y el
 * desplazamiento de la vista baja la imagen sin mover la cámara, para que siga girando alrededor del cuerpo.
 */
function Encuadre() {
  const ancho = useThree((s) => s.size.width);
  const alto = useThree((s) => s.size.height);
  const obtener = useThree((s) => s.get);

  useEffect(() => {
    const camara = obtener().camera as THREE.PerspectiveCamera;
    const reserva = ancho < 640 ? 132 : 84; // lo que ocupa la burbuja dentro del lienzo
    const altoLibre = Math.max(200, alto - reserva - 8);
    const tangente = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    const distancia = Math.max((ALTO_ESCENA * alto) / (altoLibre * 2 * tangente), ANCHO_ESCENA / (2 * tangente * (ancho / alto)));

    camara.position.sub(CENTRO_ESCENA).setLength(distancia).add(CENTRO_ESCENA);
    camara.setViewOffset(ancho, alto, 0, -reserva / 2, ancho, alto);
    return () => camara.clearViewOffset();
  }, [ancho, alto, obtener]);

  return null;
}

/** Silueta continua del paciente con shader médico Fresnel y guía esquelética */
function PacienteSilueta() {
  const geoCuerpo = useMemo(() => crearGeometriaCuerpo(), []);
  const geoEsqueleto = useMemo(() => crearGeometriaEsqueletoGuia(), []);
  const geoCara = useMemo(() => crearGeometriaCara(), []);
  // Pinta solo profundidad: así la piel muestra su capa exterior y no las uniones de adentro.
  const matProfundidad = useMemo(() => new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true }), []);

  const matFresnel = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_PIEL_FRESNEL,
        fragmentShader: FRAG_PIEL_FRESNEL,
        uniforms: {
          uRimColor: { value: new THREE.Color("#2DD4BF") },
          uBaseColor: { value: new THREE.Color("#A5F3FC") },
          uRimPower: { value: 2.4 },
          uBaseAlpha: { value: 0.1 },
          uRimAlpha: { value: 0.65 },
        },
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  return (
    <group>
      {/* Lo opaco y la guía se dibujan antes; la piel va al final, encima de todo (sinToque no bloquea órganos) */}
      <mesh geometry={geoCuerpo} material={matProfundidad} renderOrder={1} raycast={sinToque} />
      <mesh geometry={geoCuerpo} material={matFresnel} renderOrder={2} raycast={sinToque} />

      <mesh geometry={geoCara} raycast={sinToque}>
        <meshBasicMaterial vertexColors />
      </mesh>

      {/* Guía torácica sutil (esternón, costillas y columna vertebral al 15% de opacidad) */}
      <mesh geometry={geoEsqueleto} raycast={sinToque}>
        <meshStandardMaterial
          color="#CBD5E1"
          transparent
          opacity={0.16}
          depthWrite={false}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

/** Bio-Escáner médico con haz de luz horizontal animado */
function BioEscaner() {
  const hazRef = useRef<THREE.Mesh>(null);
  const matHazRef = useRef<THREE.ShaderMaterial>(null);
  const geoPared = useMemo(() => crearGeometriaParedSala(), []);
  const geoSala = useMemo(() => crearGeometriaSala(), []);
  const geoMuebles = useMemo(() => crearGeometriaMuebles(), []);
  const geoPlataforma = useMemo(() => crearGeometriaPlataforma(), []);

  const matHaz = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_ESCANER,
        fragmentShader: FRAG_ESCANER,
        uniforms: {
          uColor: { value: new THREE.Color("#2DD4BF") },
          uTime: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((state) => {
    if (matHazRef.current) {
      matHazRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (hazRef.current) {
      // Movimiento vertical suave del haz entre los pies y la cabeza
      hazRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 0.85) * 2.8;
    }
  });

  return (
    <group>
      {/* Sala sin luz ni tono: conserva el mismo verde menta del Consultorio del valle */}
      <mesh geometry={geoPared} raycast={sinToque}>
        <meshBasicMaterial vertexColors side={THREE.BackSide} toneMapped={false} />
      </mesh>
      <mesh geometry={geoSala} raycast={sinToque}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh geometry={geoMuebles} raycast={sinToque}>
        <meshStandardMaterial vertexColors roughness={0.7} />
      </mesh>

      {/* Plataforma circular del paciente con anillos LED */}
      <mesh geometry={geoPlataforma} raycast={sinToque}>
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Disco horizontal de escaneo holográfico */}
      <mesh ref={hazRef} rotation={[-Math.PI / 2, 0, 0]} raycast={sinToque}>
        <ringGeometry args={[0.2, 1.85, 36]} />
        <primitive object={matHaz} ref={matHazRef} attach="material" />
      </mesh>
    </group>
  );
}

interface ComponenteOrganoProps {
  id: IdOrgano;
  encontrado: boolean;
  nombreVisible: boolean;
  onTocar: (id: IdOrgano) => void;
  children: ReactNode;
}

/** Envoltorio de órgano con colisionador táctil ampliado y reacciones visuales */
function OrganoInteractivo({
  id,
  encontrado,
  nombreVisible,
  onTocar,
  children,
}: ComponenteOrganoProps) {
  const grupo = useRef<THREE.Group>(null);
  const ondaRef = useRef<THREE.Mesh>(null);
  const config = CONFIG_ORGANOS_VISUAL[id];
  const [encima, setEncima] = useState(false);
  const temblorHasta = useRef(0);
  const temblorPedido = useRef(false);

  useFrame((state) => {
    if (!grupo.current) return;
    const ahora = state.clock.elapsedTime;

    // 1. Latido fisiológico para corazón o respiración para pulmones
    let escalaPulso = 1;
    if (id === "corazon") {
      const ciclo = (ahora * 1.3) % 1;
      let beat = 0;
      if (ciclo < 0.15) {
        beat = Math.sin((ciclo / 0.15) * Math.PI) * 0.14;
      } else if (ciclo >= 0.2 && ciclo < 0.38) {
        beat = Math.sin(((ciclo - 0.2) / 0.18) * Math.PI) * 0.2;
      }
      escalaPulso += beat;
    } else if (id === "pulmones") {
      escalaPulso += Math.sin(ahora * 1.6) * 0.04;
    } else if (encontrado) {
      escalaPulso += Math.sin(ahora * 5) * 0.06;
    }

    // 2. Temblor amable en error (sin rojo agresivo). Se mide con el reloj de la escena.
    if (temblorPedido.current) {
      temblorPedido.current = false;
      temblorHasta.current = ahora + 0.25;
    }
    if (ahora < temblorHasta.current && !encontrado) {
      const dt = temblorHasta.current - ahora;
      grupo.current.position.x = config.posicion[0] + Math.sin(dt * 40) * 0.04;
    } else {
      grupo.current.position.x = config.posicion[0];
    }

    const hoverScale = encima ? 1.08 : 1.0;
    grupo.current.scale.setScalar(escalaPulso * hoverScale);

    // 3. Onda expansiva si fue encontrado
    if (ondaRef.current && encontrado) {
      const ondaT = (ahora * 2) % 1;
      ondaRef.current.scale.setScalar(1 + ondaT * 1.5);
      const mat = ondaRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.7 * (1 - ondaT));
    }
  });

  function manejarToque(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (e.delta <= MOVIMIENTO_MAXIMO_PX) {
      // Si el toque fue correcto, el órgano pasa a encontrado en el siguiente cuadro y no llega a temblar.
      if (!encontrado) temblorPedido.current = true;
      onTocar(id);
    }
  }

  return (
    <group
      ref={grupo}
      position={config.posicion}
      onClick={manejarToque}
      onPointerOver={(e) => {
        e.stopPropagation();
        setEncima(true);
      }}
      onPointerOut={() => setEncima(false)}
    >
      {/* Geometría anatómica del órgano */}
      {children}

      {/* Zonas invisibles para tocar con el dedo a 390 px. No se dibujan, pero sí reciben el toque. */}
      {config.zonas.map((zona) => (
        <mesh key={zona.centro.join()} position={zona.centro} scale={zona.escala} visible={false}>
          <sphereGeometry args={[zona.radio, 14, 10]} />
          <meshBasicMaterial />
        </mesh>
      ))}

      {/* Halo / onda expansiva de acierto verde esmeralda */}
      {encontrado ? (
        <mesh ref={ondaRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.hitRadio * 0.8, config.hitRadio * 1.05, 32]} />
          <meshBasicMaterial
            color="#10B981"
            transparent
            opacity={0.7}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ) : null}

      {/* Etiqueta flotante con nombre del órgano */}
      {nombreVisible || encima || encontrado ? (
        <Html
          center
          position={[
            config.etiquetaEn[0] - config.posicion[0],
            config.etiquetaEn[1] - config.posicion[1],
            config.etiquetaEn[2] - config.posicion[2],
          ]}
          zIndexRange={[5, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap text-white shadow-sm transition-colors ${
              encontrado ? "bg-[#059669] ring-2 ring-[#34D399]" : "bg-[#1E293B]/85"
            }`}
          >
            {ORGANOS[id].nombre}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

/** Conjunto completo de los 7 órganos anatómicos de alta fidelidad */
function ColeccionOrganos({ encontrados, nombres, onTocar }: Props) {
  const geoCerebro = useMemo(() => crearGeometriaCerebro(), []);
  const geoCorazon = useMemo(() => crearGeometriaCorazon(), []);
  const geoPulmones = useMemo(() => crearGeometriaPulmones(), []);
  const geoHigado = useMemo(() => crearGeometriaHigado(), []);
  const geoEstomago = useMemo(() => crearGeometriaEstomago(), []);
  const geoIntestinos = useMemo(() => crearGeometriaIntestinos(), []);
  const geoRinones = useMemo(() => crearGeometriaRinones(), []);

  function matOrgano(encontrado: boolean) {
    return (
      <meshStandardMaterial
        vertexColors
        roughness={0.45}
        metalness={0.08}
        emissive={encontrado ? new THREE.Color("#10B981") : new THREE.Color("#000000")}
        emissiveIntensity={encontrado ? 0.65 : 0}
      />
    );
  }

  return (
    <group>
      {/* 1. CEREBRO */}
      <OrganoInteractivo
        id="cerebro"
        encontrado={encontrados.includes("cerebro")}
        nombreVisible={nombres}
        onTocar={onTocar}
      >
        <mesh geometry={geoCerebro}>{matOrgano(encontrados.includes("cerebro"))}</mesh>
      </OrganoInteractivo>

      {/* 2. PULMONES */}
      <OrganoInteractivo
        id="pulmones"
        encontrado={encontrados.includes("pulmones")}
        nombreVisible={nombres}
        onTocar={onTocar}
      >
        <mesh geometry={geoPulmones}>{matOrgano(encontrados.includes("pulmones"))}</mesh>
      </OrganoInteractivo>

      {/* 3. CORAZÓN */}
      <OrganoInteractivo
        id="corazon"
        encontrado={encontrados.includes("corazon")}
        nombreVisible={nombres}
        onTocar={onTocar}
      >
        <mesh geometry={geoCorazon}>{matOrgano(encontrados.includes("corazon"))}</mesh>
      </OrganoInteractivo>

      {/* 4. HÍGADO */}
      <OrganoInteractivo
        id="higado"
        encontrado={encontrados.includes("higado")}
        nombreVisible={nombres}
        onTocar={onTocar}
      >
        <mesh geometry={geoHigado}>{matOrgano(encontrados.includes("higado"))}</mesh>
      </OrganoInteractivo>

      {/* 5. ESTÓMAGO */}
      <OrganoInteractivo
        id="estomago"
        encontrado={encontrados.includes("estomago")}
        nombreVisible={nombres}
        onTocar={onTocar}
      >
        <mesh geometry={geoEstomago}>{matOrgano(encontrados.includes("estomago"))}</mesh>
      </OrganoInteractivo>

      {/* 6. INTESTINOS */}
      <OrganoInteractivo
        id="intestinos"
        encontrado={encontrados.includes("intestinos")}
        nombreVisible={nombres}
        onTocar={onTocar}
      >
        <mesh geometry={geoIntestinos}>{matOrgano(encontrados.includes("intestinos"))}</mesh>
      </OrganoInteractivo>

      {/* 7. RIÑONES */}
      <OrganoInteractivo
        id="rinones"
        encontrado={encontrados.includes("rinones")}
        nombreVisible={nombres}
        onTocar={onTocar}
      >
        <mesh geometry={geoRinones}>{matOrgano(encontrados.includes("rinones"))}</mesh>
      </OrganoInteractivo>
    </group>
  );
}

export default function CuerpoEscena(props: Props) {
  return (
    <div className="isolate h-full w-full touch-none select-none">
      <Canvas
        camera={{ position: [0, 0.58, 11], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#EDF9F2"]} />
        <HtmlInicial />
        <Encuadre />

        {/* Iluminación clara y médica de consultorio */}
        <ambientLight intensity={1.1} color="#FFFFFF" />
        <directionalLight position={[4, 6, 5]} intensity={1.5} color="#FFFBF0" />
        <directionalLight position={[-4, 2, -4]} intensity={0.9} color="#CCFBF1" />
        <pointLight position={[0, 4, 3]} intensity={1.2} distance={12} color="#F0FDFA" />

        {/* Sala médica y bio-escáner */}
        <BioEscaner />

        {/* Silueta continua y órganos */}
        <PacienteSilueta />
        <ColeccionOrganos {...props} />

        {/* Controles táctiles que permiten rotar para alcanzar los riñones dorsalmente */}
        <OrbitControls
          enablePan={false}
          minDistance={4.5}
          maxDistance={14}
          target={[0, 0.58, 0]}
        />
      </Canvas>
    </div>
  );
}
