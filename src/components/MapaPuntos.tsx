"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Punto } from "@/lib/types";
import { estadoPunto, ultimaMedicion } from "@/lib/puntos";

const COLOR_ESTADO: Record<string, string> = {
  ok: "#16a34a",
  alerta: "#d97706",
  critico: "#dc2626",
};

export default function MapaPuntos({ puntos }: { puntos: Punto[] }) {
  const center = useMemo<[number, number]>(() => {
    const conCoords = puntos.filter((p) => p.coordenadas.lat && p.coordenadas.lon);
    if (conCoords.length === 0) return [4.15, -73.6];
    const lat =
      conCoords.reduce((s, p) => s + (p.coordenadas.lat ?? 0), 0) / conCoords.length;
    const lon =
      conCoords.reduce((s, p) => s + (p.coordenadas.lon ?? 0), 0) / conCoords.length;
    return [lat, lon];
  }, [puntos]);

  return (
    <MapContainer center={center} zoom={9} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {puntos.map((p) => {
        if (!p.coordenadas.lat || !p.coordenadas.lon) return null;
        const estado = estadoPunto(p);
        const ultima = ultimaMedicion(p);
        return (
          <CircleMarker
            key={p.id}
            center={[p.coordenadas.lat, p.coordenadas.lon]}
            radius={7}
            pathOptions={{
              color: COLOR_ESTADO[estado],
              fillColor: COLOR_ESTADO[estado],
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">
                  {p.id} · {p.red === "Nacional" ? "Red Nacional" : "Red Regional"}
                </p>
                <p>{p.usuario}</p>
                <p className="text-slate-500">{p.municipio}</p>
                {ultima && (
                  <p className="mt-1">
                    Último monitoreo: {ultima.anio}
                    {ultima.nivelEstatico_m ? ` · N.E. ${ultima.nivelEstatico_m} m` : ""}
                  </p>
                )}
                <Link
                  href={`/puntos/${p.id}`}
                  className="mt-2 inline-block text-emerald-700 underline"
                >
                  Ver ficha completa →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
