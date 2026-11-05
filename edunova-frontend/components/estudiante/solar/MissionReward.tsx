import Image from "next/image";
import Link from "next/link";
import type { EstadoPuntos, Logro } from "./useSolarMissions";

const avisoPuntos: Record<EstadoPuntos, string> = {
  guardando: "Guardando tus puntos…",
  guardado: "Tus puntos ya se guardaron.",
  sinSesion: "Inicia sesión como estudiante para guardar tus puntos.",
  error: "No se pudieron guardar tus puntos.",
};

/** Animación de logro al completar una misión (HU-03). */
export function MissionReward({
  logro,
  hayMasMisiones,
  onContinuar,
  onReintentar,
}: {
  logro: Logro;
  hayMasMisiones: boolean;
  onContinuar: () => void;
  onReintentar: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Misión completada"
      className="absolute inset-0 z-10 flex items-center justify-center bg-[#0b0a2e]/70 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center text-[#17164F] shadow-2xl">
        <Image
          src="/assets/woebling.png"
          alt=""
          width={80}
          height={73}
          className="mx-auto h-auto w-16 motion-safe:animate-bounce"
        />
        <h2 className="mt-1 font-[family-name:var(--font-fredoka)] text-xl font-semibold">¡Misión completada!</h2>
        <p className="mt-1 text-sm text-[#17164F]/80">{logro.dato}</p>
        <div className="mt-3 flex justify-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-[#F2EEFF] px-3 py-1.5 text-[#5636D9]">+{logro.mision.xp} XP</span>
          <span className="rounded-full bg-[#FFF6E8] px-3 py-1.5 text-[#92400E]">
            +{logro.mision.coins} NovaCoins
          </span>
        </div>
        <p className="mt-2 text-xs text-[#6B7280]">{avisoPuntos[logro.puntos]}</p>
        {logro.puntos === "error" ? (
          <button type="button" onClick={onReintentar} className="mt-1 text-xs font-bold text-[#5636D9]">
            Reintentar
          </button>
        ) : null}
        {hayMasMisiones ? (
          <button
            type="button"
            onClick={onContinuar}
            className="mt-3 w-full rounded-2xl bg-[#5636D9] py-3 text-sm font-bold text-white"
          >
            Siguiente misión
          </button>
        ) : (
          <Link
            href="/estudiante/practica"
            className="mt-3 block w-full rounded-2xl bg-[#5636D9] py-3 text-sm font-bold text-white"
          >
            Ir a practicar →
          </Link>
        )}
      </div>
    </div>
  );
}
