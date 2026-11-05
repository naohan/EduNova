"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEMO_USERS, loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"quick" | "code">("quick");
  const [alias, setAlias] = useState("");
  const [classroomCode, setClassroomCode] = useState("EDU-402");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function entrar(id: string, params: Parameters<typeof loginUser>[0]) {
    setLoadingId(id);
    setError(null);
    try {
      router.push(await loginUser(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setLoadingId(null);
    }
  }

  function enviarCodigo(e: FormEvent) {
    e.preventDefault();
    if (!alias.trim()) {
      setError("Por favor ingresa tu nombre o alias.");
      return;
    }
    entrar("form", { alias, classroomCode });
  }

  const tabCls = (on: boolean) =>
    `flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
      on ? "bg-white text-[#5636D9] shadow-sm" : "text-[#17164F]/70 hover:text-[#17164F]"
    }`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(180deg,#F7F4FF_0%,#EEF3FF_45%,#F8F7FC_100%)] p-4 sm:p-6">
      <div className="mb-4 w-full max-w-2xl">
        <Link href="/" className="text-sm font-bold text-[#5636D9] hover:text-[#4324bd]">
          ← Volver al inicio
        </Link>
      </div>

      <div className="w-full max-w-2xl rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-[0_20px_50px_rgba(86,54,217,0.12)] sm:p-10">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center gap-2">
            <Image src="/assets/Logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
              EduNova
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#17164F] sm:text-3xl">Elige cómo deseas ingresar</h1>
          <p className="mt-2 text-sm text-[#6B7280]">Cada rol ve lo que le corresponde.</p>
        </div>

        <div className="mb-8 flex rounded-2xl bg-[#F2EEFF] p-1.5">
          <button
            type="button"
            onClick={() => {
              setTab("quick");
              setError(null);
            }}
            className={tabCls(tab === "quick")}
          >
            Acceso rápido
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("code");
              setError(null);
            }}
            className={tabCls(tab === "code")}
          >
            Código de aula
          </button>
        </div>

        {error ? (
          <p role="alert" className="mb-6 rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#991B1B]">
            {error}
          </p>
        ) : null}

        {tab === "quick" ? (
          <div className="grid gap-3">
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => entrar(u.id, { userId: u.id })}
                disabled={Boolean(loadingId)}
                className="group flex items-center justify-between rounded-2xl border-2 border-[#E8E0FF] bg-white p-4 text-left transition-all hover:border-[#5636D9] hover:bg-[#F7F4FF] disabled:opacity-50"
              >
                <span className="flex min-w-0 items-center gap-3.5">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${u.avatarBg} text-base font-bold text-white shadow-sm`}
                  >
                    {u.alias.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#17164F] group-hover:text-[#5636D9]">{u.alias}</span>
                      <span className="rounded-full bg-[#EAE5FF] px-2 py-0.5 text-[11px] font-bold text-[#5636D9]">
                        {u.badge}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-[#6B7280]">{u.description}</span>
                  </span>
                </span>
                <span className="ml-2 shrink-0 text-xs font-bold text-[#5636D9]">
                  {loadingId === u.id ? "Ingresando…" : "Entrar →"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={enviarCodigo} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#17164F]">Tu nombre o alias</span>
              <input
                type="text"
                placeholder="Ejemplo: Gloria, Mateo o Profe Ana"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#E8E0FF] px-4 py-3 text-sm text-[#17164F] placeholder-[#9CA3AF] focus:border-[#5636D9] focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-[#6B7280]">Usa tu alias, sin apellidos.</span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#17164F]">Código de aula</span>
              <input
                type="text"
                placeholder="Ejemplo: EDU-402"
                value={classroomCode}
                onChange={(e) => setClassroomCode(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#E8E0FF] px-4 py-3 font-mono text-sm uppercase tracking-wider text-[#17164F] placeholder-[#9CA3AF] focus:border-[#5636D9] focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={loadingId === "form"}
              className="w-full rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white hover:bg-[#4324bd] disabled:opacity-50"
            >
              {loadingId === "form" ? "Ingresando…" : "Ingresar al aula"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
