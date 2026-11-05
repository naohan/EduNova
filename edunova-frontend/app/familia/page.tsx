"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/docente/ui";
import { ageTierRange } from "@/lib/age-tier";
import {
  demoLogout,
  getBenchmark,
  getFamilyExplanation,
  getPassport,
  getStudentProfile,
  type PassportResponse,
} from "@/lib/api/client";
import { ageTierLabel } from "@/lib/api/helpers";
import type { SessionUser } from "@/lib/api/session";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";

// Portal del Tutor Familiar (HU-07). Diseño basado en el trabajo de Bryan Larico.

const META_PACTO = 1500;

// Mismos valores que la semilla del backend para Gloria: se usan si el servidor no responde.
const perfilEjemplo = {
  alias: "Gloria",
  ageTier: "AVENTURERO_10_12" as const,
  classroomCode: "EDU-402",
  streakDays: 12,
  novaCoins: 1240,
  overallProgressPercent: 82,
  topicToReinforce: "Suma de fracciones",
};
const comparacionEjemplo = { percentile: 78, vsClassroom: 8, vsOtherInstitutions: 5, vsIndependentLearners: 12 };
const explicacionEjemplo =
  "Usa una pizza: pártela en 4 partes iguales y come 1, ya comiste 1/4. Para sumar 1/3 + 1/4, primero corta las dos pizzas en 12 partes iguales: 4/12 + 3/12 = 7/12.";

const conSigno = (n: number) => `${n > 0 ? "+" : ""}${n}`;

