export interface Medicion {
  anio: number;
  fechaTomaMuestra?: string | number | null;
  fechaMedicionNivel?: string | number | null;
  nivelEstatico_m?: number | null;
  revisionInformesDisenos?: string | null;
  comentariosPrevios?: string | null;
  [parametro: string]: string | number | null | undefined;
}

export interface Coordenadas {
  norteOrigenNacional: string | number | null;
  esteOrigenNacional: string | number | null;
  lat: number | null;
  lon: number | null;
}

export interface Punto {
  id: string;
  red: "Nacional" | "Regional";
  expediente?: string;
  usuario?: string;
  contacto?: string;
  correoElectronico?: string;
  resolucion?: string;
  caudalOtorgado?: string;
  vigencia?: number | string;
  municipio?: string;
  veredaBarrio?: string;
  provinciaHidrogeologica?: string;
  sistemaAcuifero?: string;
  zonaHidrogeologica?: string;
  tipoCaptacion?: string;
  codigoSap?: string;
  profundidad_m?: number;
  cota_msnm?: number;
  ruta?: number;
  profesionalResponsableRuta?: string;
  nivelacionGeoreferenciacion?: boolean | string | null;
  disenoPozo?: boolean | string | null;
  llavePaso?: boolean | string | null;
  medidorCaudal?: boolean | string | null;
  casetaProteccion?: boolean | string | null;
  sistemaMedicionNiveles?: boolean | string | null;
  cubiertaSanitaria?: boolean | string | null;
  coordenadas: Coordenadas;
  mediciones: Medicion[];
}

export const INFRA_KEYS: { key: keyof Punto; label: string }[] = [
  { key: "disenoPozo", label: "Diseño de pozo" },
  { key: "llavePaso", label: "Llave de paso" },
  { key: "medidorCaudal", label: "Medidor de caudal" },
  { key: "casetaProteccion", label: "Caseta de protección" },
  { key: "sistemaMedicionNiveles", label: "Sistema de medición de niveles" },
  { key: "cubiertaSanitaria", label: "Cubierta sanitaria" },
  { key: "nivelacionGeoreferenciacion", label: "Nivelación y georreferenciación" },
];

export const PARAMETROS_FISICOQUIMICOS: { key: string; label: string; unidad: string }[] = [
  { key: "alcalinidadTotal", label: "Alcalinidad Total", unidad: "mg CaCO3/L" },
  { key: "aluminioTotal", label: "Aluminio Total", unidad: "mg Al/L" },
  { key: "amonio", label: "Amonio", unidad: "mg NH4+/L" },
  { key: "arsenicoTotal", label: "Arsénico Total", unidad: "mg As/L" },
  { key: "bicarbonatos", label: "Bicarbonatos", unidad: "mg CaCO3/L" },
  { key: "cadmioTotal", label: "Cadmio Total", unidad: "mg Cd/L" },
  { key: "calcio", label: "Calcio", unidad: "mg Ca/L" },
  { key: "carbonatos", label: "Carbonatos", unidad: "mg CO3/L" },
  { key: "cloroResidualLibre", label: "Cloro Residual Libre", unidad: "mg Cl2/L" },
  { key: "cloruros", label: "Cloruros", unidad: "mg Cl-/L" },
  { key: "cobreTotal", label: "Cobre Total", unidad: "mg Cu/L" },
  { key: "colorAparente", label: "Color Aparente", unidad: "UPC" },
  { key: "conductividad", label: "Conductividad Eléctrica", unidad: "µS/cm" },
  { key: "carbonoOrganicoTotal", label: "Carbono Orgánico Total", unidad: "mg COT/L" },
  { key: "cromoTotal", label: "Cromo Total", unidad: "mg Cr/L" },
  { key: "durezaTotal", label: "Dureza Total", unidad: "mg CaCO3/L" },
  { key: "fenolesTotales", label: "Fenoles Totales", unidad: "mg Fenol/L" },
  { key: "fluoruros", label: "Fluoruros", unidad: "mg F-/L" },
  { key: "fosfatos", label: "Fosfatos", unidad: "mg PO4/L" },
  { key: "grasasYAceites", label: "Grasas y Aceites", unidad: "mg/L" },
  { key: "hidrocarburosTotales", label: "Hidrocarburos Totales", unidad: "mg/L" },
  { key: "hierroTotal", label: "Hierro Total", unidad: "mg Fe/L" },
  { key: "magnesio", label: "Magnesio", unidad: "mg Mg/L" },
  { key: "manganesoTotal", label: "Manganeso Total", unidad: "mg Mn/L" },
  { key: "mercurioTotal", label: "Mercurio Total", unidad: "mg Hg/L" },
  { key: "molibdenoTotal", label: "Molibdeno Total", unidad: "mg Mo/L" },
  { key: "nitratos", label: "Nitratos", unidad: "mg N-NO3/L" },
  { key: "nitritos", label: "Nitritos", unidad: "mg N-NO2/L" },
  { key: "nitrogenoAmoniacal", label: "Nitrógeno Amoniacal", unidad: "mg N-NH3/L" },
  { key: "oxigenoDisuelto", label: "Oxígeno Disuelto", unidad: "mg O2/L" },
  { key: "ph", label: "pH", unidad: "UN" },
  { key: "plomoTotal", label: "Plomo Total", unidad: "mg Pb/L" },
  { key: "potasioDisuelto", label: "Potasio Disuelto", unidad: "mg K/L" },
  { key: "sodioDisuelto", label: "Sodio Disuelto", unidad: "mg Na/L" },
  { key: "solidosDisueltosTotales", label: "Sólidos Disueltos Totales", unidad: "mg/L" },
  { key: "sulfatos", label: "Sulfatos", unidad: "mg SO4/L" },
  { key: "sulfuros", label: "Sulfuros", unidad: "mg S2-/L" },
  { key: "temperatura", label: "Temperatura", unidad: "°C" },
  { key: "turbidez", label: "Turbidez", unidad: "NTU" },
  { key: "zincTotal", label: "Zinc Total", unidad: "mg Zn/L" },
];

export const PARAMETROS_MICROBIOLOGICOS: { key: string; label: string; unidad: string }[] = [
  { key: "coliformesTotales", label: "Coliformes Totales", unidad: "NMP/100mL" },
  { key: "eColi", label: "Escherichia Coli", unidad: "NMP/100mL" },
];
