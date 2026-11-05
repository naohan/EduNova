"use client";

import { useState } from "react";
import Link from "next/link";
import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { classInfo } from "@/components/docente/data";

type TipoId = "cuestionario" | "rubrica" | "cotejo" | "practica" | "autoeval";

const tipos: {
  id: TipoId;
  nombre: string;
  desc: string;
  icon: string;
}[] = [
  { id: "cuestionario", nombre: "Cuestionario", desc: "Preguntas con puntaje", icon: "📄" },
  { id: "rubrica", nombre: "Rúbrica", desc: "Criterios y niveles de logro", icon: "▦" },
  { id: "cotejo", nombre: "Lista de cotejo", desc: "Verificación de evidencias", icon: "☑️" },
  {
    id: "practica",
    nombre: "Actividad práctica",
    desc: "Proyecto, experimento o reto",
    icon: "🧪",
  },
  {
    id: "autoeval",
    nombre: "Autoevaluación",
    desc: "Con caritas 😄 😐 ☹️",
    icon: "😊",
  },
];

const inputCls =
  "w-full rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-sm text-[#17164F] focus:outline-none focus:ring-2 focus:ring-[#5636D9]/25";

function Formulario({ tipo }: { tipo: TipoId }) {
  if (tipo === "cuestionario") {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-[#6B7280]">Pregunta</span>
          <input type="text" className={`${inputCls} mt-1`} placeholder="Escribe la pregunta" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-[#6B7280]">Puntaje</span>
          <input type="number" className={`${inputCls} mt-1`} defaultValue={2} />
        </label>
        <button type="button" className="text-sm font-semibold text-[#5636D9]">
          + Agregar pregunta
        </button>
      </div>
    );
  }
  if (tipo === "rubrica") {
    return (
      <div className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full overflow-hidden rounded-xl border border-[#E8E0FF] text-sm">
            <thead className="bg-[#F2EEFF] text-[#6B7280]">
              <tr>
                <th className="px-2 py-2 text-left">Criterio</th>
                <th className="px-2 py-2 text-left">Inicio</th>
                <th className="px-2 py-2 text-left">Proceso</th>
                <th className="px-2 py-2 text-left">Logrado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2">
                  <input className={inputCls} defaultValue="Resolución" />
                </td>
                <td className="px-2 py-2">
                  <input className={inputCls} defaultValue="0-8" />
                </td>
                <td className="px-2 py-2">
                  <input className={inputCls} defaultValue="9-14" />
                </td>
                <td className="px-2 py-2">
                  <input className={inputCls} defaultValue="15-20" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  if (tipo === "cotejo") {
    return (
      <div className="space-y-2">
        {["Identifica el problema", "Aplica el procedimiento", "Llega a la respuesta"].map(
          (it) => (
            <label key={it} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-[#5636D9]" /> {it}
            </label>
          ),
        )}
      </div>
    );
  }
  if (tipo === "practica") {
    return (
      <div className="space-y-3">
        <input className={inputCls} placeholder="Título de la actividad" />
        <textarea className={inputCls} rows={3} placeholder="Descripción" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {["😄 Bien", "😐 Regular", "☹️ Difícil"].map((o) => (
        <button
          key={o}
          type="button"
          className="rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] py-4 text-sm font-medium"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function Page() {
  const [tipo, setTipo] = useState<TipoId | null>(null);
  const seleccionado = tipos.find((t) => t.id === tipo);

  return (
    <DocenteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* Mobile */}
        <div className="lg:hidden">
          <div className="mb-1 flex items-center gap-2">
            <Link href="/docente" className="text-lg text-[#5636D9]" aria-label="Volver">
              ‹
            </Link>
            <h1 className="flex-1 text-center font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
              Registro de evaluación
            </h1>
            <span className="w-5" />
          </div>
          <p className="mb-5 text-center text-sm font-semibold text-[#17164F]">
            Crear nueva evaluación
          </p>

          {!tipo ? (
            <div className="space-y-3">
              {tipos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-white p-4 text-left shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EEFF] text-xl text-[#5636D9]">
                    {t.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[#17164F]">{t.nombre}</span>
                    <span className="text-xs text-[#6B7280]">{t.desc}</span>
                  </span>
                  <span className="text-[#C4B5FD]">›</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setTipo(null)}
                className="text-sm font-semibold text-[#5636D9]"
              >
                ‹ Volver
              </button>
              <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
                <h2 className="mb-3 font-bold text-[#17164F]">Crear {seleccionado?.nombre}</h2>
                <Formulario tipo={tipo} />
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#5636D9] py-3.5 text-sm font-bold text-white"
                >
                  Guardar evaluación
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <header className="mb-6">
            <p className="text-sm text-[#6B7280]">Registro de evaluación</p>
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
              Crear nueva evaluación
            </h1>
            <p className="mt-1 text-[#6B7280]">
              {classInfo.curso} · {classInfo.grado}
            </p>
          </header>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              {tipos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${
                    tipo === t.id
                      ? "border-[#5636D9] bg-[#F2EEFF]"
                      : "border-[#E8E0FF] bg-white"
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span>
                    <span className="block font-bold text-[#17164F]">{t.nombre}</span>
                    <span className="text-xs text-[#6B7280]">{t.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="col-span-2 rounded-2xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
              {tipo ? (
                <>
                  <h2 className="mb-4 font-bold text-[#17164F]">
                    Crear {seleccionado?.nombre}
                  </h2>
                  <Formulario tipo={tipo} />
                  <button
                    type="button"
                    className="mt-5 rounded-xl bg-[#5636D9] px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Guardar evaluación
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#6B7280]">
                  Selecciona un tipo de instrumento a la izquierda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DocenteLayout>
  );
}
