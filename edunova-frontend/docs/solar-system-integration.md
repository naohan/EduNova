# Integración del simulador 3D (Sistema Solar)

## Fuente de referencia

Repositorio analizado: [Ozymandros/solar-system](https://github.com/Ozymandros/solar-system.git)

Clonado localmente en `_ref-solar-system/` (solo referencia; no se sirve en producción).

## Librería 3D

| Aspecto | Detalle |
|---------|---------|
| Librería | **Three.js** `^0.160.0` |
| Controles | `OrbitControls` (rotar / zoom / pan) |
| Etiquetas (en el repo original) | `CSS2DRenderer` |
| Enfoque | WebGL en el navegador, sin motor nativo |

En EduNova se instaló la misma versión:

```bash
npm install three@0.160.0
```

## Cómo modelan el sistema solar (repo original)

1. **Escena Three.js** con Sol + 8 planetas (+ 54 lunas en el original).
2. **Órbitas keplerianas** (elementos J2000.0 + ecuación de Kepler) en `src/orbital.js`.
3. **Meshes** `SphereGeometry` + materiales estándar / texturas opcionales.
4. **Anillos de Saturno** con `RingGeometry`.
5. **Cámara** libre o anclada a un cuerpo con `OrbitControls`.
6. **Panel educativo** con datos (diámetro, temperatura, dato curioso).

Es una visualización educativa (escalas comprimidas), no una efemérides de precisión.

## Qué se implementó en EduNova

| Archivo | Rol |
|---------|-----|
| `components/estudiante/solar/SolarSystemViewer.tsx` | Visor React + Three.js |
| `components/estudiante/solar/planetData.ts` | Datos en español |
| `app/estudiante/explorar/page.tsx` | Pantalla “Explora en 3D” |

Simplificaciones respecto al repo original (adecuadas al aula):

- Órbitas **circulares** (más ligeras en móvil).
- Sin lunas (mejor rendimiento).
- Texturas procedurales / colores sólidos (sin carpeta `textures/`).
- UI integrada al diseño EduNova (carrusel, ficha, Woebling).

## Cómo probarlo

1. `npm run dev`
2. Abrir `/estudiante/explorar`
3. Arrastrar para rotar, scroll para zoom, tocar un planeta o usar el carrusel.

## Posibles mejoras

- Cargar texturas 2K (Solar System Scope) en `public/textures/`.
- Añadir Luna de la Tierra y anillos más realistas.
- Portar órbitas keplerianas completas desde `_ref-solar-system/src/orbital.js`.
- Velocidad del tiempo (slider 0–100×) como en el simulador original.
