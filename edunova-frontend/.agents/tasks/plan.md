# Implementation Plan — EduNova Docente Panel (Seguimiento, Evaluación y Analítica)

Build order summary: **Shared foundation (data → charts → ui → DocenteLayout) → Resumen route → 5 remaining routes (resultados, estudiante/[id], competencias, evaluacion, reportes)**, verified at every step with `npx next build`.

This plan decomposes into two FEATs:
- **FEAT-001** = items 1–5 (foundation + `/docente` Resumen). Proves the build + the server/client pattern.
- **FEAT-002** = items 6–10 (the 5 remaining routes), reusing FEAT-001's foundation.

---

## Confirmed project context (verified by reading the repo)

- **Next.js 16.4.5** (Turbopack), React 19.3, App Router. `next.config.ts` sets `cacheComponents: true` + `partialPrefetching: true` + `experimental.agentFeedback: true`. Baseline `npx next build` passes cleanly (only `/` and `/_not-found` prerendered today).
- **Tailwind CSS v4** via `@import "tailwindcss"` in `app/globals.css`. There is **NO `tailwind.config.js`**. Custom colors are used **only** via `bg-[#hex]` / `text-[#hex]` / `border-[#hex]` utilities (the `@theme inline` block only maps `--color-background`/`--color-foreground`).
- `tsconfig.json` path alias `@/*` → `./*` (so import as `@/components/docente/...`). TypeScript strict. Next 16 provides typed helpers `PageProps<'/route'>` and `LayoutProps<'/route'>` (already used in `app/layout.tsx`); use them for page/param typing.
- **`components/` does not exist yet** — create it. Shared docente code lives in `components/docente/`.
- Mascot exists at `public/assets/mascotaedu nova.png` (filename has a literal space). Reference in code as `/assets/mascotaedu%20nova.png`. Use a plain `<img>` element (per spec); `next build` does not run ESLint, so the `no-img-element` rule is not a concern.
- **AGENTS.md** warns this Next.js has breaking changes. Two matter here:
  1. `params` is a **Promise** — `await` it in server pages, or `use(params)` in client pages.
  2. With `cacheComponents`, a Client hook (`usePathname`) used in a shared layout **suspends on any route with an unknown dynamic param** unless that route exports `generateStaticParams`. Therefore `/docente/estudiante/[id]` MUST export `generateStaticParams` (returning the student ids) so `usePathname` in `DocenteLayout` resolves at build time and the build does not fail.
- **Do NOT install any new dependencies** — none are needed. All charts are pure inline SVG. Icons are inline SVG or Unicode/emoji.

## Mandatory color palette (use exactly these via `bg-[#hex]`/`text-[#hex]`)

| Token | Hex | Use |
|---|---|---|
| Morado primario | `#5636D9` | primary actions, line chart, active sidebar |
| Azul oscuro | `#17164F` | sidebar bg, grouped-bar "aula" series |
| Fondo claro | `#F5F3FF` / `#EEF2FF` | page backgrounds |
| Morado claro (cards) | `#EDE9FE` | card backgrounds |
| Acento lavanda | `#7C3AED` | accents |
| Verde logrado | `#10B981` | "Logrado" dot/bar segment |
| Amarillo en proceso | `#F59E0B` | "En proceso" dot/bar segment, stars |
| Rojo en inicio | `#EF4444` | "En inicio" dot/bar segment |
| Texto principal | `#111827` | headings/body |
| Texto secundario | `#6B7280` | captions |
| Barra meta | `#A5B4FC` | grouped-bar "meta" series |

## Mock data (exact — define as TypeScript constants in `components/docente/data.ts`)

Class: **Matemática 1B — Sección B — 1.° de Secundaria**. Docente: **Prof. Ana Torres**.

Class stats: promedio del aula **15.8/20**; actividades completadas **82%**; estudiantes que requieren apoyo **4 (20%)**; mejora vs bimestre anterior **+2.4 puntos**; total estudiantes **20**.

