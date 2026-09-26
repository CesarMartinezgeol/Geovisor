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
  "en_tramite",
  "en_evaluacion",
  "requerido",
  "esperando_respuesta",
  "viable",
  "otorgado",
  "negado",
  "archivado",
  "remitido_juridica",
] as const;

export type EstadoCT = (typeof ESTADOS_CT)[number];

export const ESTADO_LABEL: Record<EstadoCT, string> = {
  en_tramite: "En trámite",
  en_evaluacion: "En evaluación",
  requerido: "Requerido (esperando complementación)",
  esperando_respuesta: "Esperando respuesta del usuario",
  viable: "Viable / procede",
  otorgado: "Otorgado (resolución emitida)",
  negado: "Negado",
  archivado: "Archivado (desistimiento u otra causal)",
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
  /** Texto libre: para expedientes nuevos usa uno de TIPOS_TRAMITE; los
   * importados de registros históricos no siempre encajan en esos 9 tipos. */
  tipoTramite: TipoTramite | string;
  /** Tipo de permiso base (concesión, ocupación de cauce, vertimientos...),
   * sin la naturaleza (nuevo/prórroga), útil para filtrar en el tablero. */
  tipoPermiso?: string;
  estado: EstadoCT;
  anio?: number;
  fechaVisita?: string;
  fechaCT?: string;
  plazoRequerimiento?: string;
  observaciones?: string;
  elaboro?: string;
  revisoAprobo?: string;
}
