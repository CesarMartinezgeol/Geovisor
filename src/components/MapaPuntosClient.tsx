"use client";

import dynamic from "next/dynamic";
import { Punto } from "@/lib/types";

const MapaPuntos = dynamic(() => import("./MapaPuntos"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-slate-400">
      Cargando mapa…
    </div>
  ),
});

export default function MapaPuntosClient({ puntos }: { puntos: Punto[] }) {
  return <MapaPuntos puntos={puntos} />;
}
