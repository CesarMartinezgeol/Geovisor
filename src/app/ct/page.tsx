import Link from "next/link";
import { getExpedientesCT } from "@/lib/ct/expedientes";
import CTTable from "./CTTable";

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
        <CTTable expedientes={expedientes} />
      )}
    </div>
  );
}
