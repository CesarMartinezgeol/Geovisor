import Link from "next/link";
import { getExpedientesCT } from "@/lib/ct/expedientes";
import { ESTADO_LABEL } from "@/lib/ct/types";

const BADGE: Record<string, string> = {
  en_evaluacion: "bg-slate-100 text-slate-700",
  requerido: "bg-amber-100 text-amber-800",
  viable: "bg-green-100 text-green-800",
  negado: "bg-red-100 text-red-800",
  esperando_respuesta: "bg-blue-100 text-blue-800",
  remitido_juridica: "bg-purple-100 text-purple-800",
};

export default function CTPage() {
  const expedientes = getExpedientesCT();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Conceptos Técnicos (CT)</h1>
        <Link
          href="/ct/nuevo"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Generar encabezado F.GA-39
        </Link>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Este tablero es de seguimiento (expediente, tipo de trámite, estado, plazos). La evaluación técnica de
        fondo de cada CT se hace con la skill de Claude Code <code className="rounded bg-slate-100 px-1">ct-cormacarena</code>,
        no aquí.
      </p>

      {expedientes.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-slate-500">
          Todavía no hay expedientes registrados en el tablero.
          <br />
          Cuéntale a Claude Code el expediente y el estado para que los agregue aquí.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Expediente</th>
                <th className="px-3 py-2">Usuario</th>
                <th className="px-3 py-2">Tipo de trámite</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Plazo</th>
                <th className="px-3 py-2">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {expedientes.map((e) => (
                <tr key={e.expediente} className="border-t align-top hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{e.expediente}</td>
                  <td className="px-3 py-2">
                    {e.usuario}
                    {e.nit ? <div className="text-xs text-slate-400">NIT {e.nit}</div> : null}
                  </td>
                  <td className="px-3 py-2">{e.tipoTramite}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[e.estado]}`}>
                      {ESTADO_LABEL[e.estado]}
                    </span>
                  </td>
                  <td className="px-3 py-2">{e.plazoRequerimiento ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{e.observaciones ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
