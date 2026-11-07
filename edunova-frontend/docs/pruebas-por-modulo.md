# Guía de pruebas por módulo

Esta guía sirve para revisar que cada módulo de EduNova funcione antes del demo. Son 2 personas, con el frontend en su PC y el backend en Render.

Marca cada prueba con `[x]` si pasa. Si falla, repórtala como dice [Cómo reportar un fallo](#cómo-reportar-un-fallo).

## Antes de empezar

1. Actualiza el código:

   ```bash
   cd front-edunova/edunova-frontend
   git pull
   npm install
   ```

2. Revisa que `.env.local` tenga esta línea:

   ```
   NEXT_PUBLIC_API_URL=https://edunova-api-njgx.onrender.com
   ```

3. Despierta el backend: abre <https://edunova-api-njgx.onrender.com/api/health> y espera a ver `{"ok":true,"service":"edunova-api"}`. Si lleva rato sin uso, tarda unos 20 segundos.
4. Arranca el frontend con `npm run dev` y abre <http://localhost:3000>.

Si cambias `.env.local`, reinicia `npm run dev`.

## Cómo repartirse

| Persona | Módulos |
|---|---|
| Persona A | Landing, estudiante, labs 3D, juegos, evaluación, ligas y tienda |
| Persona B | Login, docente, familia y modo offline |
| Las dos juntas | Tablero entre 2 aparatos y prueba de punta a punta |

### Usuarios de prueba

Entra en `/login`, pestaña **Acceso rápido**. El código de aula es `EDU-402`.

| Usuario | Rol | Debe abrir |
|---|---|---|
| Profe Ana | Docente | `/docente` |
| Gloria | Estudiante, 10 a 12 años | `/estudiante` |
| Mateo | Estudiante, 7 a 9 años | `/estudiante` |
| Sofía | Estudiante, 13 a 15 años | `/estudiante` |
| Mamá de Gloria | Tutor familiar | `/familia` |

**Las dos personas comparten la misma base de datos.** Si las dos usan a Gloria, se pisan los puntos y las compras. Persona A usa a Gloria, y Persona B usa a Mateo o Sofía cuando necesite un estudiante.

### Material de prueba

Descárgalo de [docs/demo en el repo del backend](https://github.com/nilton2005/edunova/tree/main/docs/demo).

| Archivo | Para qué |
|---|---|
| `sistema-solar.pdf` | Subir en Studio: propone el Lab 3D Sistema Solar |
| `mundo-de-las-fracciones.pdf` | Subir en Studio: crea la unidad de Fracciones |
| `hoja-cuaderno-1.jpg` a `-3.jpg` | Subir en el escáner de foto del cuaderno |

## Cómo reportar un fallo

Envía a Nilton estos datos por cada fallo:

| Dato | Ejemplo |
|---|---|
| Código de la prueba | `J-03` |
| Usuario y modo de edad | Gloria, Aventurero |
| Navegador y aparato | Chrome, laptop |
| Qué hiciste | Presioné "Analizar material" |
| Qué esperabas y qué pasó | Debía mostrar la rúbrica y se quedó cargando |
| Captura | Pantalla y, si puedes, la consola (F12) |

Antes de reportar, revisa [Lo que no es un fallo](#lo-que-no-es-un-fallo).

## Landing y login

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | L-01 | Abre `/` | Carga el hero con la isla, el logo y el botón "Iniciar sesión" |
| [ ] | L-02 | Usa los enlaces del menú | Cada uno baja a su sección |
| [ ] | L-03 | Usa los 5 botones de la brújula, abajo a la derecha | Cada uno baja a su sección y se marca activo |
| [ ] | L-04 | En "La IA propone", espera a que el botón "Aprobar y publicar" se active y presiónalo | La compuerta sube, la unidad avanza y aparecen tres tarjetas |
| [ ] | L-05 | Presiona "Ver otra vez" | La figura vuelve a empezar |
| [ ] | L-06 | Cambia de etapa en "Una experiencia para cada edad" | Cambian el texto y la imagen |
| [ ] | L-07 | En "Prueba un reto", responde mal | Dice "Casi." y marca la respuesta correcta |
| [ ] | L-08 | Responde bien y presiona "Otro reto" | Dice "¡Correcto!" y cambia de pregunta |
| [ ] | L-09 | Activa el sonido en la cabecera y responde bien | Suena un efecto |
| [ ] | L-10 | Abre la landing en un celular o a 390 px de ancho | Se lee bien y no hay desplazamiento horizontal |
| [ ] | A-01 | En `/login`, entra con cada usuario de Acceso rápido | Cada uno abre la pantalla de la tabla de usuarios |
| [ ] | A-02 | Pestaña Código de aula: alias `Gloria`, código `EDU-402` | Entra como Gloria |
| [ ] | A-03 | Pestaña Código de aula sin escribir alias | Pide ingresar el nombre o alias |
| [ ] | A-04 | Alias inventado, por ejemplo `Pepito` | Muestra un mensaje de error y no entra |

## Estudiante: inicio, edades y ruta

Entra como Gloria.

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | E-01 | Abre `/estudiante` | Saluda con "¡Hola, Gloria!" y muestra racha y puntos |
| [ ] | E-02 | Abre el engranaje de arriba a la derecha y cambia a Explorador, Aventurero y Creador | La interfaz cambia en cada modo |
| [ ] | E-03 | Recorre los 5 lugares del menú (Inicio, Aprender, Juegos, Aula, Perfil) y entra a cada mosaico | Todas las pantallas abren sin error |
| [ ] | E-04 | Abre `/estudiante/ruta` | Aparecen las cuatro áreas |
| [ ] | E-05 | Entra a cada área | Abre su mapa o laboratorio |
| [ ] | E-06 | Abre `/estudiante/leccion` y usa "Escuchar explicación" | La voz lee el texto |
| [ ] | E-07 | Completa `/estudiante/practica` con una respuesta | Indica si acertaste y muestra los puntos |
| [ ] | E-08 | Abre `/estudiante/misiones` y `/estudiante/desafio` | Cargan sin error |
| [ ] | E-09 | Repite E-01 y E-03 en un celular | Aparece la barra inferior y todo se lee bien |

## Labs 3D, mapas y aventuras

Los modelos 3D tardan unos segundos. Prueba con buena conexión.

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | D-01 | Abre `/estudiante/explorar`, arrastra y toca un planeta | La escena gira y muestra los datos del planeta |
| [ ] | D-02 | Completa una misión del Lab Sistema Solar | Muestra la recompensa |
| [ ] | D-03 | Abre `/estudiante/cuerpo` y elige varios órganos | Cada órgano carga y muestra su información |
| [ ] | D-04 | Responde el cuestionario de un órgano | Sube tu XP |
| [ ] | D-05 | Abre `/estudiante/matematica/mapa` y entra a una estación | Abre la lección y se puede girar el mapa |
| [ ] | D-06 | Abre `/estudiante/comunicacion/mapa` y usa la lectura con voz | Lee el texto y permite responder |
| [ ] | D-07 | Abre `/estudiante/sociales/mapa` y responde una estación | Avanza y suma XP |
| [ ] | D-08 | Abre `/estudiante/aventuras` y juega Piloto Espacial | El juego funciona hasta el final |
| [ ] | D-09 | Juega Ordena los Planetas | El juego funciona hasta el final |
| [ ] | D-10 | Juega Doctor Detective | El juego funciona hasta el final |

## Juegos

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | J-01 | Abre `/estudiante/juegos`, elige curso y personaje, y crea una sala | Muestra un código de sala |
| [ ] | J-02 | Agrega un compañero invitado y empieza | Inicia la partida en el mismo aparato |
| [ ] | J-03 | Lanza el dado y responde una pregunta | El jugador avanza y cambia el turno |
| [ ] | J-04 | Responde mal a propósito | Muestra una pista y descuenta una vida o usa el escudo |
| [ ] | J-05 | Juega hasta terminar | Muestra el resultado final sin trabarse |
| [ ] | J-06 | Prueba los botones de música y efectos | Se activan y se silencian |
| [ ] | J-07 | Abre `/estudiante/juegos/casillas` | Lista los tipos de casilla |
| [ ] | J-08 | Abre `/estudiante/duelo` y completa un duelo | Muestra el resultado y, al abrir Inicio, los puntos subieron |
| [ ] | J-09 | Crea una pregunta en el duelo | La valida y permite continuar |
| [ ] | J-10 | Abre `/estudiante/flashcards` y voltea varias tarjetas | Se voltean y avanzan |
| [ ] | J-11 | Con una unidad publicada en tu aula, juega el tablero | Las preguntas son las de esa unidad |

### Valle de los Saberes

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | VA-01 | Abre `/estudiante/jugar` y toca Valle | Carga el mundo 3D. En celular empieza en calidad Ligera |
| [ ] | VA-02 | Toca el suelo | Aparece un anillo y el explorador camina hasta ahí |
| [ ] | VA-03 | Desde el centro, toca el cartel de Tu casa | Cruza solo por el puente y llega a la puerta |
| [ ] | VA-04 | Acércate a cada lugar y toca Entrar | Abre su pantalla. Al volver, apareces junto a ese lugar |
| [ ] | VA-05 | Cambia entre día, atardecer y noche | La luz cambia suave y de noche se encienden ventanas y faroles |
| [ ] | VA-06 | Toca Mapa simple y prueba cada lugar | Muestra los 6 lugares y cada uno abre su pantalla |
| [ ] | VA-07 | Entra como estudiante y mira la Escuela | Muestra una baliza con el número de unidades, en 3D y en el Mapa simple |
| [ ] | VA-08 | Habla con Maestra Elena, falla y luego acierta | Marca el error, y Siguiente trae otra pregunta |
| [ ] | VA-09 | En el diálogo toca Ir a esta unidad | Abre esa unidad directamente |
| [ ] | VA-10 | Abre un diálogo y ciérralo con la X o con Escape | Se cierra y puedes seguir caminando |

### Tablero entre 2 aparatos

**Las salas se guardan en el frontend, no en Render.** Si cada persona usa su propio `localhost`, no se verán entre sí. Las dos deben entrar al frontend de una sola PC:

1. Las dos conectadas al **mismo wifi**.
2. Persona A, en su PC, corre `npm run build` y luego `npm start`. No uses `npm run dev` para esta prueba.
3. Persona A busca su IP con `ipconfig` (por ejemplo `192.168.0.187`).
4. Persona B abre `http://IP-DE-A:3000` en su aparato.

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | M-01 | Persona B abre la dirección y entra con Mateo | Carga y el login funciona |
| [ ] | M-02 | Persona A crea una sala y pasa el código | Persona B entra con el código |
| [ ] | M-03 | Las dos marcan listo y Persona A inicia | La partida empieza en los dos aparatos |
| [ ] | M-04 | Juega un turno cada una | El otro aparato lo ve en menos de 3 segundos |
| [ ] | M-05 | Terminen la partida | Las dos ven el mismo resultado |

## Evaluación, progreso, ligas y tienda

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | V-01 | Abre `/estudiante/evaluaciones` | Lista los tipos de evaluación |
| [ ] | V-02 | Abre Foto de ejercicio y sube `hoja-cuaderno-1.jpg` | Analiza paso a paso y marca el error de la línea 2: `1/3 + 1/4 = 2/7` |
| [ ] | V-03 | Prueba la foto con la cámara del celular | Permite tomar y subir la foto |
| [ ] | V-04 | Abre `/estudiante/progreso` y sus pestañas | Muestran datos sin error |
| [ ] | V-05 | Abre `/estudiante/habilidades` | Muestra tus 4 habilidades con su barra |
| [ ] | V-06 | Haz el test diario de habilidades | Se puede completar y da un resultado |
| [ ] | V-07 | Abre `/estudiante/logros` | Muestra las insignias obtenidas y las pendientes |
| [ ] | V-08 | Abre `/estudiante/ligas` y cambia entre Maestría y Superación | Cada botón muestra su liga |
| [ ] | V-09 | Abre `/estudiante/tienda` y compra un accesorio | Bajan las monedas y aparece el botón "Poner" |
| [ ] | V-10 | Recarga la tienda | La compra se mantiene |
| [ ] | V-11 | Intenta comprar algo que no alcanza | No deja comprarlo |
| [ ] | V-12 | Abre `/estudiante/aula` | Cargan sus accesos |

## Docente

Entra como Profe Ana.

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | T-01 | Abre `/docente` | Muestra el resumen y la lista "Requieren apoyo" |
| [ ] | T-02 | Pasa el cursor por la gráfica y abre "Ver datos" | Aparece el valor y la tabla de datos |
| [ ] | T-03 | En Crear unidad, sube `sistema-solar.pdf` y presiona "Analizar material" | Propone subtemas, rúbrica y el Lab 3D Sistema Solar |
| [ ] | T-04 | Edita un criterio de la rúbrica | El cambio se mantiene |
| [ ] | T-05 | Presiona "Aprobar y Publicar" | La unidad queda publicada |
| [ ] | T-06 | Repite con `mundo-de-las-fracciones.pdf` | Crea la unidad de Fracciones |
| [ ] | T-07 | Abre Aulas y entra a la ficha de un estudiante | Muestra sus datos y su evolución |
| [ ] | T-08 | Abre Evaluación y prueba cada instrumento | Se abre su formulario |
| [ ] | T-09 | Cambia la nota de una evaluación del aula | La nota editada se mantiene al recargar |
| [ ] | T-10 | Abre Seguimiento | Muestra el dominio por competencia |
| [ ] | T-11 | Abre Analítica educativa y sus pestañas | Todas cargan, y los valores de las gráficas se pueden leer |
| [ ] | T-12 | Busca un estudiante en la tabla de Analítica | Filtra la lista |
| [ ] | T-13 | Repite T-01 y T-11 en un celular | Se lee bien y funciona el menú |

## Familia

Entra como Mamá de Gloria.

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | F-01 | Abre `/familia` | Muestra el perfil de Gloria y el tema para reforzar |
| [ ] | F-02 | Presiona "Explicar en casa" | Muestra una explicación sencilla |
| [ ] | F-03 | Revisa la comparación y el pacto | Se ven los datos y el avance |
| [ ] | F-04 | Genera el Pasaporte QR | Aparece el código |
| [ ] | F-05 | Cierra sesión | Vuelve a la pantalla de ingreso |
| [ ] | F-06 | Abre `/familia` sin sesión o con Gloria | Pide iniciar sesión como tutor |

## Modo offline

Haz estas pruebas en Chrome con la app ya abierta una vez. Usa `npm run build` y `npm start`, porque el modo offline se prueba mejor en producción.

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | O-01 | Con internet, mira arriba a la derecha | No hay aviso de conexión |
| [ ] | O-02 | Desconecta el wifi | Aparece el aviso "Sin internet" |
| [ ] | O-03 | Sin internet, abre `/estudiante/leccion` y `/estudiante/flashcards` | Las dos funcionan |
| [ ] | O-04 | Vuelve a conectar | El aviso desaparece |

## Prueba de punta a punta

Es el recorrido del demo. Háganlo juntas al final.

| OK | Código | Pasos | Resultado esperado |
|---|---|---|---|
| [ ] | P-01 | Persona B publica una unidad como Profe Ana | Queda publicada |
| [ ] | P-02 | Persona A entra como Gloria y abre Aprender | La unidad está disponible |
| [ ] | P-03 | Persona A completa una misión 3D y sube la foto del cuaderno | Suman sus puntos |
| [ ] | P-04 | Persona A revisa `/estudiante/progreso` | Se refleja el avance |
| [ ] | P-05 | Persona B entra como Mamá de Gloria | Ve el avance actualizado |

## Lo que no es un fallo

- **La IA es simulada.** Responde después de 1 segundo aproximadamente, siempre con un resultado de ejemplo.
- **La foto del cuaderno siempre analiza el mismo ejercicio.** Con otra hoja, el comentario no va a coincidir.
- **Algunos datos docentes son fijos:** la evolución semanal, la comparación por tema y el análisis de estrategias.
- **Analítica educativa y Reportes** abren la misma página.
- **Datos de respaldo:** si Render está dormido, la pantalla puede mostrar datos de ejemplo. Abre la dirección de `/api/health`, espera y recarga antes de reportar.
- **Unidades de prueba:** lo que publiquen queda guardado en la base compartida.
- **Evidencia de juegos:** con Render en `main`, las respuestas de juegos y laboratorios no se guardan, porque `/api/events` solo existe en `feat/final-internacional`.
- **La voz** depende del navegador y puede sonar distinta en cada aparato.
- **El sonido** no se escucha hasta el primer clic en la página.

## Resultado final

| Módulo | Persona | Pasan | Fallan | Comentario |
|---|---|---|---|---|
| Landing y login | | | | |
| Estudiante | | | | |
| Labs 3D y aventuras | | | | |
| Juegos | | | | |
| Valle de los Saberes | | | | |
| Tablero entre 2 aparatos | | | | |
| Evaluación, ligas y tienda | | | | |
| Docente | | | | |
| Familia | | | | |
| Modo offline | | | | |
| Punta a punta | | | | |
