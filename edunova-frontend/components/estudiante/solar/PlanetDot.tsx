/** Disco con el color real del planeta, el mismo que usa la escena 3D. */
export function PlanetDot({ color, className = "h-7 w-7" }: { color: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: `#${color.toString(16).padStart(6, "0")}` }}
    />
  );
}
