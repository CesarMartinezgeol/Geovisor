"use client";

import { useState } from "react";
import { Punto } from "@/lib/types";

export default function InformeForm({ punto }: { punto: Punto }) {
  const [fechaVisita, setFechaVisita] = useState("");
  const [descripcionVisita, setDescripcionVisita] = useState("");
  const [estadoPermisos, setEstadoPermisos] = useState("");
  const [conclusionesAdicionales, setConclusionesAdicionales] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generar() {
    setGenerando(true);
    setError(null);
    try {
      const res = await fetch(`/api/informes/${punto.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaVisita,
          descripcionVisita,
          estadoPermisos,
          conclusionesAdicionales,
          proyecto,
        }),
      });
      if (!res.ok) throw new Error("No se pudo generar el informe");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${punto.id}_Informe_Exp.${punto.expediente ?? ""}.docx`;
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
      <Campo label="Fecha de la visita">
        <input
          type="date"
          value={fechaVisita}
          onChange={(e) => setFechaVisita(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </Campo>

      <Campo
        label="Descripción de la visita"
        ayuda="Qué se hizo en campo: acceso al sitio, inspección visual, purga del pozo, toma de nivel y muestras, novedades."
      >
        <textarea
          value={descripcionVisita}
          onChange={(e) => setDescripcionVisita(e.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="La visita se realizó el ... Una vez en el sitio de muestreo..."
        />
      </Campo>

      <Campo
        label="Estado de los permisos ambientales"
        ayuda="Resume el estado del trámite en el expediente: vigente, en prórroga, sin respuesta, en sancionatorio, etc."
      >
        <textarea
          value={estadoPermisos}
          onChange={(e) => setEstadoPermisos(e.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Mediante la Resolución ... se otorgó concesión de aguas subterráneas..."
        />
      </Campo>

      <Campo label="Conclusiones (una por línea)">
        <textarea
          value={conclusionesAdicionales}
          onChange={(e) => setConclusionesAdicionales(e.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder={"El pozo se encuentra en buen estado.\nSe recomienda..."}
        />
      </Campo>

      <Campo label="Proyectó (nombre y cargo)">
        <input
          value={proyecto}
          onChange={(e) => setProyecto(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Nombre Apellido - Cargo"
        />
      </Campo>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={generar}
        disabled={generando}
        className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {generando ? "Generando…" : "Generar borrador en Word (.docx)"}
      </button>
      <p className="text-xs text-slate-500">
        El documento trae ya llenos los datos del expediente, la ficha técnica, el historial de niveles y
        la tabla de resultados de calidad (con los valores fuera de rango resaltados). Los campos de
        arriba y el registro fotográfico se completan directamente en Word.
      </p>
    </div>
  );
}

function Campo({
  label,
  ayuda,
  children,
}: {
  label: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {ayuda && <p className="mb-1 text-xs text-slate-500">{ayuda}</p>}
      {children}
    </div>
  );
}
