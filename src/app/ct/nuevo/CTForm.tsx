"use client";

import { useState } from "react";
import { TIPOS_TRAMITE } from "@/lib/ct/types";

export default function CTForm() {
  const [conceptoTecnicoNo, setConceptoTecnicoNo] = useState("");
  const [autoNo, setAutoNo] = useState("");
  const [expediente, setExpediente] = useState("");
  const [asunto, setAsunto] = useState("");
  const [interesado, setInteresado] = useState("");
  const [localizacion, setLocalizacion] = useState("");
  const [fechaVisita, setFechaVisita] = useState("");
  const [tipoTramite, setTipoTramite] = useState<string>(TIPOS_TRAMITE[0]);
  const [elaboro, setElaboro] = useState("");
  const [revisoAprobo, setRevisoAprobo] = useState("");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generar() {
    setGenerando(true);
    setError(null);
    try {
      const res = await fetch("/api/ct/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptoTecnicoNo,
          autoNo,
          expediente,
          asunto,
          interesado,
          localizacion,
          fechaVisita,
          tipoTramite,
          elaboro,
          revisoAprobo,
        }),
      });
      if (!res.ok) throw new Error("No se pudo generar el documento");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CT_${expediente || "borrador"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Hubo un problema generando el documento. Intenta de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="space-y-5">
      <Campo label="Tipo de trámite" ayuda="Define qué secciones lleva el CT (paso 0 de la skill ct-cormacarena).">
        <select
          value={tipoTramite}
          onChange={(e) => setTipoTramite(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {TIPOS_TRAMITE.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Concepto Técnico No.">
          <input
            value={conceptoTecnicoNo}
            onChange={(e) => setConceptoTecnicoNo(e.target.value)}
            placeholder="PM-GA.3.44.26."
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Campo>
        <Campo label="Expediente No.">
          <input
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
            placeholder="3.37.2.xx.xxx"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Campo>
      </div>

      <Campo label="Auto No.">
        <input
          value={autoNo}
          onChange={(e) => setAutoNo(e.target.value)}
          placeholder="Auto PS-GJ.1.2.64.xx.xxxx del ..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </Campo>

      <Campo label="Asunto">
        <textarea
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Evaluación técnica y ambiental en el marco del trámite administrativo para..."
        />
      </Campo>

      <Campo label="Interesado" ayuda="Usuario/empresa y NIT o cédula.">
        <input
          value={interesado}
          onChange={(e) => setInteresado(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Empresa S.A.S, identificado con NIT ..."
        />
      </Campo>

      <Campo label="Localización">
        <input
          value={localizacion}
          onChange={(e) => setLocalizacion(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Predio ... vereda ... municipio de ..."
        />
      </Campo>

      <Campo label="Fecha de visita">
        <input
          type="date"
          value={fechaVisita}
          onChange={(e) => setFechaVisita(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Elaboró (nombre - cargo)">
          <input
            value={elaboro}
            onChange={(e) => setElaboro(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Campo>
        <Campo label="Revisó y aprobó (nombre - cargo)">
          <input
            value={revisoAprobo}
            onChange={(e) => setRevisoAprobo(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Campo>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={generar}
        disabled={generando}
        className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {generando ? "Generando…" : "Generar documento base (.docx)"}
      </button>
      <p className="text-xs text-slate-500">
        Esto arma el encabezado DATOS GENERALES (F.GA-39), los títulos de sección según el tipo de trámite y el
        cierre/firmas institucionales. El análisis de fondo de cada sección lo redactas tú o lo pides aquí en el
        chat con la skill <code className="rounded bg-slate-100 px-1">ct-cormacarena</code>, pegándolo luego en
        este documento.
      </p>
    </div>
  );
}

function Campo({ label, ayuda, children }: { label: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {ayuda && <p className="mb-1 text-xs text-slate-500">{ayuda}</p>}
      {children}
    </div>
  );
}
