"use client";

import { useConexion } from "@/lib/use-conexion";

/** HU-08: indicador en vivo de conexión y de progreso por sincronizar. */
export function ConexionBadge() {
  const { online, pendientes } = useConexion();

  const estado = !online
    ? { texto: "Modo Offline · Caché Local Activa", punto: "bg-[#F59E0B]", caja: "bg-[#FEF3C7] text-[#92400E]" }
    : pendientes > 0
      ? { texto: `Sincronizando ${pendientes}…`, punto: "bg-[#5636D9]", caja: "bg-[#F2EEFF] text-[#5636D9]" }
      : { texto: "Online · Sincronizado", punto: "bg-[#2DBE70]", caja: "bg-[#E9F9F0] text-[#127A43]" };

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${estado.caja}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${estado.punto}`} />
      {estado.texto}
      {!online && pendientes > 0 ? ` · ${pendientes} por enviar` : null}
    </span>
  );
}
