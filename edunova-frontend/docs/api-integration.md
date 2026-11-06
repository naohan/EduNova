# Conectar el frontend con el backend

El backend está en https://github.com/nilton2005/edunova (`apps/api`). Esta carpeta, `lib/api/`, es el cliente que lo llama.

## Arrancar
El backend usa **PostgreSQL**. Hay dos formas de tenerlo:

**A. Usar el backend desplegado (recomendado, no instala nada).** Pide la URL de Render y ponla en `.env.local`:
```bash
cp .env.example .env.local        # y cambia NEXT_PUBLIC_API_URL por la URL de Render
npm run dev                       # http://localhost:3000
```
El navegador no llama a Render directamente: llama a `/backend` y Next reenvía la petición (`rewrites` en `next.config.ts`). Por eso la app funciona desde cualquier dirección (otro celular en el mismo wifi, por ejemplo) sin tocar `WEB_ORIGIN` en Render. En el plan gratis, el servicio se duerme tras 15 minutos: la primera llamada tarda y la pantalla muestra su respaldo local hasta que responda.

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
| `/estudiante` (racha y puntos) | **Conectada** | `getStudentProfile` (`ResumenPuntos.tsx`). Las insignias siguen fijas |
| `/estudiante/progreso` | **Conectada** (porcentaje general) | `getStudentProfile` |
| `/estudiante/ruta` | **Conectada** | `listUnits`: lo que el docente publica en Studio aparece en "De tu docente" |
| `/estudiante/leccion` | `teoria` | **Conectada:** la frase de apertura de cada edad sale de `getUnit("unit-solar-system")` (`LeccionPorEdad.tsx`); el cuerpo sigue local en `ageContent.ts`. Si el servidor falla, se usa el respaldo local, que copia la semilla del backend |
| `/estudiante/aventuras` (Piloto, Ordena, Doctor) | **Conectada** | `completeMission` al terminar, con `guardarMision` para funcionar sin red |
| `/estudiante/flashcards` | **Conectada** | `getUnit` → `stages.practice.flashcards`, unidas a un mazo local |
| `/estudiante/explorar` (Sistema Solar) | **Conectada** | `getUnit` para las misiones y `completeMission` al completarlas (`useSolarMissions.ts`) |
| `/estudiante/cuerpo` | **Conectada** | `completeMission` al aprobar un quiz o completar una misión |
| `/estudiante/evaluaciones/foto` | **Conectada** | `analyzeHandwrittenPhoto` y `submitReasoning`, que guarda la nota para el docente y suma el bono. La imagen no se envía: el análisis simulado no la usa |
| `/estudiante/duelo` | — | `validateDuelQuestion`, `getGhostOpponent`, `reportDuelResult` |
| `/estudiante/ligas` | **Conectada** | `getLeaderboard` y `getStudentProfile` |
| `/estudiante/tienda` | **Conectada** | `getShopItems`, `buyItem`, `toggleItem` (piden sesión de estudiante) |
| `/docente`, `/docente/resultados`, `/docente/competencias`, `/docente/reportes`, `/docente/estudiante/[id]` | **Conectadas** | `useAula.ts`: `getClassAnalytics` y `getClassStudents`, con sesión de docente. Sin sesión muestran los datos fijos |
| `/docente/evaluacion` | **Conectada** | `getClassAssessments` y `overrideAssessment` (`RevisionNotasIA.tsx`) |
| Studio (subir PDF) | **Conectada** | Pide sesión de docente. `ingestDocument` manda el archivo real a Gemini y `approveRubric` publica |
| `/estudiante/unidades` | **Conectada** | `listUnits`: historia por edad y quiz de cada unidad publicada. Cada respuesta va a `sendEvents` |
| `/familia` | **Conectada** | `getStudentProfile`, `getBenchmark`, `getFamilyExplanation`, `getPassport`. El pacto es de solo lectura, con una meta fija |

## Modo sin internet
`public/sw.js` guarda inicio, lección, flashcards y práctica (347 KB comprimidos, el plan pide menos de 500 KB). `lib/api/offline-queue.ts` guarda lo ganado sin red y lo envía al volver internet; usa `guardarMision` y `guardarProgreso` en vez de llamar directo a `completeMission` o `syncProgress`.

El service worker **solo se registra en producción**, para probarlo: `npm run build && npm start`. Con `npm run dev` funciona el indicador de conexión, pero no la caché. Si cambias `sw.js`, sube `VERSION`.

## Diferencias que hay que tener en cuenta
El backend sigue el **Plan Maestro**, no los datos fijos de `data.ts`:

1. **Dominio, no notas.** El backend devuelve **% de dominio por criterio de rúbrica**, no notas sobre 20. No existen notas, evolución semanal (`classroomWeekly`), bimestres, `topicComparison`, `strategyAnalysis` ni la ficha `rosaRecord`. Esas tarjetas deben mostrar el % de dominio o quedar con datos fijos. Además, los criterios del backend son de las unidades de prueba (por ejemplo "Qué es el Sistema Solar"), no "Cantidad" ni "Regularidad" de `competenciaMastery`.
2. **Solo alias.** Las vistas de estudiantes deben mostrar el nombre sin apellido (Safe-Play del plan). El backend ya devuelve solo el alias.
3. **La rúbrica no se muestra al estudiante.** El backend se la quita a `listUnits` y `getUnit` cuando quien pide es un estudiante.
4. **Dónde hay IA real.** La ingesta y "explicar en casa" llaman a Gemini desde el backend; si falla, responden con respaldo y `usedFallback: true`. El duelo usa `/api/gemini-duel` de este frontend, que necesita su propia `GEMINI_API_KEY`. La foto sigue simulada y siempre analiza la hoja de "1/3 + 1/4".
5. **Ids.** Los ids del backend son `u-student-1` y `unit-solar-system`, no `"1"` ni `"sistema-solar"`.
