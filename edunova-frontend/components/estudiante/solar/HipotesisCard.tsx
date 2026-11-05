"use client";

import { useState } from "react";
import { validateHypothesis } from "@/lib/api/client";
import type { HypothesisReview } from "@/lib/api/edunova-contract";
import { guardarProgreso } from "@/lib/api/offline-queue";
import { useSessionUser } from "@/lib/api/use-session";
import { useAgeTier } from "@/lib/age-tier";
import { LightbulbIcon } from "@/components/ui/icons";

/** HU-02: en modo Creador el laboratorio plantea preguntas de hipótesis abierta. */
export function HipotesisCard() {
  const [tier] = useAgeTier();
  const usuario = useSessionUser();
  const [texto, setTexto] = useState("");
  const [revisando, setRevisando] = useState(false);
  const [revision, setRevision] = useState<HypothesisReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (tier !== "CREADOR_13_15") return null;

  async function revisar() {
    setRevisando(true);
    setError(null);
    const r = await validateHypothesis(texto, "SOLAR_SYSTEM");
    setRevisando(false);
    if (!r.ok) {
      setError("No se pudo revisar tu hipótesis. Inténtalo otra vez.");
      return;
    }
    setRevision(r.data);
    if (r.data.valid && usuario?.role === "STUDENT") {
      await guardarProgreso(usuario.id, [{ xp: r.data.bonusXP }]);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-[#E8E0FF] bg-white p-5">
      <h2 className="flex items-center gap-2 font-bold text-[#17164F]">
        <LightbulbIcon weight="duotone" className="h-5 w-5 text-[#5636D9]" aria-hidden />
        ¿Qué pasaría si...?
      </h2>
      <label className="mt-2 block text-sm text-[#17164F]">
        ¿Qué pasaría con las órbitas de los planetas si el Sol tuviera la mitad de su masa?
        <textarea
          rows={3}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setRevision(null);
          }}
          placeholder="Si el Sol tuviera menos masa, entonces..."
          className="mt-2 w-full rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] p-3 text-sm text-[#17164F] outline-none focus:border-[#5636D9]"
        />
      </label>
      <button
        type="button"
        onClick={() => void revisar()}
        disabled={revisando || !texto.trim() || revision?.valid}
        className="mt-3 rounded-xl bg-[#5636D9] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {revisando ? "Revisando…" : "Revisar mi hipótesis"}
      </button>
      {error ? (
        <p role="alert" className="mt-3 rounded-xl bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">
          {error}
        </p>
      ) : null}
      {revision ? (
        <p
          role="status"
          className={`mt-3 rounded-xl p-3 text-sm ${
            revision.valid ? "bg-[#E9F9F0] text-[#127A43]" : "bg-[#FEF3C7] text-[#92400E]"
          }`}
        >
          {revision.feedback}
          {revision.valid ? ` +${revision.bonusXP} XP` : null}
        </p>
      ) : null}
    </section>
  );
}
