"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { preguntaPractica } from "@/components/estudiante/data";

export default function Page() {
  const [sel, setSel] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  function responder(id: string) {
    const op = preguntaPractica.opciones.find((o) => o.id === id)!;
    setSel(id);
    setOk(op.correcta);
  }

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-sm text-[#6B7280]">Casilla · Pregunta</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            {preguntaPractica.enunciado}
          </h1>
        </header>

        <div className="space-y-3">
          {preguntaPractica.opciones.map((op) => {
            let cls = "border-[#E8E0FF] bg-white";
            if (sel === op.id) {
              cls = op.correcta
                ? "border-[#2DBE70] bg-[#E9F9F0]"
                : "border-[#EF4444] bg-[#FFF5F5]";
            }
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => responder(op.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 ${cls} px-4 py-3.5 text-left shadow-sm`}
              >
                <span className="text-2xl">{op.emoji}</span>
                <span className="flex-1 font-bold text-[#17164F]">{op.label}</span>
                {sel === op.id && op.correcta ? (
                  <span className="text-[#2DBE70]">✓</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {ok !== null ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-end gap-2">
              <Image
                src="/assets/woebling.png"
                alt="Woebling"
                width={56}
                height={52}
                className="h-auto w-12"
              />
              <div
                className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm font-semibold shadow-sm ${
                  ok ? "bg-[#E9F9F0] text-[#065F46]" : "bg-[#FFF6E8] text-[#92400E]"
                }`}
              >
                {ok ? preguntaPractica.feedbackCorrecto : preguntaPractica.feedbackIncorrecto}
              </div>
            </div>
            {ok ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6E8] px-3 py-1.5 text-sm font-bold text-[#92400E]">
                ⭐ +{preguntaPractica.puntos} puntos
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {ok ? (
            <Link
              href="/estudiante/juegos"
              className="flex w-full items-center justify-center rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white"
            >
              Continuar
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-2xl bg-[#E8E0FF] py-4 text-sm font-bold text-[#9CA3AF]"
            >
              Elige una respuesta
            </button>
          )}
          <Link
            href="/estudiante/juegos"
            className="block text-center text-sm font-semibold text-[#5636D9]"
          >
            Volver al tablero
          </Link>
        </div>
      </div>
    </EstudianteLayout>
  );
}