20-student roster (id, nombre, nota/20, progreso %, estado) — designed so the notas average **exactly 15.8** and exactly **4** are "En inicio":
```
1  Gloria Hancco    19.2  90  Logrado
2  Luis Mamani      17.6  56  Logrado
3  Rosa Quispe      12.4  62  En proceso
4  Pedro Salas      10.8  54  En inicio
5  Ana Vargas       15.9  80  Logrado
6  Carlos Rojas      16.5  78  Logrado
7  Lucía Torres     17.0  85  Logrado
8  José Fernández   11.6  48  En inicio
9  Sofía García     16.8  82  Logrado
10 Diego Ramírez    11.2  45  En inicio
11 Andrés Medina    17.4  80  Logrado
12 Manuel Ríos      17.2  76  Logrado
13 Valeria Cruz     16.6  74  Logrado
14 Sebastián Vera   18.0  88  Logrado
15 Camila Núñez     11.0  42  En inicio
16 Gabriela Soto    18.2  86  Logrado
17 Eduardo Mendoza  16.4  72  Logrado
18 Daniela Paredes  17.6  81  Logrado
19 Tomás Herrera    17.8  84  Logrado
20 María López      16.8  79  Logrado
```
The first 5 are the spec's "sample" shown in Resultados; the table/reportes show all 20.

Rosa Quispe individual record (used in `EstudianteDetalle`): nota **12.4/20**; actividades **8/10 (80%)**; progreso **+3.6** vs bimestre anterior; habilidades transversales — Trabajo en equipo **3/3**, Comunicación **3/3**, Gestión del tiempo **2/3**; competencias — Cantidad **12.4**, Regularidad **11.8**, Forma y movimiento **13.2**, Gestión de datos **12.0**; evolución semanal individual (6 sem) — `10.8, 11.2, 11.6, 11.9, 12.1, 12.4`; observación docente ejemplo — *"Rosa muestra mejora sostenida en resolución de problemas. Reforzar fracciones y trabajo colaborativo."*

Classroom analytics:
- Evolución semanal del aula (6 sem): `13.8, 14.2, 14.9, 15.2, 15.6, 15.8`.
- Dominio por competencia (% Logrado / En proceso / En inicio): Cantidad **70/20/10**, Regularidad **65/20/15**, Forma y movimiento **65/25/10**, Gestión de datos **60/30/10**.
- Comparación por tema (aula / meta): Fracciones **15.8/16.0**, Decimales **16.2/16.5**, Proporciones **14.0/16.5**, Porcentajes **15.6/16.0**.
- Análisis de estrategias "Taller de resolución de problemas": Antes (Sem.1–3) **13.4 / 68%**; Después (Sem.4–6) **15.8 / 82%**; variación **+2.4 puntos (+17.9%)**. Disclaimer: *"La correlación no demuestra causalidad. Los resultados pueden deberse a múltiples factores."*
- Alertas predictivas (marcadas "Recomendación para revisión docente"): disclaimer *"No es una decisión automatizada ni una evaluación definitiva."*; lista — **Pedro Salas** (tendencia a la baja, requiere seguimiento), **Rosa Quispe** (mejora sostenida, monitorear progreso).

## Architecture decisions (with rationale)

1. **Shared foundation in `components/docente/`.** A single `DocenteLayout` plus small reusable `data.ts`, `charts.tsx`, `ui.tsx` keeps 20 students + Rosa's record + 4 chart types consistent across 6 routes instead of copy-pasting SVG and data inline. The spec says "hardcoded in JSX, no fetch/API" — static TypeScript constants satisfy that (no runtime fetching) while staying DRY.
2. **`"use client"` only where `useState` is used.** Client components: `DocenteLayout` (collapsible "Aulas" submenu = `useState`; active link = `usePathname`), `EstudianteDetalle` (tabs = `useState`), and the 4 pages with filters/tabs/selectors (`resultados`, `competencias`, `evaluacion`, `reportes`). Server components (no `"use client"`): `data.ts`, `charts.tsx`, `ui.tsx` (pure presentational — usable from both server and client), the `/docente` Resumen page (static), and the `/docente/estudiante/[id]` page (resolves params server-side).
3. **Server/client split for the `[id]` route.** `app/docente/estudiante/[id]/page.tsx` is a **server** component that exports `generateStaticParams` (returns the 20 student ids), `await params`, looks up the student in `data.ts`, and renders `<DocenteLayout><EstudianteDetalle student={student} /></DocenteLayout>`. The interactive tabs live in the `"use client"` `EstudianteDetalle` child (receives the student as serializable props — no `useParams` needed). This satisfies the spec's "use client only where useState is used", keeps `params` handling correct for Next 16, and — critically — `generateStaticParams` makes params known at build time so `usePathname` in `DocenteLayout` does **not** suspend (preventing a build failure under `cacheComponents`).
4. **`DocenteLayout` is `"use client"`** because it uses `useState` (collapsible Aulas) and `usePathname` (active link). The sidebar active style is `bg-white text-[#5636D9]` per spec. Safe across all docente routes because every route is static or covered by `generateStaticParams`.
5. **Accessible estado badges** (WCAG AA). Vivid colors fail as white-text backgrounds, so badges use a light-tint background + dark text + a colored dot: **Logrado** `bg-[#D1FAE5] text-[#065F46]` dot `#10B981`; **En proceso** `bg-[#FEF3C7] text-[#92400E]` dot `#F59E0B`; **En inicio** `bg-[#FEE2E2] text-[#991B1B]` dot `#EF4444`. These pairs pass AA contrast.
6. **Charts are pure inline SVG, parameterized.** `charts.tsx` exports `LineChart`, `BarChart` (single- or multi-series), `StackedBarChart` (tricolor), `DonutChart`. Each is a presentational component taking data via props so the same chart serves multiple pages. **Donut correction:** the spec's literal `strokeDasharray="282 345"` does not produce 82% for `r=45` (circumference ≈ 282.74); implement it correctly by computing `dash = pct * circ` (`circ = 2π·45`), so 82% → `strokeDasharray="231.85 282.74"` with `transform="rotate(-90 60 60)"` to start at the top.
7. **Tables = semantic `<table>`.** Use real `<table>`/`<thead>`/`<tbody>`/`<th scope>` (implicit `role="table"`, better than ARIA-role hacks) wrapped in `overflow-x-auto` for responsive scroll. Mobile uses card layouts instead of tables.

