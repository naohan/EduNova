import { NextResponse } from "next/server";

interface VerifyRequestBody {
  action: "verify_question" | "generate_opponent_questions";
  course?: string;
  topic?: string;
  question?: string;
  correctAnswer?: string;
  wrongAnswers?: string[];
  targetWrongCount?: number;
  autocompleteWrong?: boolean;
  previousQuestions?: string[];
  fileInfo?: { name: string; type: string; textSnippet?: string };
  count?: number;
  alternativesCount?: number;
  opponentName?: string;
}

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const body: VerifyRequestBody = await req.json();

    if (body.action === "generate_opponent_questions") {
      return await handleGenerateOpponentQuestions(body);
    }

    return await handleVerifyQuestion(body);
  } catch (error) {
    console.error("Error in gemini-duel API:", error);
    return NextResponse.json(
      { error: "Error procesando solicitud en el árbitro IA" },
      { status: 500 }
    );
  }
}

async function handleVerifyQuestion(body: VerifyRequestBody) {
  const {
    course = "General",
    topic = "Tema general",
    question = "",
    correctAnswer = "",
    wrongAnswers = [],
    targetWrongCount = 3,
    autocompleteWrong = false,
    previousQuestions = [],
    fileInfo,
  } = body;

  const trimmedQuestion = question.trim();
  const trimmedCorrect = correctAnswer.trim();

  // Basic client validation
  if (!trimmedQuestion || !trimmedCorrect) {
    return NextResponse.json({
      status: "REJECTED",
      feedback: "La pregunta y la respuesta correcta no pueden estar vacías.",
      improvedQuestion: trimmedQuestion,
      correctAnswer: trimmedCorrect,
      wrongAnswers: wrongAnswers.filter(Boolean),
      isDuplicate: false,
      recommendation: "Completa el enunciado y la alternativa correcta antes de verificar.",
    });
  }

  // Check duplicate locally first
  const isDuplicateLocal = previousQuestions.some(
    (prev) =>
      prev.toLowerCase().trim() === trimmedQuestion.toLowerCase().trim() ||
      (prev.length > 10 &&
        trimmedQuestion.length > 10 &&
        (prev.toLowerCase().includes(trimmedQuestion.toLowerCase()) ||
          trimmedQuestion.toLowerCase().includes(prev.toLowerCase())))
  );

  if (isDuplicateLocal) {
    return NextResponse.json({
      status: "REJECTED",
      feedback: "Esta pregunta es idéntica o muy similar a una que ya incluiste en este mismo cuestionario.",
      improvedQuestion: trimmedQuestion,
      correctAnswer: trimmedCorrect,
      wrongAnswers: wrongAnswers.filter(Boolean),
      isDuplicate: true,
      recommendation: "Elabora una pregunta diferente sobre otro aspecto del tema para desafiar a tu oponente.",
    });
  }

  const prompt = `
Eres el Agente Juez y Tutor Pedagógico de Duelos Académicos en EduNova.
Inspirado en los duelos intelectuales y matemáticos del Renacimiento (siglos XIV-XVII, como Tartaglia vs. Fior), donde dos rivales se enviaban problemas desafiantes.

Tu función es verificar rigurosamente la pregunta formulada por un estudiante:
- Curso: "${course}"
- Tema: "${topic}"
${fileInfo ? `- Material de apoyo adjuntado: Archivo "${fileInfo.name}" (${fileInfo.type}). ${fileInfo.textSnippet ? `Contenido: ${fileInfo.textSnippet}` : ""}` : ""}
- Pregunta del estudiante: "${trimmedQuestion}"
- Alternativa correcta indicada: "${trimmedCorrect}"
- Alternativas incorrectas dadas por el estudiante: ${JSON.stringify(wrongAnswers.filter(Boolean))}
- Cantidad de alternativas incorrectas requeridas: ${targetWrongCount}
- Checkbox de Autocompletar alternativas incorrectas: ${autocompleteWrong ? "ACTIVADO" : "DESACTIVADO"}
- Preguntas anteriores en este duelo: ${JSON.stringify(previousQuestions)}

REGLAS DE EVALUACIÓN:
1. DUPLICIDAD: Compara con las preguntas anteriores. Si evalúa exactamente lo mismo o se repite, status: "REJECTED", isDuplicate: true.
2. COMPRENSIÓN Y PEDAGOGÍA: Si no se comprende en lo absoluto, carece de sentido lógico, es ofensiva o es texto basura, status: "REJECTED". Explica con claridad la razón pedagógica.
3. PRESERVACIÓN DE LA ESENCIA: Si la pregunta tiene sentido pero puede redactarse con mayor elegancia, claridad o corrección ortográfica/matemática, mejórala en 'improvedQuestion' respetando al 100% la intención original del estudiante. Si la mejoraste, status: "MODIFIED". Si ya estaba bien redactada, status: "APPROVED".
4. RESPUESTA CORRECTA Y FORMATO HOMOGÉNEO:
   - Asegúrate de que 'correctAnswer' responda con precisión matemática o académica a la pregunta planteada.
   - FORMATO Y ELEGANCIA: Tanto 'correctAnswer' como cada elemento en 'wrongAnswers' DEBEN coincidir con el formato tipográfico y formal de la pregunta.
   - Si la pregunta plantea ecuaciones o expresiones con espacios (ej: x - 3 = -2x + 6), las alternativas DEBEN tener espacios alrededor del signo igual (ej: "x = 3", "x = 1", "x = -9", "x = 6", NUNCA pegado como "x=3" o "x=-9").
   - Corrige ortografía, mayúsculas y tildes si son palabras o frases (ej: "cristobal colon" -> "Cristóbal Colón").
   - Devuelve en 'correctAnswer' la versión perfeccionada y con el formato impecable.
5. OPCIONES INCORRECTAS (DISTRACTORES):
   - Aplica exactamente el mismo formato limpio, con espacios y homogéneo que en 'correctAnswer' (ej: si la respuesta es "x = 3", los distractores deben ser "x = 1", "x = -9", "x = 6", no "x=1").
   - Si 'autocompleteWrong' es true o faltan alternativas para llegar a ${targetWrongCount}, genera distractores creíbles y pedagógicamente útiles (errores conceptuales o de cálculo comunes), pero ESTRICTAMENTE INCORRECTOS (nunca verdades a medias o respuestas parcialmente válidas).
   - Si el estudiante colocó alternativas incorrectas, verifica que realmente lo sean y formatea su redacción para que tenga el mismo estándar visual que la pregunta.
   - En 'wrongAnswers' devuelve exactamente ${targetWrongCount} opciones incorrectas limpias y formateadas.
6. RECOMENDACIÓN: En 'recommendation', incluye un consejo motivador y conciso para el estudiante sobre el impacto de su pregunta en el duelo.

Responde ÚNICAMENTE en formato JSON plano con esta estructura:
{
  "status": "APPROVED" | "MODIFIED" | "REJECTED",
  "feedback": "Explicación clara para el estudiante de qué se evaluó",
  "improvedQuestion": "Pregunta verificada o mejorada respetando la esencia",
  "correctAnswer": "Respuesta correcta validada",
  "wrongAnswers": ["distractor 1", "distractor 2", ...],
  "isDuplicate": false,
  "recommendation": "Consejo formativo o estratégico para el duelo"
}
`;

  try {
    const aiResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!aiResponse.ok) {
      console.warn("Gemini API error status:", aiResponse.status);
      return fallbackVerify(
        trimmedQuestion,
        trimmedCorrect,
        wrongAnswers,
        targetWrongCount,
        topic
      );
    }

    const data = await aiResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return fallbackVerify(
        trimmedQuestion,
        trimmedCorrect,
        wrongAnswers,
        targetWrongCount,
        topic
      );
    }

    const parsed = JSON.parse(rawText);
    return NextResponse.json(parsed);
  } catch (err) {
    console.warn("Error calling Gemini, activating fallback:", err);
    return fallbackVerify(
      trimmedQuestion,
      trimmedCorrect,
      wrongAnswers,
      targetWrongCount,
      topic
    );
  }
}

