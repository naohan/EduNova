import { Html } from "@react-three/drei";

/**
 * La primera etiqueta `Html` de una escena queda vacía con estas versiones de drei y React 19.
 * Esta, invisible, ocupa ese lugar para que se vean todas las etiquetas reales.
 * Debe ir antes que las demás dentro del `Canvas`.
 */
export function HtmlInicial() {
  return (
    <Html>
      <span hidden />
    </Html>
  );
}
