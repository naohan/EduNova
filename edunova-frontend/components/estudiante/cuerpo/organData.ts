/** Datos educativos adaptados de jceronch1/Cuerpo-humano_3D */

export type OrganId =
  | "cerebro"
  | "pulmones"
  | "corazon"
  | "higado"
  | "estomago"
  | "intestinos"
  | "rinones"
  | "pancreas"
  | "tiroides"
  | "timo"
  | "vejiga"
  | "nasofaringe";

export interface OrganBody {
  id: OrganId;
  name: string;
  emoji: string;
  descriptor: string;
  sistema: string;
  funcion: string;
  ubicacion: string;
  relacion: string;
  resumen: string;
  datoCurioso: string;
  importancia: string;
  tamano: string;
  /** Color acento UI / fallback 3D */
  color: string;
  /** Ruta pública del .glb (solo órganos con modelo liviano incluido) */
  modelo?: string;
  miniatura: string;
}

export const ORGANOS: OrganBody[] = [
  {
    id: "cerebro",
    name: "Cerebro",
    emoji: "🧠",
    descriptor: "Centro de control",
    sistema: "Sistema nervioso",
    funcion: "Coordina pensamiento y movimiento",
    ubicacion: "Cráneo",
    relacion: "Médula espinal",
    resumen:
      "El cerebro integra señales, regula funciones vitales y permite memoria, lenguaje, aprendizaje y movimiento voluntario.",
    datoCurioso:
      "Aunque pesa cerca del 2 % del cuerpo, usa alrededor del 20 % de la energía.",
    importancia:
      "Dirige la actividad del sistema nervioso y conecta órganos y sentidos.",
    tamano: "Aprox. 1,3 a 1,4 kg",
    color: "#E87A9B",
    modelo: "/assets/cuerpo/3d/Cerebro.glb",
    miniatura: "/assets/cuerpo/miniaturas/thumb_cerebro.png",
  },
  {
    id: "pulmones",
    name: "Pulmones",
    emoji: "🫁",
    descriptor: "Órganos respiratorios",
    sistema: "Sistema respiratorio",
    funcion: "Intercambian oxígeno y CO₂",
    ubicacion: "Tórax",
    relacion: "Tráquea y diafragma",
    resumen:
      "Los pulmones oxigenan la sangre y eliminan dióxido de carbono gracias a millones de alvéolos.",
    datoCurioso:
      "El pulmón derecho tiene 3 lóbulos y el izquierdo 2, para dejar espacio al corazón.",
    importancia:
      "Permiten la respiración y el equilibrio de gases que necesitan las células.",
    tamano: "Dos órganos elásticos",
    color: "#7EC8E3",
    modelo: "/assets/cuerpo/3d/Pulmones.glb",
    miniatura: "/assets/cuerpo/miniaturas/thumb_pulmones.png",
  },
  {
    id: "corazon",
    name: "Corazón",
    emoji: "❤️",
    descriptor: "Bomba muscular",
    sistema: "Sistema cardiovascular",
    funcion: "Impulsa la sangre",
    ubicacion: "Mediastino (centro del pecho)",
    relacion: "Grandes vasos",
    resumen:
      "El corazón late sin parar para enviar sangre oxigenada y recoger sangre venosa por todo el cuerpo.",
    datoCurioso: "En un día promedio puede latir cerca de 100.000 veces.",
    importancia:
      "Mantiene la distribución de oxígeno, nutrientes y hormonas a los tejidos.",
    tamano: "Similar a un puño cerrado",
    color: "#E85D5D",
    modelo: "/assets/cuerpo/3d/Corazon.glb",
    miniatura: "/assets/cuerpo/miniaturas/thumb_corazon.png",
  },
  {
    id: "higado",
    name: "Hígado",
    emoji: "🟤",
    descriptor: "Órgano metabólico",
    sistema: "Sistema digestivo",
    funcion: "Filtra y metaboliza",
    ubicacion: "Abdomen superior derecho",
    relacion: "Vesícula biliar",
    resumen:
      "Es el órgano interno más grande: desintoxica, produce bilis y procesa nutrientes.",
    datoCurioso: "Puede regenerar parte de su tejido.",
    importancia:
      "Procesa nutrientes, almacena energía y transforma sustancias para usarlas o eliminarlas.",
    tamano: "Aprox. 1,5 kg",
    color: "#A67C52",
    miniatura: "/assets/cuerpo/miniaturas/thumb_higado.png",
  },
  {
    id: "estomago",
    name: "Estómago",
    emoji: "🟠",
    descriptor: "Reservorio digestivo",
    sistema: "Sistema digestivo",
    funcion: "Mezcla y digiere alimentos",
    ubicacion: "Abdomen superior izquierdo",
    relacion: "Esófago e intestino delgado",
    resumen:
      "Recibe los alimentos, los mezcla con jugos gástricos y los convierte en quimo.",
    datoCurioso:
      "Su mucosa se renueva rápido para protegerse de su propio ácido.",
    importancia:
      "Inicia la digestión química de proteínas y regula el paso al intestino.",
    tamano: "Capacidad variable",
    color: "#F0A06A",
    miniatura: "/assets/cuerpo/miniaturas/thumb_estomago.png",
  },
  {
    id: "intestinos",
    name: "Intestinos",
    emoji: "🪢",
    descriptor: "Tubo de absorción",
    sistema: "Sistema digestivo",
    funcion: "Absorben nutrientes y agua",
    ubicacion: "Abdomen",
    relacion: "Microbiota intestinal",
    resumen:
      "El intestino delgado absorbe nutrientes y el grueso recupera agua; ambos alojan microbiota clave.",
    datoCurioso:
      "El intestino delgado puede medir varios metros si se extendiera.",
    importancia:
      "Completa la digestión, absorbe nutrientes y participa en la inmunidad.",
    tamano: "Varios metros de longitud",
    color: "#C97B84",
    modelo: "/assets/cuerpo/3d/Intestinos.glb",
    miniatura: "/assets/cuerpo/miniaturas/thumb_intestinos.png",
  },
  {
    id: "rinones",
    name: "Riñones",
    emoji: "🫘",
    descriptor: "Filtros corporales",
    sistema: "Sistema urinario",
    funcion: "Filtran sangre y regulan líquidos",
    ubicacion: "Región lumbar posterior",
    relacion: "Uréteres y vejiga",
    resumen:
      "Eliminan desechos, regulan agua y sales, y ayudan a controlar la presión arterial.",
    datoCurioso: "Cada riñón contiene alrededor de un millón de nefronas.",
    importancia:
      "Mantienen estable el medio interno y producen hormonas esenciales.",
    tamano: "Aprox. 10 a 12 cm cada uno",
    color: "#D4849A",
    miniatura: "/assets/cuerpo/miniaturas/thumb_rinones.png",
  },
  {
    id: "pancreas",
    name: "Páncreas",
    emoji: "🟡",
    descriptor: "Glándula mixta",
    sistema: "Sistema digestivo",
    funcion: "Produce enzimas e insulina",
    ubicacion: "Abdomen superior",
    relacion: "Duodeno",
    resumen:
      "Combina funciones digestivas y endocrinas: libera enzimas y regula la glucosa.",
    datoCurioso: "Tiene funciones exocrinas y endocrinas en el mismo órgano.",
    importancia: "Ayuda a digerir alimentos y controla la glucemia.",
    tamano: "Aprox. 15 cm",
    color: "#E8C46A",
    miniatura: "/assets/cuerpo/miniaturas/thumb_pancreas.png",
  },
  {
    id: "tiroides",
    name: "Tiroides",
    emoji: "🦋",
    descriptor: "Glándula endocrina",
    sistema: "Sistema endocrino",
    funcion: "Regula el metabolismo",
    ubicacion: "Cuello anterior",
    relacion: "Tráquea",
    resumen:
      "Produce hormonas que influyen en energía, temperatura, crecimiento y ritmo cardíaco.",
    datoCurioso: "Su forma recuerda a una mariposa alrededor de la tráquea.",
    importancia: "Ajusta el ritmo metabólico de muchos tejidos.",
    tamano: "Pequeña glándula cervical",
    color: "#9B7EDE",
    modelo: "/assets/cuerpo/3d/Tiroides.glb",
    miniatura: "/assets/cuerpo/miniaturas/thumb_tiroides.png",
  },
  {
    id: "timo",
    name: "Timo",
    emoji: "🛡️",
    descriptor: "Órgano inmunitario",
    sistema: "Sistema inmunitario",
    funcion: "Madura linfocitos T",
    ubicacion: "Mediastino superior",
    relacion: "Sistema linfático",
    resumen:
      "Entrena linfocitos T durante la infancia y participa en la defensa inmunológica.",
    datoCurioso: "Es más activo en la niñez y luego disminuye de tamaño.",
    importancia:
      "Ayuda al sistema inmune a reconocer amenazas sin atacar tejidos propios.",
    tamano: "Variable según la edad",
    color: "#6BBF8A",
    miniatura: "/assets/cuerpo/miniaturas/thumb_timo.png",
  },
  {
    id: "vejiga",
    name: "Vejiga",
    emoji: "💧",
    descriptor: "Reservorio urinario",
    sistema: "Sistema urinario",
    funcion: "Almacena orina",
    ubicacion: "Pelvis",
    relacion: "Uréteres y uretra",
    resumen:
      "Recibe la orina de los riñones y la almacena hasta la micción.",
    datoCurioso: "Su pared muscular se distiende a medida que se llena.",
    importancia: "Permite almacenar y expulsar la orina de forma controlada.",
    tamano: "Capacidad elástica",
    color: "#5BA3E0",
    miniatura: "/assets/cuerpo/miniaturas/thumb_vejiga.png",
  },
  {
    id: "nasofaringe",
    name: "Nasofaringe",
    emoji: "👃",
    descriptor: "Vía aérea superior",
    sistema: "Vías respiratorias",
    funcion: "Conduce aire",
    ubicacion: "Detrás de la cavidad nasal",
    relacion: "Oído medio",
    resumen:
      "Conecta la nariz con la faringe y ayuda al paso del aire hacia las vías respiratorias.",
    datoCurioso: "Las trompas de Eustaquio desembocan en esta región.",
    importancia:
      "Participa en ventilación, resonancia y equilibrio de presión del oído medio.",
    tamano: "Región corta de la faringe",
    color: "#F2A0B8",
    miniatura: "/assets/cuerpo/miniaturas/thumb_nasofaringe.png",
  },
];

export const unidadCuerpo = {
  id: "cuerpo-humano",
  titulo: "El cuerpo humano",
  leccion: "Lección 1: Órganos y sistemas",
  progreso: 20,
};

export const teoriaCuerpo = {
  titulo: "¿Cómo trabajan nuestros órganos?",
  parrafos: [
    "El cuerpo humano está formado por órganos que trabajan en sistemas: nervioso, respiratorio, cardiovascular, digestivo y más.",
    "Cada órgano tiene una función, una ubicación y se relaciona con otros. Explorarlos en 3D te ayuda a entender su forma y tamaño relativo.",
    "Toca un órgano para ver su ficha: sistema, función, ubicación y un dato curioso para recordar.",
  ],
};
