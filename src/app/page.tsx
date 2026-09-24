import MapaPuntosClient from "@/components/MapaPuntosClient";
import { getPuntos, estadoPunto } from "@/lib/puntos";

export default function Home() {
  const puntos = getPuntos();
  const conteo = { ok: 0, alerta: 0, critico: 0 } as Record<string, number>;
  for (const p of puntos) conteo[estadoPunto(p)]++;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">
            {puntos.length} puntos de monitoreo (8 Red Nacional + {puntos.length - 8} Red Regional)
          </span>
          <Leyenda color="#16a34a" label={`Al día (${conteo.ok})`} />
          <Leyenda color="#d97706" label={`Con pendientes (${conteo.alerta})`} />
          <Leyenda color="#dc2626" label={`Requiere atención (${conteo.critico})`} />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <MapaPuntosClient puntos={puntos} />
      </div>
    </div>
  );
}

function Leyenda({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