## Chart specs (pure inline SVG)

- **LineChart** (classroom & individual evolution): `viewBox="0 0 300 120"`, path `stroke="#5636D9"` `strokeWidth="2"` `fill="none"`, circles `r="4"` `fill="#5636D9"`. Auto-scale: `y = 15 + (1 - (v-min)/(max-min)) * 80`, `x = 20 + i*52` (i=0..5). Week labels below (y≈115), value labels above each point. Visual matches the spec's rising line (approx `(0,100)→(250,30)`).
- **BarChart** (grouped topic comparison; single-series weekly in Resumen): `viewBox="0 0 320 140"`. Multi-series: aula bars `#17164F`, meta bars `#A5B4FC`, legend + grouped bars + value labels. Single-series (Resumen weekly): 6 bars `#5636D9`. `max=20` scale.
- **StackedBarChart** (competency mastery): per competency an inline SVG bar (`viewBox="0 0 300 24"`, `preserveAspectRatio="none"`, full width) split into verde `#10B981` / amarillo `#F59E0B` / rojo `#EF4444` proportional rects; competency name + percentages as HTML around it; shared legend.
- **DonutChart** (reports mobile 82%): `viewBox="0 0 120 120"`, track `r=45` `#E5E7EB`, progress `r=45` `#5636D9` `strokeLinecap="round"`, `strokeDasharray` computed from percentage, rotated to start at top; center label "82% / Completadas".

## Accessibility checklist
- Inline SVG icons: `role="img"` + `<title>` or `aria-label`; decorative emojis: `aria-hidden="true"` with adjacent visible text.
- Tables: semantic `<table>` with `<th scope>`.
- Estado badges: AA-contrast tints (above). Link/nav text: white on `#17164F` sidebar (AAA) and white on `#5636D9` buttons (AAA).
- Star ratings: `aria-label="X de 3"`.
- `lang` stays `en` on `<html>` (existing layout) — content is Spanish; acceptable for this mock.

## Verification (every item runs this)
```powershell
cd d:\EduNOva\edunova-frontend ; npx next build
```
Must finish with **no TypeScript errors**. After the final item, confirm the route list includes `/docente`, `/docente/resultados`, `/docente/estudiante/[id]` (prerendered to e.g. `/docente/estudiante/1`), `/docente/competencias`, `/docente/evaluacion`, `/docente/reportes`.

---

## Build order

- [ ] 1. **[FEAT-001]** Create `components/docente/data.ts` — TypeScript constants for class info, class stats, the 20-student roster, Rosa's individual record, weekly evolution, competency mastery, topic comparison, strategy analysis, and predictive-alert items. No `"use client"` (plain module). Export typed objects/arrays.
      Files: `d:\EduNOva\edunova-frontend\components\docente\data.ts`
      Verify: `npx next build` — compiles with no TS errors.

