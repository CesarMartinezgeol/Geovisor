import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPunto,
  getPuntos,
  faltantesInfraestructura,
} from "@/lib/puntos";
import {
  INFRA_KEYS,
  PARAMETROS_FISICOQUIMICOS,
  PARAMETROS_MICROBIOLOGICOS,
} from "@/lib/types";
import { fueraDeRango, limiteDe } from "@/lib/limites";

export function generateStaticParams() {
  return getPuntos().map((p) => ({ id: p.id }));
}

export default async function PuntoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getPunto(id);
  if (!p) notFound();

  const anios = p.mediciones.map((m) => m.anio);
  const faltantes = faltantesInfraestructura(p);
  const grupos = [
    { titulo: "Análisis fisicoquímico", params: PARAMETROS_FISICOQUIMICOS },
    { titulo: "Análisis microbiológico", params: PARAMETROS_MICROBIOLOGICOS },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {p.id} · {p.usuario}
          </h1>
          <p className="text-slate-500">
            {p.municipio} · Expediente {p.expediente} · Red{" "}
            {p.red === "Nacional" ? "Nacional (RN)" : "Regional (RC)"}
          </p>
        </div>
        <Link
          href={`/informes/${p.id}`}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Generar borrador de informe
        </Link>
      </div>

      {faltantes.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Pendiente en campo: {faltantes.join(", ")}.
        </div>
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Dato label="Código SAP" valor={p.codigoSap} />
        <Dato label="Tipo de captación" valor={p.tipoCaptacion} />
        <Dato label="Profundidad" valor={p.profundidad_m ? `${p.profundidad_m} m` : undefined} />
        <Dato label="Cota" valor={p.cota_msnm ? `${p.cota_msnm} m.s.n.m.` : undefined} />
        <Dato label="Sistema acuífero" valor={p.sistemaAcuifero} />
        <Dato label="Provincia hidrogeológica" valor={p.provinciaHidrogeologica} />
        <Dato label="Resolución" valor={p.resolucion} />
        <Dato label="Caudal otorgado" valor={p.caudalOtorgado} />
        <Dato label="Vigencia" valor={p.vigencia?.toString()} />
        <Dato label="Contacto" valor={p.contacto} />
        <Dato label="Correo" valor={p.correoElectronico} />
        <Dato
          label="Coordenadas (WGS84)"
          valor={
            p.coordenadas.lat && p.coordenadas.lon
              ? `${p.coordenadas.lat.toFixed(6)}, ${p.coordenadas.lon.toFixed(6)}`
              : undefined
          }
        />
        <Dato label="Ruta" valor={p.ruta?.toString()} />
        <Dato label="Profesional responsable" valor={p.profesionalResponsableRuta} />
      </section>

      <section className="mb-6 rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Infraestructura del punto</h2>
        <div className="flex flex-wrap gap-2">
          {INFRA_KEYS.map(({ key, label }) => {
            const v = p[key];
            const ok = v === true;
            return (
              <span
                key={String(key)}
                className={`rounded-full px-3 py-1 text-xs ${
                  ok
                    ? "bg-green-100 text-green-800"
                    : v === false
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {ok ? "✓" : v === false ? "✗" : "?"} {label}
              </span>
            );
          })}
        </div>
      </section>

      {p.mediciones.length > 0 && (
        <section className="mb-6 rounded-lg border bg-white p-4">
          <h2 className="mb-1 font-semibold">Nivel estático histórico</h2>
          <p className="mb-3 text-xs text-slate-500">Profundidad del agua bajo el terreno, por año.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1 pr-4">Año</th>
                <th className="py-1 pr-4">Nivel estático (m)</th>
                <th className="py-1">Fecha de muestreo</th>
              </tr>
            </thead>
            <tbody>
              {p.mediciones.map((m) => (
                <tr key={m.anio} className="border-t">
                  <td className="py-1 pr-4 font-medium">{m.anio}</td>
                  <td className="py-1 pr-4">{m.nivelEstatico_m ?? "—"}</td>
                  <td className="py-1">{String(m.fechaTomaMuestra ?? "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {grupos.map(({ titulo, params: lista }) => (
        <section key={titulo} className="mb-6 overflow-x-auto rounded-lg border bg-white p-4">
          <h2 className="mb-1 font-semibold">{titulo}</h2>
          <p className="mb-3 text-xs text-slate-500">
            En <span className="font-semibold text-red-600">rojo</span>: valores fuera del límite de
            referencia cargado (Res. 2115/2007 — verificar antes de usar en un informe oficial).
          </p>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1 pr-4">Parámetro</th>
                <th className="py-1 pr-4">Límite ref.</th>
                {anios.map((a) => (
                  <th key={a} className="py-1 pr-4">
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map(({ key, label, unidad }) => {
                const limite = limiteDe(key);
                const algunValor = p.mediciones.some((m) => m[key] !== undefined && m[key] !== null);
                if (!algunValor) return null;
                return (
                  <tr key={key} className="border-t">
                    <td className="py-1 pr-4">
                      {label} <span className="text-slate-400">({unidad})</span>
                    </td>
                    <td className="py-1 pr-4 text-slate-500">
                      {limite
                        ? `${limite.min !== undefined ? `min ${limite.min}` : ""}${
                            limite.min !== undefined && limite.max !== undefined ? " / " : ""
                          }${limite.max !== undefined ? `max ${limite.max}` : ""}`
                        : "—"}
                    </td>
                    {p.mediciones.map((m) => {
                      const v = m[key];
                      const num = typeof v === "number" ? v : null;
                      const fuera = fueraDeRango(key, num);
                      return (
                        <td
                          key={m.anio}
                          className={`py-1 pr-4 ${fuera ? "font-semibold text-red-600" : ""}`}
                        >
                          {v ?? "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor?: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm">{valor || valor === 0 ? valor : "—"}</p>
    </div>
  );
}
