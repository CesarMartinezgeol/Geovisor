import puntosData from "../../data/rrmrhs/puntos.json";
import { INFRA_KEYS, Punto } from "./types";

export function getPuntos(): Punto[] {
  return puntosData as unknown as Punto[];
}

export function getPunto(id: string): Punto | undefined {
  return getPuntos().find((p) => p.id.toUpperCase() === id.toUpperCase());
}

export function ultimaMedicion(p: Punto) {
  if (!p.mediciones || p.mediciones.length === 0) return undefined;
  return p.mediciones[p.mediciones.length - 1];
}

/** Cuenta cuántos elementos de infraestructura faltan (false o null/desconocido). */
export function faltantesInfraestructura(p: Punto): string[] {
  return INFRA_KEYS.filter(({ key }) => p[key] !== true).map(({ label }) => label);
}

export function estadoPunto(p: Punto): "ok" | "alerta" | "critico" {
  const faltantes = faltantesInfraestructura(p).length;
  const ultima = ultimaMedicion(p);
  const sinMonitoreoReciente = !ultima || ultima.anio < new Date().getFullYear() - 1;
  if (faltantes === 0 && !sinMonitoreoReciente) return "ok";
  if (faltantes <= 2 && !sinMonitoreoReciente) return "alerta";
  return "critico";
}

export function municipios(): string[] {
  const set = new Set<string>();
  for (const p of getPuntos()) {
    if (p.municipio) set.add(p.municipio.trim());
  }
  return Array.from(set).sort();
}