- [ ] 2. **[FEAT-001]** Create `components/docente/charts.tsx` — pure inline SVG components `LineChart`, `BarChart` (accepts `categories` + `series: {label,values,color}[]` for single- or grouped-bars), `StackedBarChart` (tricolor rows), `DonutChart` (percentage → computed `strokeDasharray`). No `"use client"` (presentational, usable server- or client-side). Use exact viewBoxes/colors above.
      Files: `d:\EduNOva\edunova-frontend\components\docente\charts.tsx`
      Verify: `npx next build` — compiles with no TS errors.

- [ ] 3. **[FEAT-001]** Create `components/docente/ui.tsx` — `EstadoBadge` (Logrado/En proceso/En inicio with AA tints), `StatCard` (icon, label, value, sublabel), `Stars` (n/3, amber filled / gray empty, `aria-label`), `ProgressBar` (value %, `#5636D9` fill). No `"use client"`.
      Files: `d:\EduNOva\edunova-frontend\components\docente\ui.tsx`
      Verify: `npx next build` — compiles with no TS errors.

- [ ] 4. **[FEAT-001]** Create `components/docente/DocenteLayout.tsx` (`"use client"`) — desktop left sidebar (`bg-[#17164F]`, w-56, `hidden md:flex`) with mascot `<img src="/assets/mascotaedu%20nova.png" alt="Mascota EduNova" className="w-8 h-8 object-contain" />` + "EduNova" wordmark + nav: Inicio (`/docente`), Aulas (collapsible via `useState`: Evaluación `/docente/evaluacion`, Seguimiento `/docente/competencias`, Analítica `/docente/reportes` with "Nuevo" badge), Reportes (`/docente/resultados`), Recursos (`#`); avatar "Prof. Ana Torres" at bottom; active link `bg-white text-[#5636D9]` via `usePathname()`. Mobile bottom nav (`flex md:hidden`, fixed bottom): Inicio, Aulas, Evaluar, Reportes, Perfil — emoji/SVG icons with `aria-label`. Wrap children: `<div className="min-h-screen flex"><aside …/>…<main className="flex-1 md:ml-56 pb-16 md:pb-0">{children}{bottomNav}</main></div>` (sidebar fixed `md:fixed` so `main` has `md:ml-56`).
      Files: `d:\EduNOva\edunova-frontend\components\docente\DocenteLayout.tsx`
      Verify: `npx next build` — compiles with no TS errors.

- [ ] 5. **[FEAT-001]** Create `app/docente/page.tsx` (server, NO `"use client"`) — Resumen del aula. Import `DocenteLayout`, `data`, `charts`, `ui`. Mobile: card with curso/grado/sección + stacked stat chips. Desktop: 2×2 `StatCard` grid (20 estudiantes, 15.8/20, 82% actividades, 4 apoyo) + a single-series `BarChart` of the 6-week evolution (`#5636D9`). Render `<DocenteLayout>{…content…}</DocenteLayout>`. Content is static (no `useState`) so the page stays a server component.
      Files: `d:\EduNOva\edunova-frontend\app\docente\page.tsx`
      Verify: `npx next build` — passes; route `/docente` appears (prerendered).

- [ ] 6. **[FEAT-002]** Create `app/docente/resultados/page.tsx` (`"use client"`) — Resultados por curso. `useState` for Curso/Tema/Periodo filter dropdowns (static option lists; filtering is cosmetic). Mobile: filter chips + student list cards (name, nota, `ProgressBar`, `EstadoBadge`). Desktop: semantic `<table>` (overflow-x-auto) columns `#`, Estudiante, Promedio, Progreso (bar), Estado (badge), Acción ("Ver ficha" → `Link` to `/docente/estudiante/{id}`). Show all 20 students; mark "20 estudiantes en total". Wrap in `DocenteLayout`.
      Files: `d:\EduNOva\edunova-frontend\app\docente\resultados\page.tsx`
      Verify: `npx next build` — passes; `/docente/resultados` appears.

