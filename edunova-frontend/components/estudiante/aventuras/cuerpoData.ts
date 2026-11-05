import type { AgeTier } from "@/lib/api/edunova-contract";

export type IdOrgano = "cerebro" | "pulmones" | "corazon" | "higado" | "estomago" | "intestinos" | "rinones";

export const ORGANOS: Record<IdOrgano, { nombre: string; funcion: string }> = {
  cerebro: { nombre: "Cerebro", funcion: "piensa, recuerda y controla el cuerpo" },
  pulmones: { nombre: "Pulmones", funcion: "toman el oxígeno del aire" },
  corazon: { nombre: "Corazón", funcion: "bombea la sangre por todo el cuerpo" },
  higado: { nombre: "Hígado", funcion: "limpia la sangre y produce bilis" },
  estomago: { nombre: "Estómago", funcion: "recibe y mezcla la comida" },
  intestinos: { nombre: "Intestinos", funcion: "absorben los nutrientes de la comida" },
  rinones: { nombre: "Riñones", funcion: "filtran la sangre y forman la orina" },
};

export type Caso = {
  id: string;
  dificil: boolean;
  texto: string;
  organos: IdOrgano[];
  explicacion: string;
};

export const CASOS: Caso[] = [
  {
    id: "comida",
    dificil: false,
    texto: "Comiste mucho y te duele la barriga. ¿Qué órgano recibe la comida?",
    organos: ["estomago"],
    explicacion: "El estómago recibe la comida y la mezcla con jugos para digerirla.",
  },
  {
    id: "carrera",
    dificil: false,
    texto: "Corriste una carrera y sientes golpes en el pecho. ¿Qué órgano late tan rápido?",
    organos: ["corazon"],
    explicacion: "El corazón late más rápido para llevar más sangre a los músculos.",
  },
  {
    id: "tabla",
    dificil: false,
    texto: "Estás aprendiendo la tabla del 7. ¿Qué órgano está trabajando?",
    organos: ["cerebro"],
    explicacion: "El cerebro guarda lo que aprendes y te ayuda a recordarlo.",
  },
  {
    id: "agua",
    dificil: false,
    texto: "Tomaste mucha agua y tienes ganas de ir al baño. ¿Qué órganos forman la orina?",
    organos: ["rinones"],
    explicacion: "Los riñones filtran la sangre y forman la orina.",
  },
  {
    id: "altura",
    dificil: true,
    texto: "Subiste a una montaña muy alta y te falta el aire. ¿Qué 2 órganos trabajan más?",
    organos: ["pulmones", "corazon"],
    explicacion: "Arriba llega menos oxígeno por respiración: los pulmones respiran más rápido y el corazón late más.",
  },
  {
    id: "grasa",
    dificil: true,
    texto: "Comiste algo con mucha grasa. ¿Qué órgano produce la bilis para digerirla?",
    organos: ["higado"],
    explicacion: "El hígado produce la bilis, que ayuda a digerir las grasas.",
  },
  {
    id: "nutrientes",
    dificil: true,
    texto: "¿Por dónde pasan los nutrientes de la comida hacia la sangre?",
    organos: ["intestinos"],
    explicacion: "En el intestino delgado los nutrientes pasan a la sangre.",
  },
];

export const CONFIG_DOCTOR: Record<AgeTier, { rondas: number; nombres: boolean; soloFaciles: boolean; vozAutomatica: boolean }> = {
  EXPLORADOR_7_9: { rondas: 3, nombres: true, soloFaciles: true, vozAutomatica: true },
  AVENTURERO_10_12: { rondas: 5, nombres: false, soloFaciles: false, vozAutomatica: false },
  CREADOR_13_15: { rondas: 7, nombres: false, soloFaciles: false, vozAutomatica: false },
};
