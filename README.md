# EduNova

Plataforma educativa gamificada para estudiantes y docentes: mapas de aprendizaje 3D, laboratorio del cuerpo humano, juego de mesa colaborativo «Exploradores del conocimiento», misiones, duelos y panel docente.

**Hack4Edu Arequipa 2026** · 3 al 5 de noviembre de 2026  
Repositorio: [github.com/naohan/EduNova](https://github.com/naohan/EduNova)

---

## Declaración de autoría y originalidad

El proyecto fue desarrollado por los integrantes del equipo durante el Hack4Edu. Cualquier código, recurso o librería de terceros está citado en el repositorio, y el uso de IA se declara según la guía.

- El equipo entiende, revisa y responde por lo entregado.
- No se pegaron datos personales reales (nombres, DNI, fotos, notas de menores) en herramientas de IA.
- No se compartieron contraseñas ni claves de acceso.
- No se copió material con derechos de autor; los assets usados son propios del equipo o de uso permitido en el proyecto.
- Las cifras, textos y referencias generadas con IA fueron verificadas por el equipo.
- El trabajo presentado se desarrolló / adaptó en el marco del evento; lo previo, si aplica, se indica abajo.

### Modalidad

| Aspecto | Detalle |
|--------|---------|
| Evento | Hack4Edu Arequipa 2026 |
| Fechas de desarrollo principal | 3–5 de noviembre de 2026 |
| Evidencia | Historial de commits en GitHub (`main`) y avances en el repositorio |
| Trabajo previo (si aplica) | Base técnica Next.js / estructura inicial del monorepo; **funcionalidades del hackathon** (mapas 3D, laboratorio cuerpo, Exploradores del conocimiento, quiz/progreso, UI gamificada) se construyeron y documentaron durante el evento |

---

## Uso de IA (Hack4Edu — Guía 02/11/2026)

La IA se usó como **herramienta del equipo** (como un buscador o un editor), no como autora del producto. Todo lo generado se probó, se leyó en equipo y se integró con criterio pedagógico y técnico.

### Tabla de declaración (≈ 30 segundos en presentación)

| Herramienta | Para qué la usamos | En qué parte del proyecto | Cómo lo revisamos |
|-------------|--------------------|---------------------------|-------------------|
| Cursor (asistente de código / Grok) | Generar, depurar y refactorizar componentes React/TypeScript; proponer arquitectura de mapas 3D, quiz y salas multijugador | Frontend `edunova-frontend`: mapas Matemática/Comunicación/Sociales, laboratorio cuerpo, juego Exploradores, APIs de salas | Lectura en equipo, `npm run build`, pruebas manuales en navegador (escritorio y móvil), corrección de errores TypeScript |
| Cursor (asistente de código) | Ideas de UI/UX alineadas a mockups EduNova (tablero, laboratorio, fichas) | Estilos Tailwind, composición del tablero, paneles de progreso | Contraste con mockups del equipo; revisión visual y de accesibilidad táctil |
| Cursor (asistente de código) | Redacción de textos educativos de ejemplo (preguntas, explicaciones, misiones) | Bancos de preguntas por curso/órgano/casilla | Revisión pedagógica del equipo: edad 7–15, claridad, sin datos reales de estudiantes |
| — | Explicaciones de conceptos (R3F, progreso localStorage, turnos) | Aprendizaje interno del equipo | El equipo puede explicar cada módulo entregado |

### Cuidados éticos (Premio Retos ProFuturo / uso responsable de IA)

| Cuidado | Qué hicimos |
|--------|-------------|
| Privacidad | Solo datos de ejemplo / inventados en demos y prompts. Sin menores reales, sin notas escolares reales. |
| Sesgos | Preguntas y avatares revisados para ser inclusivos y no estereotipar. |
| Errores de la IA | No se confió a ciegas: build, pruebas de flujo (lanzar dado, desbloqueo, XP) y lectura de código. |
| Acceso con pocos recursos | Interfaz web responsive; modo offline / datos locales donde aplica; sin dependencia de hardware caro para la demo principal. |
| Transparencia | Esta sección en el README y mención en la presentación. |

### Qué evitamos (según la guía)

- Entregar código que nadie del equipo pueda explicar.
- Pegar datos personales reales en la IA.
- Compartir secretos o cuentas.
- Copiar material protegido aunque la IA lo sugiera.
- Presentar como hecho en el evento un producto ajeno sin declarar origen.

---

## Licencia

Código liberado bajo **MIT License** (licencia libre, conforme a las bases del hackathon).

Ver archivo [`LICENSE`](./LICENSE).

---

## Stack y recursos de terceros

| Recurso | Uso | Notas |
|---------|-----|--------|
| [Next.js](https://nextjs.org/) | App web | Framework principal |
| [React](https://react.dev/) / TypeScript | UI | — |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos | — |
| [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei) | Mapas / modelos 3D | Órganos GLB, islas, sistema solar |
| Assets propios | `/public/assets` | Ilustraciones, avatares, juego lúdico, miniaturas |

Cualquier otro recurso externo debe permanecer citado en el código o en este README.

---

## Cómo ejecutar

```bash
cd edunova-frontend
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Build de producción:

```bash
npm run build
npm start
```

---

## Módulos principales (hackathon)

- **Aprender / mapas 3D**: Matemática, Comunicación, Ciencias Sociales (progreso y quiz).
- **Ciencia**: Laboratorio del cuerpo humano (GLB + misiones XP).
- **Juegos**: Exploradores del conocimiento (salas, tablero, turnos, territorios).
- **Docente / familia / misiones**: paneles y flujos del producto EduNova.

---

## Contacto del equipo

Actualizar con nombres y roles del equipo antes de la entrega final.

|
Gloria Noemí Hancco Sivincha
Desarrollo Frontend

Lizenia Yadelin Cahuana Saya
Psicología · Investigación de usuarios · Diseño de experiencias centradas en las personas

Bryan Fernando Larico Rodríguez
Desarrollo Full Stack 

Nilton Huayroccacya Taco
Desarrollo Full  Stack

Anthony Jeffry Caracela Challco
Bases de Datos · Servicios REST

---

*Hack4Edu Arequipa 2026 · Comité de Tecnología · Pautas de IA versión 02/11/2026*
