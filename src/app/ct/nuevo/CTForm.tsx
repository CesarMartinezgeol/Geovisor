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
  const [extrayendo, setExtrayendo] = useState(false);
  const [errorOcr, setErrorOcr] = useState<string | null>(null);
  const [sugerenciaTramite, setSugerenciaTramite] = useState<string | null>(null);

  async function autocompletarDesdeArchivo(archivo: File) {
    setExtrayendo(true);
    setErrorOcr(null);
    setSugerenciaTramite(null);
    try {
      const form = new FormData();
      form.append("archivo", archivo);
      form.append("modo", "campos-ct");
      const res = await fetch("/api/ocr", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error desconocido");
      const campos = json.campos as Record<string, string | null>;
      if (campos.conceptoTecnicoNo) setConceptoTecnicoNo(campos.conceptoTecnicoNo);
      if (campos.autoNo) setAutoNo(campos.autoNo);
      if (campos.expediente) setExpediente(campos.expediente);
      if (campos.interesado) setInteresado(campos.interesado);
      if (campos.localizacion) setLocalizacion(campos.localizacion);
      if (campos.fechaVisita) setFechaVisita(campos.fechaVisita);
      if (campos.asunto) setAsunto(campos.asunto);
      if (campos.tipoTramiteSugerido) setSugerenciaTramite(campos.tipoTramiteSugerido);
    } catch (e) {
      setErrorOcr(e instanceof Error ? e.message : "No se pudo leer el documento.");
    } finally {
      setExtrayendo(false);
    }
  }

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
      <div className="rounded-md border border-dashed border-emerald-300 bg-emerald-50 p-4">
        <label className="mb-1 block text-sm font-medium">
          Autocompletar desde documento (FUN / Auto de inicio)
        </label>
        <p className="mb-2 text-xs text-slate-600">
          Sube el FUN o el Auto de inicio escaneado y se llenan los campos que se logren leer.
          Revisa siempre los datos antes de generar el documento.
        </p>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          disabled={extrayendo}
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) autocompletarDesdeArchivo(archivo);
            e.target.value = "";
          }}
          className="block w-full text-sm"
        />
        {extrayendo && <p className="mt-2 text-xs text-emerald-700">Leyendo documento con OCR…</p>}
        {errorOcr && <p className="mt-2 text-xs text-red-600">{errorOcr}</p>}
        {sugerenciaTramite && (
          <p className="mt-2 text-xs text-slate-600">
            Trámite según el documento: <span className="font-medium">{sugerenciaTramite}</span> —
            selecciónalo abajo si corresponde.
          </p>
        )}
      </div>

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
