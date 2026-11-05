# Flujo de pantallas → aventura directa

Todas las entradas de curso llevan **de frente** a la experiencia interactiva (mapa 3D o exploración).

## Diagrama

```
Inicio estudiante
    └─ Aprender (/estudiante/ruta)
         ├─ Matemática ──────────────► /estudiante/matematica/mapa
         ├─ Comunicación ────────────► /estudiante/comunicacion/mapa
         ├─ Ciencia y Tecnología ────► /estudiante/cuerpo
         └─ Ciencias Sociales ───────► /estudiante/explorar

CTA "Comenzar mi aventura" ──────────► /estudiante/matematica/mapa

/estudiante/curso/[id] (opcional)
    └─ Elige tipo de aventura
         └─ Cualquier tarjeta / botón ─► curso.ctaHref (misma aventura)
```

## Pantallas documentadas

| Pantalla | Ruta | Acción principal |
|----------|------|------------------|
| Aprender (cursos) | `/estudiante/ruta` | Cada tarjeta abre la aventura del curso |
| Elige aventura | `/estudiante/curso/[id]` | Exploradores / Aventureros / Creadores → mapa |
| Mapa Matemática | `/estudiante/matematica/mapa` | Estaciones de geometría 3D |
| Mapa Comunicación | `/estudiante/comunicacion/mapa` | Reino de las Palabras + lectura |
| Cuerpo humano 3D | `/estudiante/cuerpo` | Órganos GLB / fichas |
| Sistema Solar 3D | `/estudiante/explorar` | Planetas Three.js |

## Botón Volver

En los mapas 3D, **Volver** regresa a `/estudiante/ruta` (lista de cursos).

## Datos de enlace

Definidos en `components/estudiante/data.ts` → `cursosAprender`:

- `href` = entrada desde Aprender (igual a `ctaHref` para ir de frente)
- `ctaHref` = destino de aventura

## Progreso

- Matemática: `localStorage` clave `edunova-math-map-progress-v1`
- Comunicación: `edunova-comu-map-progress-v1`
