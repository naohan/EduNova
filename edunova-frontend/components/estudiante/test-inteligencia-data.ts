export interface PreguntaInteligencia {
  id: string;
  categoria: 'razonamiento' | 'espacial' | 'verbal' | 'matematica';
  nombreCategoria: string;
  emoji: string;
  tipo: string;
  nivel: number;
  imagen: string | null;
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: string;
  respuestaTexto: string;
}

export const BANCO_PREGUNTAS_INTELIGENCIA: PreguntaInteligencia[] = [
  {
    "id": "E1",
    "categoria": "espacial",
    "nombreCategoria": "Espacial",
    "emoji": "🧊",
    "tipo": "Diferencias gráficas (rotación)",
    "nivel": 1,
    "imagen": "/test-inteligencia/Espacial1.png",
    "enunciado": "Observa las 5 figuras con mucha atención. Todas son exactamente iguales aunque estén giradas, excepto una. ¿Cuál de las figuras (A, B, C, D o E) es diferente a las demás?",
    "opciones": [
      "A",
      "B",
      "C",
      "D",
      "E"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "B"
  },
  {
    "id": "E2",
    "categoria": "espacial",
    "nombreCategoria": "Espacial",
    "emoji": "🧊",
    "tipo": "Vista 3D a 2D",
    "nivel": 2,
    "imagen": "/test-inteligencia/Espacial2.png",
    "enunciado": "Observa la construcción en 3D de la izquierda. Si la miras **de frente** (vista frontal), verías una torre de 2 cubos a la izquierda y una base de 3 cubos a lo ancho. ¿Cuál de las 4 opciones (a, b, c o d) representa correctamente esa vista?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "b",
    "respuestaTexto": "b"
  },
  {
    "id": "E3",
    "categoria": "espacial",
    "nombreCategoria": "Espacial",
    "emoji": "🧊",
    "tipo": "Vista 3D a 2D",
    "nivel": 3,
    "imagen": "/test-inteligencia/Espacial3.png",
    "enunciado": "Observa la estructura de cubos en 3D de la izquierda. Si la miras **desde arriba** (vista superior o planta), ¿cuál de las 4 opciones (a, b, c o d) muestra exactamente cómo se ve?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "d",
    "respuestaTexto": "d"
  },
  {
    "id": "E4",
    "categoria": "espacial",
    "nombreCategoria": "Espacial",
    "emoji": "🧊",
    "tipo": "Vista 3D a 2D",
    "nivel": 4,
    "imagen": "/test-inteligencia/Espacial4.png",
    "enunciado": "Observa la estructura en forma de sillón en 3D. Si la miras **de perfil desde el lado izquierdo** (vista lateral), ¿cuál de las 4 figuras (a, b, c o d) representa lo que verías?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "b",
    "respuestaTexto": "b"
  },
  {
    "id": "E5",
    "categoria": "espacial",
    "nombreCategoria": "Espacial",
    "emoji": "🧊",
    "tipo": "Vista 3D a 2D",
    "nivel": 5,
    "imagen": "/test-inteligencia/Espacial5.png",
    "enunciado": "Observa la construcción de bloques en 3D. ¿Cómo se vería esta estructura si la miras **completamente de frente** (vista frontal)? Elige entre las 4 opciones (a, b, c o d):",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "d",
    "respuestaTexto": "d"
  },
  {
    "id": "E6",
    "categoria": "espacial",
    "nombreCategoria": "Espacial",
    "emoji": "🧊",
    "tipo": "Vista 3D a 2D",
    "nivel": 6,
    "imagen": "/test-inteligencia/Espacial6.png",
    "enunciado": "Observa la figura en 3D de la izquierda. Si la miras **desde arriba** (vista superior o planta), ¿cuál de las 4 opciones (a, b, c o d) representa su forma plana?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "a",
    "respuestaTexto": "a"
  },
  {
    "id": "E7",
    "categoria": "espacial",
    "nombreCategoria": "Espacial",
    "emoji": "🧊",
    "tipo": "Vista 3D a 2D",
    "nivel": 7,
    "imagen": "/test-inteligencia/Espacial7.png",
    "enunciado": "Observa la figura en 3D de la izquierda. Si la miras **de frente** (vista frontal), ¿cuál de las 4 opciones (a, b, c o d) representa la escalera de bloques?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R1",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 1,
    "imagen": "/test-inteligencia/Razonamiento1.png",
    "enunciado": "Observa la secuencia de rectángulos rojos de arriba. En cada paso se añade una línea diagonal y luego se rellenan los triángulos interiores. ¿Cuál de las 4 opciones de abajo (a, b, c o d) debe ir en el segundo casillero vacío?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R2",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 2,
    "imagen": "/test-inteligencia/Razonamiento2.png",
    "enunciado": "Descubre el patrón en los cuadrados de arriba. El cuadrado pequeño de la esquina se mueve en sentido antihorario. ¿Qué figura (a, b, c o d) debe ir en el lugar del signo de interrogación?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R3",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 3,
    "imagen": "/test-inteligencia/Razonamiento3.png",
    "enunciado": "Observa cómo gira el triángulo rojo alrededor del centro paso a paso. ¿Cuál de las opciones de abajo (a, b, c o d) continúa la serie en el signo de interrogación?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R4",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 4,
    "imagen": "/test-inteligencia/Razonamiento4.png",
    "enunciado": "Cuenta los círculos rojos y blancos en cada figura de arriba: triángulo (3 círculos), cuadrado (4 círculos), pentágono (5 círculos). ¿Qué figura (a, b, c o d) debe ir en el signo de interrogación?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "d",
    "respuestaTexto": "d"
  },
  {
    "id": "R5",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 5,
    "imagen": "/test-inteligencia/Razonamiento5.png",
    "enunciado": "Observa cómo aumentan los lados de las figuras de arriba: triángulo (3 lados), rombo (4 lados), pentágono (5 lados). ¿Cuál de las 4 opciones (a, b, c o d) continúa la secuencia?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R6",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 6,
    "imagen": "/test-inteligencia/Razonamiento6.png",
    "enunciado": "Observa el rectángulo dividido en dos: en el lado izquierdo la línea que sostiene al punto rojo gira 90 grados, y en el lado derecho el patrón de líneas cambia. ¿Cuál de las opciones (a, b, c o d) completa la serie?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R7",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 7,
    "imagen": "/test-inteligencia/Razonamiento7.png",
    "enunciado": "Observa cómo se van completando las líneas verticales con círculos en los extremos. ¿Cuál de las 4 opciones (a, b, c o d) va en el signo de interrogación?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R8",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 8,
    "imagen": "/test-inteligencia/Razonamiento8.png",
    "enunciado": "Sigue el movimiento del cuadrado pequeño de la esquina y del punto rojo. ¿Qué alternativa (a, b, c o d) va en el signo de interrogación?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "a",
    "respuestaTexto": "a"
  },
  {
    "id": "R9",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 9,
    "imagen": "/test-inteligencia/Razonamiento9.png",
    "enunciado": "Observa los cuadrados en las esquinas que alternan entre blanco y rojo. ¿Cuál de las 4 opciones (a, b, c o d) continúa la serie?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "b",
    "respuestaTexto": "b"
  },
  {
    "id": "R10",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Sucesión de figuras",
    "nivel": 10,
    "imagen": "/test-inteligencia/Razonamiento10.png",
    "enunciado": "Cuenta los lados de las figuras exterior e interior: triángulo y cuadrado (3 y 4 lados), cuadrado y pentágono (4 y 5 lados), pentágono y hexágono (5 y 6 lados). ¿Qué figura (a, b, c o d) sigue?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R11",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Serie de dominó",
    "nivel": 11,
    "imagen": "/test-inteligencia/Razonamiento11.png",
    "enunciado": "Observa los puntos en las fichas de dominó de arriba. ¿Cuál de las fichas de abajo (A, B, C o D) debe ir en la ficha con los signos de interrogación?",
    "opciones": [
      "A",
      "B",
      "C",
      "D"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "C"
  },
  {
    "id": "R12",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Matriz de dominó",
    "nivel": 12,
    "imagen": "/test-inteligencia/Razonamiento12.png",
    "enunciado": "Observa cómo se relacionan las fichas de dominó en la cuadrícula. ¿Cuál de las 4 opciones (a, b, c o d) completa la ficha vacía con signos de interrogación?",
    "opciones": [
      "a",
      "b",
      "c",
      "d"
    ],
    "respuestaCorrecta": "c",
    "respuestaTexto": "c"
  },
  {
    "id": "R13",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Analogía con figuras",
    "nivel": 13,
    "imagen": "/test-inteligencia/Razonamiento13.png",
    "enunciado": "La primera figura (cuadrado negro con círculo blanco) se transforma en la segunda (círculo blanco con cuadrado negro). Si aplicamos la misma regla al triángulo negro con círculo blanco, ¿cuál de las 5 opciones (A, B, C, D o E) obtenemos?",
    "opciones": [
      "A",
      "B",
      "C",
      "D",
      "E"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "C"
  },
  {
    "id": "R14",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Serie de flechas/figuras",
    "nivel": 14,
    "imagen": "/test-inteligencia/Razonamiento14.png",
    "enunciado": "Observa las figuras de la izquierda: todas están compuestas exactamente por 3 puntas de flecha. ¿Cuál de las 5 opciones de la derecha (A, B, C, D o E) pertenece al mismo grupo?",
    "opciones": [
      "A",
      "B",
      "C",
      "D",
      "E"
    ],
    "respuestaCorrecta": "D",
    "respuestaTexto": "D"
  },
  {
    "id": "R15",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Analogía con figuras",
    "nivel": 15,
    "imagen": "/test-inteligencia/Razonamiento15.png",
    "enunciado": "El triángulo se invierte verticalmente (de cabeza) manteniendo la zona negra en su base más ancha. Si invertimos verticalmente la tercera figura (línea con semicírculos), ¿cuál de las 5 alternativas (A, B, C, D o E) resulta?",
    "opciones": [
      "A",
      "B",
      "C",
      "D",
      "E"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "B"
  },
  {
    "id": "R16",
    "categoria": "razonamiento",
    "nombreCategoria": "Razonamiento",
    "emoji": "🧠",
    "tipo": "Matriz 3x3 de figuras",
    "nivel": 16,
    "imagen": "/test-inteligencia/Razonamiento16.png",
    "enunciado": "Observa el cuadro grande de 3x3 con símbolos de baraja (tréboles, picas, diamantes y corazones) al que le falta la última pieza del círculo. ¿Cuál de las 8 piezas de la derecha (A, B, C, D, E, F, G u H) encaja perfectamente para completar el patrón?",
    "opciones": [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H"
    ],
    "respuestaCorrecta": "H",
    "respuestaTexto": "H"
  },
  {
    "id": "V1",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Analogía verbal",
    "nivel": 1,
    "imagen": null,
    "enunciado": "Completa la frase: \"El pájaro es a volar como el pez es a...\"",
    "opciones": [
      "Caminar",
      "Nadar",
      "Saltar",
      "Correr"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "Nadar"
  },
  {
    "id": "V2",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Antónimos",
    "nivel": 2,
    "imagen": null,
    "enunciado": "¿Cuál de las siguientes palabras significa lo contrario (antónimo) de RÁPIDO?",
    "opciones": [
      "Veloz",
      "Fuerte",
      "Lento",
      "Pequeño"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "Lento"
  },
  {
    "id": "V3",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Sinónimos",
    "nivel": 3,
    "imagen": null,
    "enunciado": "Si decimos que \"el perro está muy CONTENTO\", ¿por cuál palabra podemos cambiar \"contento\" sin que cambie el significado de la oración?",
    "opciones": [
      "Enojado",
      "Cansado",
      "Alegre",
      "Asustado"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "Alegre"
  },
  {
    "id": "V4",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Analogía verbal",
    "nivel": 4,
    "imagen": null,
    "enunciado": "Completa la frase: \"El guante es a la mano como el zapato es a...\"",
    "opciones": [
      "La cabeza",
      "El brazo",
      "La pierna",
      "El pie"
    ],
    "respuestaCorrecta": "D",
    "respuestaTexto": "El pie"
  },
  {
    "id": "V5",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Comprensión y deducción",
    "nivel": 5,
    "imagen": null,
    "enunciado": "Lee con atención: \"Sofía abrió la puerta de su casa, miró hacia el cielo gris, regresó a su cuarto a buscar su paraguas y se puso sus botas de goma\". ¿Qué está pasando afuera?",
    "opciones": [
      "Hace mucho calor y sol",
      "Está lloviendo o está por llover",
      "Es de noche y va a dormir",
      "Va a jugar fútbol en el parque"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "Está lloviendo o está por llover"
  },
  {
    "id": "V6",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Analogía verbal",
    "nivel": 6,
    "imagen": null,
    "enunciado": "Completa la frase: \"Hielo es a frío como fuego es a...\"",
    "opciones": [
      "Humo",
      "Agua",
      "Calor",
      "Madera"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "Calor"
  },
  {
    "id": "V7",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Sinónimos",
    "nivel": 7,
    "imagen": null,
    "enunciado": "Elige la palabra que significa lo mismo (sinónimo) que CONSTRUIR:",
    "opciones": [
      "Destruir",
      "Edificar",
      "Pintar",
      "Limpiar"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "Edificar"
  },
  {
    "id": "V8",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Comprensión y deducción",
    "nivel": 8,
    "imagen": null,
    "enunciado": "Lee con atención: \"A Mateo le rugía el estómago. Miró el reloj y vio que ya era la 1:30 de la tarde. Dejó sus cuadernos en la mochila y fue corriendo hacia la cocina\". ¿Qué podemos deducir de esta situación?",
    "opciones": [
      "Mateo llega tarde a la escuela",
      "Mateo tiene mucha hambre y es hora de almorzar",
      "A Mateo le gusta mucho cocinar postres",
      "El reloj de Mateo está malogrado"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "Mateo tiene mucha hambre y es hora de almorzar"
  },
  {
    "id": "V9",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Antónimos",
    "nivel": 9,
    "imagen": null,
    "enunciado": "¿Cuál es el antónimo (significado opuesto) de la palabra VALIENTE?",
    "opciones": [
      "Heroico",
      "Audaz",
      "Cobarde",
      "Distraído"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "Cobarde"
  },
  {
    "id": "V10",
    "categoria": "verbal",
    "nombreCategoria": "Verbal",
    "emoji": "💬",
    "tipo": "Comprensión y deducción",
    "nivel": 10,
    "imagen": null,
    "enunciado": "Lee con atención: \"Tres amigos compitieron en una carrera. Lucas llegó después de Martín, pero antes que Valeria\". ¿Quién llegó en el último lugar?",
    "opciones": [
      "Martín",
      "Lucas",
      "Valeria",
      "Llegaron empatados"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "Valeria"
  },
  {
    "id": "M1",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 1,
    "imagen": null,
    "enunciado": "¿Qué número continúa en la siguiente serie? 2, 4, 6, 8, ___",
    "opciones": [
      "9",
      "10",
      "11",
      "12"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "10"
  },
  {
    "id": "M2",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 2,
    "imagen": null,
    "enunciado": "Completa la secuencia: 5, 10, 15, 20, ___",
    "opciones": [
      "22",
      "25",
      "30",
      "35"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "25"
  },
  {
    "id": "M3",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 3,
    "imagen": null,
    "enunciado": "¿Qué número falta al final de esta serie? 30, 27, 24, 21, ___",
    "opciones": [
      "19",
      "18",
      "17",
      "20"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "18"
  },
  {
    "id": "M4",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 4,
    "imagen": null,
    "enunciado": "Encuentra el número que falta en el medio: 4, 8, 12, ___, 20, 24",
    "opciones": [
      "14",
      "15",
      "16",
      "18"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "16"
  },
  {
    "id": "M5",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 5,
    "imagen": null,
    "enunciado": "¿Qué número sigue en el patrón? 3, 6, 12, 24, ___",
    "opciones": [
      "30",
      "36",
      "42",
      "48"
    ],
    "respuestaCorrecta": "D",
    "respuestaTexto": "48"
  },
  {
    "id": "M6",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 6,
    "imagen": null,
    "enunciado": "Observa cómo crecen los números y descubre cuál sigue: 1, 2, 4, 7, 11, ___",
    "opciones": [
      "14",
      "15",
      "16",
      "18"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "16"
  },
  {
    "id": "M7",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 7,
    "imagen": null,
    "enunciado": "¿Qué número continúa la serie? 10, 12, 9, 11, 8, 10, ___",
    "opciones": [
      "6",
      "7",
      "9",
      "12"
    ],
    "respuestaCorrecta": "B",
    "respuestaTexto": "7"
  },
  {
    "id": "M8",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 8,
    "imagen": null,
    "enunciado": "Descubre el número que sigue: 80, 40, 20, 10, ___",
    "opciones": [
      "0",
      "2",
      "5",
      "8"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "5"
  },
  {
    "id": "M9",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 9,
    "imagen": null,
    "enunciado": "¿Qué número completa la serie? 1, 4, 9, 16, 25, ___",
    "opciones": [
      "30",
      "32",
      "35",
      "36"
    ],
    "respuestaCorrecta": "D",
    "respuestaTexto": "36"
  },
  {
    "id": "M10",
    "categoria": "matematica",
    "nombreCategoria": "Lógico-Matemática",
    "emoji": "🔢",
    "tipo": "Serie numérica",
    "nivel": 10,
    "imagen": null,
    "enunciado": "Observa con mucha atención y encuentra el número final: 2, 3, 5, 8, 13, 21, ___",
    "opciones": [
      "29",
      "31",
      "34",
      "36"
    ],
    "respuestaCorrecta": "C",
    "respuestaTexto": "34"
  }
];
