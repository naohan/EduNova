"use client";

import { setAgeTier } from "@/lib/age-tier";
import { login } from "@/lib/api/client";
import type { User, UserRole } from "@/lib/api/edunova-contract";
import { setSessionUser, setToken, type SessionUser } from "@/lib/api/session";

// Acceso por rol del demo. Basado en el trabajo de Bryan Larico (rama Bryan del backend).

export type DemoUser = SessionUser & { description: string; avatarBg: string; badge: string };

export const DEMO_USERS: DemoUser[] = [
  {
    id: "u-teacher-1",
    role: "TEACHER",
    alias: "Profe Ana",
    classroomCode: "EDU-402",
    description: "Docente del aula EDU-402",
    avatarBg: "bg-[#5636D9]",
    badge: "Docente",
  },
  {
    id: "u-student-1",
    role: "STUDENT",
    alias: "Gloria",
    ageTier: "AVENTURERO_10_12",
    classroomCode: "EDU-402",
    description: "Aventurera, 10 a 12 años",
    avatarBg: "bg-[#2DBE70]",
    badge: "Estudiante",
  },
  {
    id: "u-student-2",
    role: "STUDENT",
    alias: "Mateo",
    ageTier: "EXPLORADOR_7_9",
    classroomCode: "EDU-402",
    description: "Explorador, 7 a 9 años",
    avatarBg: "bg-[#4C9EFF]",
    badge: "Estudiante",
  },
  {
    id: "u-student-3",
    role: "STUDENT",
    alias: "Sofía",
    ageTier: "CREADOR_13_15",
    classroomCode: "EDU-402",
    description: "Creadora, 13 a 15 años",
    avatarBg: "bg-[#F0A020]",
    badge: "Estudiante",
  },
  {
    id: "u-family-1",
    role: "FAMILY_TUTOR",
    alias: "Mamá de Gloria",
    linkedStudentId: "u-student-1",
    description: "Tutor familiar vinculado a Gloria",
    avatarBg: "bg-[#E11D48]",
    badge: "Tutor familiar",
  },
];

const ROLE_HOME: Record<UserRole, string> = {
  TEACHER: "/docente",
  FAMILY_TUTOR: "/familia",
  STUDENT: "/estudiante",
};

function afterLogin(user: Pick<User, "role" | "ageTier">) {
  if (user.ageTier) setAgeTier(user.ageTier);
  return ROLE_HOME[user.role];
}

function findDemoUser({ userId, alias, classroomCode }: LoginParams) {
  const cleanAlias = alias?.trim().toLowerCase();
  const cleanCode = classroomCode?.trim().toUpperCase();
  return DEMO_USERS.find((u) => {
    if (userId) return u.id === userId;
    if (!cleanAlias || u.alias.toLowerCase() !== cleanAlias) return false;
    return !cleanCode || !u.classroomCode || u.classroomCode === cleanCode;
  });
}

type LoginParams = { userId?: string; alias?: string; classroomCode?: string };

/** Inicia sesión y devuelve la ruta del rol. Si el servidor no responde, usa los usuarios de prueba (RNF-03). */
export async function loginUser(params: LoginParams): Promise<string> {
  const r = await login(params);
  if (r.ok) return afterLogin(r.data.user);
  if (r.status === 401) throw new Error(r.error);

  const demo = findDemoUser(params);
  if (!demo) {
    throw new Error("Usuario no encontrado. Prueba con Gloria, Mateo, Sofía, Profe Ana o Mamá de Gloria.");
  }
  const { id, role, alias, ageTier, classroomCode, linkedStudentId } = demo;
  setToken(`demo-${id}`);
  setSessionUser({ id, role, alias, ageTier, classroomCode, linkedStudentId });
  return afterLogin(demo);
}
