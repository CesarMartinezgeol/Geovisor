import Link from "next/link";
import { getPuntos, estadoPunto, ultimaMedicion, faltantesInfraestructura } from "@/lib/puntos";

const BADGE: Record<string, string> = {
  ok: "bg-green-100 text-green-800",
  alerta: "bg-amber-100 text-amber-800",
  critico: "bg-red-100 text-red-800",
};

export default function PuntosPage() {
  const puntos = getPuntos();

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Puntos de monitoreo (RRMRHS)</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Red</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Municipio</th>
              <th className="px-3 py-2">Expediente</th>
              <th className="px-3 py-2">Último monitoreo</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Pendientes de infraestructura</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {puntos.map((p) => {
              const ultima = ultimaMedicion(p);
              const estado = estadoPunto(p);
              const faltantes = faltantesInfraestructura(p);
              return (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{p.id}</td>
                  <td className="px-3 py-2">{p.red}</td>
                  <td className="px-3 py-2">{p.usuario}</td>
                  <td className="px-3 py-2">{p.municipio}</td>
                  <td className="px-3 py-2">{p.expediente}</td>
                  <td className="px-3 py-2">{ultima ? ultima.anio : "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[estado]}`}>
                      {estado === "ok" ? "Al día" : estado === "alerta" ? "Pendientes" : "Atención"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {faltantes.length ? faltantes.join(", ") : "Ninguno"}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/puntos/${p.id}`} className="text-emerald-700 underline">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