- [ ] 7. **[FEAT-002]** Create `components/docente/EstudianteDetalle.tsx` (`"use client"`) AND `app/docente/estudiante/[id]/page.tsx` (server). The page exports `generateStaticParams` returning `[{ id: "1" }, … { id: "20" }]`, `await params`, looks up the student in `data.ts` (fallback to the roster; use Rosa's full record as the canonical detailed content), and renders `<DocenteLayout><EstudianteDetalle student={student} /></DocenteLayout>`. `EstudianteDetalle` renders: header (avatar initials, name, nota, progreso, estado), tabs (`useState`: Resumen | Evolución | Competencias) — Resumen: big nota + actividades 8/10 + progreso +3.6; Evolución: `LineChart` of Rosa's weekly data; Competencias: 4 competency cards (Cantidad/Regularidad/Forma y movimiento/Gestión de datos) with nota + `EstadoBadge`; plus transversal skills `Stars` (Trabajo en equipo 3, Comunicación 3, Gestión del tiempo 2) and a teacher-observations `<textarea>` (defaultValue = example observation). Mobile uses tabs; desktop uses a side panel (avatar + stats) + main area.
      Files: `d:\EduNOva\edunova-frontend\components\docente\EstudianteDetalle.tsx`, `d:\EduNOva\edunova-frontend\app\docente\estudiante\[id]\page.tsx`
      Verify: `npx next build` — passes; `/docente/estudiante/[id]` prerendered (e.g. `/docente/estudiante/1`).

- [ ] 8. **[FEAT-002]** Create `app/docente/competencias/page.tsx` (`"use client"`) — Seguimiento por competencia. `useState` for aula/curso selector (cosmetic). Mobile: list of the 4 competencies, each a `StackedBarChart` tricolor row + percentages + legend. Desktop: grid of competency cards with stacked bars + a curricular-criteria `<table>` (rows = students, columns = competencies, cells = EstadoBadge). Wrap in `DocenteLayout`.
      Files: `d:\EduNOva\edunova-frontend\app\docente\competencias\page.tsx`
      Verify: `npx next build` — passes; `/docente/competencias` appears.

- [ ] 9. **[FEAT-002]** Create `app/docente/evaluacion/page.tsx` (`"use client"`) — Registro de evaluación. `useState` for selected evaluation type. Mobile: selectable cards — Cuestionario, Rúbrica, Lista de cotejo, Actividad práctica, Autoevaluación (caritas 😀/😐/😢). Desktop: left list of types + right creation panel (static form fields per type, e.g. Rúbrica: criterios + niveles table; Autoevaluación: 3 caritas options) + preview of the evaluation. Forms are static UI only (no backend, no submit). Wrap in `DocenteLayout`.
      Files: `d:\EduNOva\edunova-frontend\app\docente\evaluacion\page.tsx`
      Verify: `npx next build` — passes; `/docente/evaluacion` appears.

- [ ] 10. **[FEAT-002]** Create `app/docente/reportes/page.tsx` (`"use client"`) — Reportes y analítica. `useState` for tabs (mobile: "Aula | Estudiante"; desktop: "Dashboard | Resultados por curso | Seguimiento por competencia | Análisis de estrategias | Alertas predictivas | Revisión docente") + period selector (cosmetic). Mobile: `DonutChart` 82% completadas, promedio por competencia bars, student list for individual ficha. Desktop: header breadcrumb "Analítica educativa > Matemática – 1B" + period selector + "Exportar reporte" button; 3-column grid — Col1: 4 stat cards + "Comparación por tema/actividad/instrumento" mini-tabs + grouped `BarChart` (aula vs meta); Col2: `LineChart` aula evolution (6 weeks) + "Estudiantes del aula (20)" table (search + filters, visual signals for who needs support); Col3: `StackedBarChart` dominio por competencia + Ficha de Rosa (stats + tabs, reuse `EstudianteDetalle` or a compact version); bottom row: "Análisis de estrategias" antes/después (Antes box neutral, Después box green `#D1FAE5`, arrow, variación +2.4 + causalidad disclaimer) + "Alertas predictivas" ("Recomendación para revisión docente" + disclaimer "No es una decisión automatizada ni una evaluación definitiva" + Pedro Salas & Rosa Quispe with trends). Wrap in `DocenteLayout`.
      Files: `d:\EduNOva\edunova-frontend\app\docente\reportes\page.tsx`
      Verify: `cd d:\EduNOva\edunova-frontend ; npx next build` — passes with no TS errors; route list contains all six routes (`/docente`, `/docente/resultados`, `/docente/estudiante/[id]` prerendered to `/docente/estudiante/1`, `/docente/competencias`, `/docente/evaluacion`, `/docente/reportes`).

---

## FEAT artifacts (for the restructured workflow)
- `task-edunova-docente-panel/task.json`, `context.json`
- `task-edunova-docente-panel/features/FEAT-001.json` (items 1–5), `FEAT-002.json` (items 6–10)
