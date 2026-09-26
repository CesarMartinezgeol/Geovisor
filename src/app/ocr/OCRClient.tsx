"use client";

import { useState } from "react";

export default function OCRClient() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [texto, setTexto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function procesar() {
    if (!archivo) return;
    setProcesando(true);
    setError(null);
    setTexto(null);
    setCopiado(false);
    try {
      const form = new FormData();
      form.append("archivo", archivo);
      form.append("modo", "texto");
      const res = await fetch("/api/ocr", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error desconocido");
      setTexto(json.texto);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo procesar el documento.");
    } finally {
      setProcesando(false);
    }
  }

  function descargar() {
    if (!texto || !archivo) return;
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${archivo.name.replace(/\.[^.]+$/, "")}_ocr.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copiar() {
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-dashed p-4">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          disabled={procesando}
          onChange={(e) => {
            setArchivo(e.target.files?.[0] ?? null);
            setTexto(null);
            setError(null);
          }}
          className="block w-full text-sm"
        />
        <p className="mt-2 text-xs text-slate-500">
          PDF (incluye expedientes multipágina) o imagen escaneada. Máximo 32 MB.
        </p>
      </div>

      <button
        onClick={procesar}
        disabled={!archivo || procesando}
        className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {procesando ? "Leyendo documento…" : "Extraer texto"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {texto && (
        <div className="space-y-2">
          <div className="flex gap-3">
            <button onClick={copiar} className="text-sm text-emerald-700 underline">
              {copiado ? "Copiado ✓" : "Copiar"}
            </button>
            <button onClick={descargar} className="text-sm text-emerald-700 underline">
              Descargar .txt
            </button>
          </div>
          <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap rounded-md border bg-white p-4 text-sm">
            {texto}
          </pre>
        </div>
      )}
    </div>
  );
}
