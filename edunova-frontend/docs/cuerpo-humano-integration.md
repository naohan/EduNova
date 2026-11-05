# Integración del explorador 3D (Cuerpo humano)

## Fuente de referencia

Repositorio analizado: [jceronch1/Cuerpo-humano_3D](https://github.com/jceronch1/Cuerpo-humano_3D.git)

Clonado localmente en `_ref-cuerpo-humano/` (solo referencia; no se sirve completo en producción).

## Librerías 3D del repo original

| Pieza | Tecnología |
|-------|------------|
| Galería principal (`index.html`) | **@google/model-viewer** `3.5.0` (Web Component sobre WebGL) |
| Modo Estudio (`studio.html`) | **Three.js** + `OrbitControls` + `GLTFLoader` |
| Modelos | Archivos **`.glb`** (glTF binario) por órgano |
| Datos | Fichas: sistema, función, ubicación, relación, resumen, dato curioso |

## Cómo modelan el cuerpo (repo original)

1. Cada órgano es un **mesh GLB** independiente (cerebro, corazón, pulmones…).
2. El visor principal carga el `.glb` en `<model-viewer>` (rotar, zoom, AR).
3. El modo Estudio arma el cuerpo por piezas con drag-and-drop en Three.js.
4. La UI educativa muestra anatomía 2D, miniaturas y datos clínicos/curiosos.

Los GLB originales son muy pesados (varios de 70–95 MB). En EduNova se incluyen solo órganos livianos (~7 MB) para el aula.

## Qué se implementó en EduNova

| Archivo | Rol |
|---------|-----|
| `components/estudiante/cuerpo/OrganViewer.tsx` | Visor React + Three.js + GLTFLoader |
| `components/estudiante/cuerpo/organData.ts` | Fichas educativas en español (12 órganos) |
| `app/estudiante/cuerpo/page.tsx` | Pantalla “Órganos del cuerpo humano” |
| `public/assets/cuerpo/3d/` | GLB: Cerebro, Corazón, Pulmones, Intestinos, Tiroides |
| `public/assets/cuerpo/miniaturas/` | Thumbs de todos los órganos |

Complemento pedagógico (no solo el modelo):

- Sistema, función, ubicación, relación, tamaño
- Resumen + dato curioso por órgano
- Carrusel con miniatura; badge **3D** si hay modelo
- Fallback esquemático (esfera + anillo) cuando no hay `.glb` local

## Cómo probarlo

1. `npm run dev`
2. Abrir `/estudiante/cuerpo`
3. Elegir corazón / cerebro / pulmones / intestinos / tiroides para ver GLB
4. El resto muestra ficha completa + vista esquemática

## Posibles mejoras

- Añadir más GLB comprimidos (Draco / meshopt) para hígado, estómago, riñones…
- Portar el modo Estudio (armar el cuerpo) desde `studio.js`
- Comparador lado a lado de dos órganos (como en el repo original)
- Imágenes de anatomía 2D en un panel secundario