function Metrica({ label, value, detalle }: { label: string; value: string; detalle: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold text-[#6B7280]">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-[#17164F] sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-[#6B7280]">{detalle}</div>
    </div>
  );
}

function Portal({ tutor, studentId, onSalir }: { tutor: SessionUser; studentId: string; onSalir: () => void }) {
  const perfilApi = useApi(() => getStudentProfile(studentId), [studentId]);
  const comparacionApi = useApi(() => getBenchmark(studentId), [studentId]);
  const [explicacion, setExplicacion] = useState<string | null>(null);
  const [explicando, setExplicando] = useState(false);
  const [pasaporte, setPasaporte] = useState<PassportResponse | null>(null);
  const [generando, setGenerando] = useState(false);
  const [errorPasaporte, setErrorPasaporte] = useState<string | null>(null);

  const perfil = perfilApi.status === "ok" ? perfilApi.data : perfilEjemplo;
  const comparacion = comparacionApi.status === "ok" ? comparacionApi.data : comparacionEjemplo;
  const sinDatosReales = perfilApi.status === "error" || comparacionApi.status === "error";
  const tema = perfil.topicToReinforce ?? perfilEjemplo.topicToReinforce;
  const avancePacto = Math.min(100, Math.round((perfil.novaCoins / META_PACTO) * 100));

  async function explicar() {
    setExplicando(true);
    const r = await getFamilyExplanation(tema);
    setExplicacion(r.ok ? r.data.explanation : explicacionEjemplo);
    setExplicando(false);
  }

  async function generarPasaporte() {
    setGenerando(true);
    setErrorPasaporte(null);
    const r = await getPassport(studentId);
    if (r.ok) setPasaporte(r.data);
    else setErrorPasaporte("No se pudo generar el pasaporte. Intenta de nuevo.");
    setGenerando(false);
  }

  const comparaciones = [
    { label: "Frente a su aula", valor: comparacion.vsClassroom },
    { label: "Frente a otras escuelas", valor: comparacion.vsOtherInstitutions },
    { label: "Frente a estudiantes autónomos", valor: comparacion.vsIndependentLearners },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4FF] text-[#17164F]">
      <header className="sticky top-0 z-40 border-b border-[#E8E0FF] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/assets/Logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-[family-name:var(--font-fredoka)] text-xl font-semibold">EduNova Familia</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-bold md:inline">{tutor.alias}</span>
            <button
              type="button"
              onClick={onSalir}
              className="text-xs font-bold text-[#6B7280] hover:text-[#E11D48]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {sinDatosReales ? (
          <p role="status" className="rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
            No se pudo conectar con el servidor: se muestran datos de ejemplo.
          </p>
        ) : null}

        <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#5636D9_0%,#3B229D_100%)] p-6 text-white shadow-lg sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold sm:text-3xl">
              Acompañando el aprendizaje de {perfil.alias}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {perfil.ageTier
                ? `${perfil.alias} está en el nivel ${ageTierLabel[perfil.ageTier]} (${ageTierRange[perfil.ageTier]}). `
                : ""}
              Aquí ves su avance y cómo ayudarle en casa.
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-2 right-4 opacity-20 sm:opacity-30">
            <Image src="/assets/woebling.png" alt="" width={160} height={146} />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metrica label="Días seguidos" value={`${perfil.streakDays} días`} detalle="Su racha de estudio" />
          <Metrica label="NovaCoins" value={perfil.novaCoins.toLocaleString("es-PE")} detalle="Ganadas aprendiendo" />
          <Metrica
            label="Avance general"
            value={`${perfil.overallProgressPercent}%`}
            detalle="De los temas del aula"
          />
          <Metrica
            label="Frente a su edad"
            value={`Top ${100 - comparacion.percentile}%`}
            detalle={`Supera al ${comparacion.percentile}% de su edad`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col justify-between rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold">¿Cómo se lo explico en casa?</h2>
              <p className="mt-1 text-xs text-[#6B7280]">Una explicación con ejemplos cotidianos, lista para leer.</p>
              <div className="mt-4 rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-4">
                <div className="text-xs font-bold text-[#5636D9]">Tema para reforzar</div>
                <div className="mt-0.5 text-sm font-bold">{tema}</div>
              </div>
              {explicacion ? (
                <p className="mt-4 rounded-2xl border border-[#A7F3D0] bg-[#E9F9F0] p-4 text-sm leading-relaxed text-[#065F46]">
                  {explicacion}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={explicar}
              disabled={explicando}
              className="mt-6 w-full rounded-2xl bg-[#5636D9] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#4324bd] disabled:opacity-60"
            >
              {explicando ? "Preparando la explicación…" : "Explicar en casa"}
            </button>
          </section>

          <section className="rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Comparación con otros estudiantes</h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              Comparación anónima con estudiantes de su edad en la red.
            </p>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-sm font-semibold">
                <span>Percentil en su edad</span>
                <span>{comparacion.percentile}</span>
              </div>
              <ProgressBar value={comparacion.percentile} ariaLabel="Percentil en su edad" color="#5636D9" />
            </div>
            <ul className="mt-4 space-y-2">
              {comparaciones.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between rounded-xl bg-[#F7F4FF] px-3 py-2.5 text-sm"
                >
                  <span>{c.label}</span>
                  <span className="font-bold text-[#5636D9]">{conSigno(c.valor)} puntos</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Pacto de recompensa familiar</h2>
            <p className="mt-1 text-xs text-[#6B7280]">Una meta acordada en casa, con un premio real.</p>
            <div className="mt-4 rounded-2xl border border-[#FDE68A] bg-[#FFF9E6] p-5">
              <div className="text-base font-extrabold">{META_PACTO.toLocaleString("es-PE")} NovaCoins</div>
              <div className="mt-1 text-xs text-[#92400E]">
                Premio: <strong>tarde de cine con palomitas</strong>
              </div>
              <div className="mb-1 mt-3 flex justify-between text-[11px] font-bold text-[#6B7280]">
                <span>
                  {perfil.novaCoins.toLocaleString("es-PE")} / {META_PACTO.toLocaleString("es-PE")}
                </span>
                <span>{avancePacto}%</span>
              </div>
              <ProgressBar value={avancePacto} ariaLabel="Avance del pacto" color="#F59E0B" />
            </div>
          </section>

          <section className="rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Pasaporte EduNova</h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              Un código QR con sus logros, para llevarlo a otro colegio.
            </p>
            {pasaporte ? (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Image
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(pasaporte.qrSvg)}`}
                  alt={`Código QR del pasaporte de ${pasaporte.alias}`}
                  width={160}
                  height={160}
                  unoptimized
                  className="rounded-xl border border-[#E8E0FF]"
                />
                <ul className="min-w-0 flex-1 space-y-1 text-sm">
                  {pasaporte.competencies.map((c) => (
                    <li key={c.unit}>
                      <span className="font-semibold">{c.unit}:</span>{" "}
                      {c.level === "LOGRADO" ? "Logrado" : "En progreso"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <button
                type="button"
                onClick={generarPasaporte}
                disabled={generando}
                className="mt-4 w-full rounded-2xl border-2 border-[#5636D9] px-5 py-3 text-sm font-bold text-[#5636D9] hover:bg-[#F2EEFF] disabled:opacity-60"
              >
                {generando ? "Generando…" : "Generar pasaporte QR"}
              </button>
            )}
            {errorPasaporte ? (
              <p role="alert" className="mt-3 text-xs text-[#991B1B]">
                {errorPasaporte}
              </p>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function FamiliaPage() {
  const router = useRouter();
  const usuario = useSessionUser();

  if (usuario === undefined) return <div className="min-h-screen bg-[#F7F4FF]" />;

  if (usuario?.role !== "FAMILY_TUTOR" || !usuario.linkedStudentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4FF] p-4">
        <div className="max-w-sm rounded-3xl border border-[#E8E0FF] bg-white p-8 text-center shadow-sm">
          <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            Portal de la familia
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Inicia sesión como tutor familiar vinculado a un estudiante para ver su avance.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-[#5636D9] px-5 py-3 text-sm font-bold text-white"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Portal
      tutor={usuario}
      studentId={usuario.linkedStudentId}
      onSalir={() => {
        demoLogout();
        router.push("/login");
      }}
    />
  );
}
