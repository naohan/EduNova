"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

type Part = "face" | "edge" | "vertex" | null;

type Props = {
  geometry?: "cube" | "sphere" | "cone" | "cylinder" | "pyramid" | "prism";
  onComplete: () => void;
  onClose: () => void;
};

const FACTS: Record<string, { title: string; caras: number; aristas: number; vertices: number; tip: string }> = {
  cube: {
    title: "Cubo",
    caras: 6,
    aristas: 12,
    vertices: 8,
    tip: "Todas las caras son cuadrados iguales.",
  },
  sphere: {
    title: "Esfera",
    caras: 1,
    aristas: 0,
    vertices: 0,
    tip: "No tiene aristas ni vértices; es perfectamente redonda.",
  },
  cone: {
    title: "Cono",
    caras: 2,
    aristas: 1,
    vertices: 1,
    tip: "Tiene una base circular y un vértice en la punta.",
  },
  cylinder: {
    title: "Cilindro",
    caras: 3,
    aristas: 2,
    vertices: 0,
    tip: "Dos bases circulares unidas por una superficie curva.",
  },
  pyramid: {
    title: "Pirámide",
    caras: 5,
    aristas: 8,
    vertices: 5,
    tip: "Base cuadrada + 4 triángulos que se unen arriba.",
  },
  prism: {
    title: "Prisma",
    caras: 5,
    aristas: 9,
    vertices: 6,
    tip: "Dos bases iguales unidas por caras rectangulares.",
  },
};

function InteractiveCube({
  highlight,
  onPick,
}: {
  highlight: Part;
  onPick: (p: Part) => void;
}) {
  const edgeDefs = [
    { pos: [0, -0.5, 0.5] as const, rot: [0, 0, 0] as const },
    { pos: [0, -0.5, -0.5] as const, rot: [0, 0, 0] as const },
    { pos: [0.5, -0.5, 0] as const, rot: [0, Math.PI / 2, 0] as const },
    { pos: [-0.5, -0.5, 0] as const, rot: [0, Math.PI / 2, 0] as const },
    { pos: [0, 0.5, 0.5] as const, rot: [0, 0, 0] as const },
    { pos: [0, 0.5, -0.5] as const, rot: [0, 0, 0] as const },
    { pos: [0.5, 0.5, 0] as const, rot: [0, Math.PI / 2, 0] as const },
    { pos: [-0.5, 0.5, 0] as const, rot: [0, Math.PI / 2, 0] as const },
    { pos: [0.5, 0, 0.5] as const, rot: [0, 0, Math.PI / 2] as const },
    { pos: [-0.5, 0, 0.5] as const, rot: [0, 0, Math.PI / 2] as const },
    { pos: [0.5, 0, -0.5] as const, rot: [0, 0, Math.PI / 2] as const },
    { pos: [-0.5, 0, -0.5] as const, rot: [0, 0, Math.PI / 2] as const },
  ];

  const verts: [number, number, number][] = [
    [-0.5, -0.5, -0.5],
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, -0.5],
    [-0.5, 0.5, 0.5],
    [0.5, -0.5, -0.5],
    [0.5, -0.5, 0.5],
    [0.5, 0.5, -0.5],
    [0.5, 0.5, 0.5],
  ];

  return (
    <group>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick("face");
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={highlight === "face" ? "#A78BFA" : "#7C6BF2"}
          transparent
          opacity={0.55}
          roughness={0.2}
          metalness={0.1}
          transmission={0.2}
        />
      </mesh>

      {edgeDefs.map((e, i) => (
        <mesh
          key={`e-${i}`}
          position={e.pos}
          rotation={e.rot}
          onClick={(ev) => {
            ev.stopPropagation();
            onPick("edge");
          }}
        >
          <boxGeometry args={[1.02, 0.045, 0.045]} />
          <meshStandardMaterial
            color={highlight === "edge" ? "#FFC928" : "#17164F"}
            emissive={highlight === "edge" ? "#FFC928" : "#000"}
            emissiveIntensity={highlight === "edge" ? 0.4 : 0}
          />
        </mesh>
      ))}

      {verts.map((v, i) => (
        <mesh
          key={`v-${i}`}
          position={v}
          onClick={(ev) => {
            ev.stopPropagation();
            onPick("vertex");
          }}
        >
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial
            color={highlight === "vertex" ? "#25CFE0" : "#F2EEFF"}
            emissive={highlight === "vertex" ? "#25CFE0" : "#000"}
            emissiveIntensity={highlight === "vertex" ? 0.5 : 0}
          />
        </mesh>
      ))}

      {highlight && (
        <Html position={[0, 1.15, 0]} center>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17164F] shadow">
            {highlight === "face" && "Cara"}
            {highlight === "edge" && "Arista"}
            {highlight === "vertex" && "Vértice"}
          </div>
        </Html>
      )}
    </group>
  );
}