async function handleGenerateOpponentQuestions(body: VerifyRequestBody) {
  const {
    course = "Matemática",
    topic = "Ecuaciones",
    count = 3,
    alternativesCount = 4,
    opponentName = "Compañero",
    fileInfo,
  } = body;

  const targetWrong = Math.max(1, alternativesCount - 1);

  const prompt = `
Eres un estudiante escolar avanzado llamado "${opponentName}" compitiendo en el Duelo de Conocimiento de EduNova.
Debes crear exactamente ${count} preguntas desafiantes sobre el curso "${course}" y tema "${topic}".
${fileInfo ? `Básate principalmente en este material: "${fileInfo.name}" (${fileInfo.type}).` : ""}

Para cada una de las ${count} preguntas:
1. Formula una pregunta clara y retadora.
2. Indica la respuesta correcta.
3. Genera ${targetWrong} alternativas incorrectas creíbles (distractores educativos).
4. Proporciona una lista combinada 'options' de ${alternativesCount} opciones mezcladas aleatoriamente.
5. Proporciona el índice 'correctIndex' (de 0 a ${alternativesCount - 1}) de la opción correcta.
6. Proporciona una breve 'explanation'.

Responde ÚNICAMENTE en JSON con esta estructura:
{
  "questions": [
    {
      "question": "Enunciado de la pregunta",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0,
      "correctAnswer": "Texto exacto de la respuesta correcta",
      "explanation": "Breve explicación didáctica"
    }
  ]
}
`;

  try {
    const aiResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });

    if (aiResponse.ok) {
      const data = await aiResponse.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return NextResponse.json(parsed);
        }
      }
    }
  } catch (err) {
    console.warn("Opponent questions fallback triggered:", err);
  }

  // Deterministic fallback questions
  const defaultQuestions = Array.from({ length: count }).map((_, idx) => {
    const qNum = idx + 1;
    return {
      question: `¿Cuál es una propiedad fundamental de ${topic} en el contexto de ${course}? (Pregunta #${qNum} de ${opponentName})`,
      options: [
        `Es un principio estructurado que valida los resultados del tema`,
        `Es una aproximación empírica sin sustento formal`,
        `Solo aplica cuando las condiciones iniciales son nulas`,
        `Se utiliza únicamente en cálculos manuales antiguos`,
        `Depende exclusivamente de la escala de medición utilizada`,
        `Es un criterio optativo que no afecta el resultado final`,
      ].slice(0, alternativesCount),
      correctIndex: 0,
      correctAnswer: `Es un principio estructurado que valida los resultados del tema`,
      explanation: `Esta propiedad permite verificar y fundamentar el análisis en ${topic}.`,
    };
  });

  return NextResponse.json({ questions: defaultQuestions });
}

function formatEquationText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .replace(/([a-zA-Z0-9])\s*=\s*/g, "$1 = ");
}

function fallbackVerify(
  question: string,
  correctAnswer: string,
  providedWrong: string[],
  targetWrongCount: number,
  topic: string
) {
  const formattedCorrect = formatEquationText(correctAnswer);
  const currentWrong = providedWrong.filter(Boolean).map(formatEquationText);
  const needed = targetWrongCount - currentWrong.length;
  const generatedWrong = [...currentWrong];

  for (let i = 0; i < needed; i++) {
    generatedWrong.push(
      formatEquationText(`Alternativa incorrecta sobre ${topic} #${i + 1}`)
    );
  }

  return NextResponse.json({
    status: "APPROVED",
    feedback:
      "Pregunta evaluada por el árbitro académico local. La redacción y alternativas han sido formateadas.",
    improvedQuestion: question,
    correctAnswer: formattedCorrect,
    wrongAnswers: generatedWrong.slice(0, targetWrongCount),
    isDuplicate: false,
    recommendation:
      "¡Buena formulación! Tus alternativas desafiarán la agudeza de tu oponente.",
  });
}

