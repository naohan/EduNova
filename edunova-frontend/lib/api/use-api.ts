"use client";

import { useEffect, useState } from "react";
import type { ApiResult } from "./client";

export type ApiState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: string };

// Carga datos del backend desde un componente de cliente.
// Con cacheComponents activo, un fetch sin caché en un componente de servidor exige <Suspense>;
// hacerlo aquí evita ese problema. Si falla, la pantalla muestra sus datos fijos de respaldo.
//
//   const unit = useApi(() => getUnit("unit-solar-system"), ["unit-solar-system"]);
//   const titulo = unit.status === "ok" ? unit.data.title : unidadActual.titulo;
export function useApi<T>(fetcher: () => Promise<ApiResult<T>>, deps: ReadonlyArray<unknown> = []): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetcher().then((r) => {
      if (cancelled) return;
      setState(r.ok ? { status: "ok", data: r.data } : { status: "error", error: r.error });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
