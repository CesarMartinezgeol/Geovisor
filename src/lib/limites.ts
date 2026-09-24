import limitesData from "../../data/rrmrhs/limites-res-2115-2007.json";

export interface Limite {
  min?: number;
  max?: number;
  unidad: string;
}

const limites = limitesData.limites as Record<string, Limite>;

export function limiteDe(parametro: string): Limite | undefined {
  return limites[parametro];
}

export function fueraDeRango(parametro: string, valor: number | null | undefined): boolean {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return false;
  const lim = limites[parametro];
  if (!lim) return false;
  if (lim.min !== undefined && valor < lim.min) return true;
  if (lim.max !== undefined && valor > lim.max) return true;
  return false;
}
