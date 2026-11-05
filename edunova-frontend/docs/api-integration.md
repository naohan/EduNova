# Conectar el frontend con el backend

El backend está en https://github.com/nilton2005/edunova (`apps/api`). Esta carpeta, `lib/api/`, es el cliente que lo llama.

## Arrancar
El backend usa **PostgreSQL**. Hay dos formas de tenerlo:

**A. Usar el backend desplegado (recomendado, no instala nada).** Pide la URL de Render y ponla en `.env.local`:
```bash
cp .env.example .env.local        # y cambia NEXT_PUBLIC_API_URL por la URL de Render
npm run dev                       # http://localhost:3000
```
Si la URL de Render es nueva, agrégala (junto a `http://localhost:3000`) a `WEB_ORIGIN` en Render, o el navegador bloqueará las llamadas por CORS. En el plan gratis, el servicio se duerme tras 15 minutos: la primera llamada tarda y la pantalla muestra su respaldo local hasta que responda.

**B. Backend local.** Necesita PostgreSQL instalado y una base `edunova`:
```bash
cd edunova/apps/api
cp .env.example .env              # revisa DATABASE_URL
npm install && npm run dev        # http://localhost:4000
```

Sin backend, todas las pantallas siguen funcionando con sus datos fijos.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `lib/api/client.ts` | Una función por endpoint. Nunca lanza errores: devuelve `{ ok, data }` o `{ ok: false, error }` |
| `lib/api/use-api.ts` | Hook `useApi` para cargar datos desde un componente de cliente |
| `lib/api/session.ts` | Guarda el token de demostración |
| `lib/api/helpers.ts` | Edad a modo Camaleón, etiquetas y texto por edad |
| `lib/api/edunova-contract.ts` | **Copia** de los tipos compartidos. No lo edites aquí: se copia del repo del backend (`packages/shared-types/`) |

## Cómo usarlo en una pantalla
Cada pantalla conserva su `data.ts` como respaldo. Si el backend no responde, se ve lo mismo que hoy y el demo no se cae.

```tsx
"use client";
import { getUnit } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { unidadActual } from "@/components/estudiante/data";

export default function Page() {
  const unit = useApi(() => getUnit("unit-solar-system"), []);
  const titulo = unit.status === "ok" ? unit.data.title : unidadActual.titulo;
  return <h1>{titulo}</h1>;
}
```

Para iniciar sesión hay una pantalla en `/login` (`lib/auth.ts`). Por código: `await demoLogin("u-student-1")`. Usuarios de prueba: `u-teacher-1`, `u-student-1` (Gloria), `u-student-2` (Mateo), `u-student-3` (Sofía), `u-family-1`. Los endpoints de perfil y de aula **piden sesión** y responden 401 o 403 si no corresponde. En un componente, `useSessionUser()` devuelve el usuario.

## Reglas de Next.js en este proyecto
`next.config.ts` tiene `cacheComponents: true`. Un `fetch` sin caché en un **componente de servidor** debe ir dentro de `<Suspense>`, o la ruta se bloquea. Por eso el cliente está pensado para **componentes de cliente** con `useApi`.

`NEXT_PUBLIC_API_URL` se fija al hacer `build`. Si la cambias, reinicia `npm run dev`.

## Qué endpoint corresponde a cada pantalla
| Pantalla | Hoy usa | Endpoint |
|---|---|---|
| `/estudiante` (inicio, insignias, puntos) | `estudiante`, `insignias` | `getStudentProfile` |
| `/estudiante/ruta` | `unidadActual`, `rutaPasos` | `getUnit` |
| `/estudiante/leccion` | `teoria` | **Conectada:** la frase de apertura de cada edad sale de `getUnit("unit-solar-system")` (`LeccionPorEdad.tsx`); el cuerpo sigue local en `ageContent.ts`. Si el servidor falla, se usa el respaldo local, que copia la semilla del backend |
| `/estudiante/practica` (tarjetas) | `preguntaPractica` | `getUnit` → `stages.practice.flashcards` |
| `/estudiante/explorar` (Sistema Solar) | **Conectada** | `getUnit` para las misiones y `completeMission` al completarlas (`useSolarMissions.ts`) |
| `/estudiante/cuerpo` (al completar misión) | — | `completeMission` |
| `/estudiante/evaluaciones/foto` | **Conectada** | `analyzeHandwrittenPhoto` y `syncProgress` para el bono. La imagen no se envía: el análisis simulado no la usa |
| `/estudiante/duelo` | — | `validateDuelQuestion`, `getGhostOpponent`, `reportDuelResult` |
| Ligas y tienda | — | `getLeaderboard` |
| `/docente` (totales del aula) | `classStats` | `getClassAnalytics("EDU-402")` → `studentCount`, `averageMasteryPercent` |
| `/docente/resultados`, `/docente/estudiante/[id]` | `estudiantes` | `getClassStudents("EDU-402")` |
| `/docente/competencias` | `competenciaMastery`, `estudiantes` | `getClassAnalytics` → `criteria` y `getClassStudents` |
| `/docente/reportes` (alertas) | `predictiveAlerts` | `getClassAnalytics` → `alerts` |
| Studio (subir PDF) | — | `ingestDocument` + `approveRubric` |
| `/familia` | **Conectada** | `getStudentProfile`, `getBenchmark`, `getFamilyExplanation`, `getPassport`. El pacto es de solo lectura, con una meta fija |

## Diferencias que hay que tener en cuenta
El backend sigue el **Plan Maestro**, no los datos fijos de `data.ts`:

1. **Dominio, no notas.** El backend devuelve **% de dominio por criterio de rúbrica**, no notas sobre 20. No existen notas, evolución semanal (`classroomWeekly`), bimestres, `topicComparison`, `strategyAnalysis` ni la ficha `rosaRecord`. Esas tarjetas deben mostrar el % de dominio o quedar con datos fijos. Además, los criterios del backend son de las unidades de prueba (por ejemplo "Qué es el Sistema Solar"), no "Cantidad" ni "Regularidad" de `competenciaMastery`.
2. **Solo alias.** Las vistas de estudiantes deben mostrar el nombre sin apellido (Safe-Play del plan). El backend ya devuelve solo el alias.
3. **La rúbrica no se muestra al estudiante.** Hoy `getUnit` la incluye en la respuesta; no la pintes en pantallas de estudiante.
4. **La IA es simulada.** Las respuestas de foto, ingesta y "explicar en casa" son fijas, con una espera de 1 s. La foto siempre analiza la hoja de "1/3 + 1/4".
5. **Ids.** Los ids del backend son `u-student-1` y `unit-solar-system`, no `"1"` ni `"sistema-solar"`.
