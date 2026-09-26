export const TIPOS_TRAMITE = [
  "Inicio concesión de aguas subterráneas (con vertimiento al suelo)",
  "Inicio concesión de aguas subterráneas (sin vertimiento)",
  "Inicio concesión aljibe + vertimiento al suelo",
  "Prospección / exploración",
  "Evaluación de requerimientos (EvReq)",
  "Control y seguimiento (CyS)",
  "Pre-visita (concepto de gabinete)",
  "Práctica de pruebas (sancionatorio)",
  "Recurso de reposición",
] as const;

export type TipoTramite = (typeof TIPOS_TRAMITE)[number];

export const ESTADOS_CT = [
  "en_evaluacion",
  "requerido",
  "viable",
  "negado",
  "esperando_respuesta",
  "remitido_juridica",
] as const;

export type EstadoCT = (typeof ESTADOS_CT)[number];

export const ESTADO_LABEL: Record<EstadoCT, string> = {
  en_evaluacion: "En evaluación",
  requerido: "Requerido (esperando complementación)",
  viable: "Viable / procede",
  negado: "Negado",
  esperando_respuesta: "Esperando respuesta del usuario",
  remitido_juridica: "Remitido a Jurídica",
};

export interface ExpedienteCT {
  expediente: string;
  conceptoTecnicoNo?: string;
  autoNo?: string;
  usuario: string;
  nit?: string;
  municipio?: string;
  localizacion?: string;
  tipoTramite: TipoTramite;
  estado: EstadoCT;
  fechaVisita?: string;
  fechaCT?: string;
  plazoRequerimiento?: string;
  observaciones?: string;
  elaboro?: string;
  revisoAprobo?: string;
}
