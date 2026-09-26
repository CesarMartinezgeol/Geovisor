"use client";

import { useMemo, useState } from "react";
import { ESTADO_LABEL, EstadoCT, ExpedienteCT } from "@/lib/ct/types";

const BADGE: Record<EstadoCT, string> = {
  en_tramite: "bg-slate-100 text-slate-700",
  en_evaluacion: "bg-slate-100 text-slate-700",
  requerido: "bg-amber-100 text-amber-800",
  esperando_respuesta: "bg-blue-100 text-blue-800",
  viable: "bg-green-100 text-green-800",
  otorgado: "bg-emerald-100 text-emerald-800",
  negado: "bg-red-100 text-red-800",
  archivado: "bg-slate-200 text-slate-600",
  remitido_juridica: "bg-purple-100 text-purple-800",
};

const POR_PAGINA = 30;

export default function CTTable({ expedientes }: { expedientes: ExpedienteCT[] }) {
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const tiposPermiso = useMemo(() => {
    const set = new Set<string>();
    for (const e of expedientes) if (e.tipoPermiso) set.add(e.tipoPermiso);
    return Array.from(set).sort();
  }, [expedientes]);

  const conteoPorEstado = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of expedientes) c[e.estado] = (c[e.estado] ?? 0) + 1;
    return c;
  }, [expedientes]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return expedientes.filter((e) => {
      if (estadoFiltro !== "todos" && e.estado !== estadoFiltro) return false;
      if (tipoFiltro !== "todos" && e.tipoPermiso !== tipoFiltro) return false;
      if (!q) return true;
      return (
        e.expediente.toLowerCase().includes(q) ||
        e.usuario.toLowerCase().includes(q) ||
        (e.municipio ?? "").toLowerCase().includes(q)
      );
    });
  }, [expedientes, estadoFiltro, tipoFiltro, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  function actualizarFiltro(fn: () => void) {
    fn();
    setPagina(1);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={estadoFiltro}
          onChange={(e) => actualizarFiltro(() => setEstadoFiltro(e.target.value))}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="todos">Todos los estados ({expedientes.length})</option>
          {(Object.keys(ESTADO_LABEL) as EstadoCT[]).map((estado) =>
            conteoPorEstado[estado] ? (
              <option key={estado} value={estado}>
                {ESTADO_LABEL[estado]} ({conteoPorEstado[estado]})
              </option>
            ) : null
          )}
        </select>
        <select
          value={tipoFiltro}
          onChange={(e) => actualizarFiltro(() => setTipoFiltro(e.target.value))}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="todos">Todos los tipos de permiso</option>
          {tiposPermiso.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={busqueda}
          onChange={(e) => actualizarFiltro(() => setBusqueda(e.target.value))}
          placeholder="Buscar por expediente, usuario o municipio…"
          className="w-72 rounded-md border px-3 py-1.5 text-sm"
        />
        <span className="text-xs text-slate-500">
          {filtrados.length} resultados
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Expediente</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Municipio</th>
              <th className="px-3 py-2">Tipo de trámite</th>
              <th className="px-3 py-2">Año</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((e) => {
              const obs = e.observaciones ?? "";
              const truncada = obs.length > 140 ? obs.slice(0, 140) + "…" : obs;
              return (
                <tr key={e.expediente} className="border-t align-top hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{e.expediente}</td>
                  <td className="px-3 py-2">
                    {e.usuario}
                    {e.nit ? <div className="text-xs text-slate-400">NIT {e.nit}</div> : null}
                  </td>
                  <td className="px-3 py-2">{e.municipio ?? "—"}</td>
                  <td className="px-3 py-2">{e.tipoTramite}</td>
                  <td className="px-3 py-2">{e.anio ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[e.estado]}`}>
                      {ESTADO_LABEL[e.estado]}
                    </span>
                  </td>
                  <td className="max-w-xs px-3 py-2 text-xs text-slate-500" title={obs}>
                    {truncada || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={paginaSegura <= 1}
            className="rounded-md border px-3 py-1.5 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-slate-500">
            Página {paginaSegura} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura >= totalPaginas}
            className="rounded-md border px-3 py-1.5 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