function ShapeMesh({
  type,
}: {
  type: NonNullable<Props["geometry"]>;
}) {
  if (type === "sphere") {
    return (
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshPhysicalMaterial color="#4C9EFF" roughness={0.25} metalness={0.1} />
      </mesh>
    );
  }
  if (type === "cone") {
    return (
      <mesh>
        <coneGeometry args={[0.6, 1.1, 32]} />
        <meshStandardMaterial color="#5636D9" roughness={0.3} />
      </mesh>
    );
  }
  if (type === "cylinder") {
    return (
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 1.1, 32]} />
        <meshStandardMaterial color="#2DBE70" roughness={0.3} />
      </mesh>
    );
  }
  if (type === "pyramid") {
    return (
      <mesh>
        <coneGeometry args={[0.7, 1.1, 4]} />
        <meshStandardMaterial color="#FF6B9D" roughness={0.3} />
      </mesh>
    );
  }
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial color="#7C6BF2" roughness={0.25} transmission={0.15} />
    </mesh>
  );
}

const QUIZ = [
  {
    q: "¿Cuántas caras tiene un cubo?",
    options: ["4", "6", "8"],
    answer: "6",
  },
  {
    q: "¿Cuántas aristas tiene un cubo?",
    options: ["8", "10", "12"],
    answer: "12",
  },
  {
    q: "¿Cuántos vértices tiene un cubo?",
    options: ["6", "8", "12"],
    answer: "8",
  },
];

export function GeometryExplorer({
  geometry = "cube",
  onComplete,
  onClose,
}: Props) {
  const [part, setPart] = useState<Part>(null);
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fact = FACTS[geometry] ?? FACTS.cube;
  const isCubeLesson = geometry === "cube";

  function answer(opt: string) {
    const current = QUIZ[step];
    if (opt === current.answer) {
      setFeedback("¡Correcto!");
      if (step >= QUIZ.length - 1) {
        setTimeout(() => onComplete(), 700);
      } else {
        setTimeout(() => {
          setStep((s) => s + 1);
          setFeedback(null);
        }, 600);
      }
    } else {
      setFeedback("Casi… toca el modelo y cuenta otra vez.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#17164F]/55 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Explorar en 3D
            </p>
            <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-white">
              {fact.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[280px] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#2a1f7a] to-[#17164F] shadow-xl">
            <Canvas
              camera={{ position: [2.4, 1.8, 2.8], fov: 42 }}
              dpr={[1, 1.75]}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[4, 6, 3]} intensity={1.3} />
              {isCubeLesson ? (
                <InteractiveCube highlight={part} onPick={setPart} />
              ) : (
                <ShapeMesh type={geometry} />
              )}
              <OrbitControls
                enablePan={false}
                minDistance={1.6}
                maxDistance={5}
              />
            </Canvas>
            <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/35 px-3 py-1 text-[11px] text-white">
              Arrastra para rotar · pellizca / scroll para zoom
              {isCubeLesson ? " · toca cara, arista o vértice" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[28px] bg-white p-4 shadow-xl">
            <dl className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-[#F2EEFF] p-2">
                <dt className="text-[#6B7280]">Caras</dt>
                <dd className="text-lg font-bold text-[#5636D9]">{fact.caras}</dd>
              </div>
              <div className="rounded-2xl bg-[#FFF6E0] p-2">
                <dt className="text-[#6B7280]">Aristas</dt>
                <dd className="text-lg font-bold text-[#17164F]">{fact.aristas}</dd>
              </div>
              <div className="rounded-2xl bg-[#EAF6FF] p-2">
                <dt className="text-[#6B7280]">Vértices</dt>
                <dd className="text-lg font-bold text-[#4C9EFF]">{fact.vertices}</dd>
              </div>
            </dl>
            <p className="text-sm text-[#5B5678]">{fact.tip}</p>

            {isCubeLesson && (
              <div className="flex flex-wrap gap-2">
                {(["face", "edge", "vertex"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPart(p)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      part === p
                        ? "bg-[#5636D9] text-white"
                        : "bg-[#F2EEFF] text-[#17164F]"
                    }`}
                  >
                    {p === "face" ? "Caras" : p === "edge" ? "Aristas" : "Vértices"}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-auto rounded-2xl border border-[#E8E0FF] p-3">
              <p className="text-xs font-semibold text-[#5636D9]">
                Pregunta {step + 1}/{QUIZ.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#17164F]">
                {QUIZ[step].q}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {QUIZ[step].options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => answer(opt)}
                    className="rounded-xl bg-[#F2EEFF] px-3 py-2.5 text-sm font-bold text-[#17164F] hover:bg-[#5636D9] hover:text-white"
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {feedback && (
                <p className="mt-2 text-xs font-semibold text-[#2DBE70]">{feedback}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
