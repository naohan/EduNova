import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { Mosaico, TituloPantalla } from "@/components/estudiante/shared/kit";
import { CompassIcon, StorefrontIcon, SwordIcon } from "@/components/ui/icons";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla voz="Valle para recorrer el mapa vivo. Tablero para jugar en equipo. Duelo para retar a un compañero. Aventuras en tres dimensiones. Ligas para ver tus puntos. Tienda para gastar tus monedas.">
          Juegos
        </TituloPantalla>
        <nav aria-label="Juegos" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Mosaico href="/estudiante/valle" etiqueta="Valle" seccion="explorar" descripcion="Valle de los Saberes">
            <CompassIcon weight="duotone" className="h-20 w-20 text-[#2472CC]" aria-hidden />
          </Mosaico>
          <Mosaico
            href="/estudiante/juegos"
            etiqueta="Tablero"
            descripcion="Tablero en equipo"
            seccion="juego"
            imagen="/assets/juego ludico/icon_dado.png"
          />
          <Mosaico href="/estudiante/duelo" etiqueta="Duelo" seccion="juego">
            <SwordIcon weight="duotone" className="h-20 w-20 text-[#C98F00]" aria-hidden />
          </Mosaico>
          <Mosaico href="/estudiante/aventuras" etiqueta="Aventuras 3D" seccion="explorar" imagen="/assets/cohete.png" />
          <Mosaico href="/estudiante/ligas" etiqueta="Ligas" seccion="cooperar" imagen="/assets/juego ludico/icon_trofeo.png" />
          <Mosaico href="/estudiante/tienda" etiqueta="Tienda" seccion="magia">
            <StorefrontIcon weight="duotone" className="h-20 w-20 text-[#5636D9]" aria-hidden />
          </Mosaico>
        </nav>
      </div>
    </EstudianteLayout>
  );
}
