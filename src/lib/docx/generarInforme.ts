import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  ShadingType,
} from "docx";
import { Punto } from "../types";
import { PARAMETROS_FISICOQUIMICOS, PARAMETROS_MICROBIOLOGICOS } from "../types";
import { fueraDeRango } from "../limites";
import * as texto from "./antecedentes";

export interface DatosInforme {
  fechaVisita: string;
  descripcionVisita: string;
  estadoPermisos: string;
  conclusionesAdicionales: string;
  proyecto: string;
}

function parrafos(texto: string): Paragraph[] {
  return texto
    .split("\n\n")
    .map((t) => new Paragraph({ text: t.trim(), spacing: { after: 200 } }));
}

function celda(text: string, opts: { bold?: boolean; shade?: string; width?: number } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shade
      ? { type: ShadingType.CLEAR, color: "auto", fill: opts.shade }
      : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.bold })],
      }),
    ],
  });
}

function filaEtiquetaValor(label: string, value: string) {
  return new TableRow({
    children: [celda(label, { bold: true, shade: "F1F5F9", width: 35 }), celda(value || "—", { width: 65 })],
  });
}

function tablaFichaTecnica(p: Punto): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      filaEtiquetaValor("Expediente", p.expediente ?? ""),
      filaEtiquetaValor("Usuario", p.usuario ?? ""),
      filaEtiquetaValor("Municipio", p.municipio ?? ""),
      filaEtiquetaValor("Código SAP", p.codigoSap ?? ""),
      filaEtiquetaValor("Provincia hidrogeológica", p.provinciaHidrogeologica ?? ""),
      filaEtiquetaValor("Sistema acuífero", p.sistemaAcuifero ?? ""),
      filaEtiquetaValor("Tipo de captación", p.tipoCaptacion ?? ""),
      filaEtiquetaValor("Profundidad (m)", p.profundidad_m?.toString() ?? ""),
      filaEtiquetaValor("Cota (m.s.n.m.)", p.cota_msnm?.toString() ?? ""),
      filaEtiquetaValor(
        "Coordenadas (Norte / Este - Origen Nacional)",
        `${p.coordenadas.norteOrigenNacional ?? "—"} / ${p.coordenadas.esteOrigenNacional ?? "—"}`
      ),
      filaEtiquetaValor(
        "Coordenadas geográficas (WGS84)",
        p.coordenadas.lat && p.coordenadas.lon
          ? `${p.coordenadas.lat.toFixed(6)}, ${p.coordenadas.lon.toFixed(6)}`
          : "—"
      ),
      filaEtiquetaValor("Resolución", p.resolucion ?? ""),
      filaEtiquetaValor("Caudal otorgado", p.caudalOtorgado ?? ""),
      filaEtiquetaValor("Vigencia", p.vigencia?.toString() ?? ""),
      filaEtiquetaValor(
        "Infraestructura (llave, medidor, caseta, sist. niveles, cubierta, diseño)",
        [
          p.llavePaso === true ? "Llave ✓" : "Llave ✗",
          p.medidorCaudal === true ? "Medidor ✓" : "Medidor ✗",
          p.casetaProteccion === true ? "Caseta ✓" : "Caseta ✗",
          p.sistemaMedicionNiveles === true ? "Sist. niveles ✓" : "Sist. niveles ✗",
          p.cubiertaSanitaria === true ? "Cubierta ✓" : "Cubierta ✗",
          p.disenoPozo === true ? "Diseño ✓" : "Diseño ✗",
        ].join(" · ")
      ),
    ],
  });
}

function tablaHistorialNiveles(p: Punto): Table {
  const header = new TableRow({
    children: [
      celda("Año", { bold: true, shade: "F1F5F9" }),
      celda("Nivel estático (m)", { bold: true, shade: "F1F5F9" }),
      celda("Fecha de muestreo", { bold: true, shade: "F1F5F9" }),
    ],
  });
  const filas = p.mediciones.map(
    (m) =>
      new TableRow({
        children: [
          celda(String(m.anio)),
          celda(m.nivelEstatico_m !== undefined && m.nivelEstatico_m !== null ? String(m.nivelEstatico_m) : "—"),
          celda(m.fechaTomaMuestra ? String(m.fechaTomaMuestra) : "—"),
        ],
      })
  );
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...filas] });
}

function tablaResultados(p: Punto, titulo: string, lista: { key: string; label: string; unidad: string }[]): (Paragraph | Table)[] {
  const anios = p.mediciones.map((m) => m.anio);
  const filasParametros = lista.filter((param) =>
    p.mediciones.some((m) => m[param.key] !== undefined && m[param.key] !== null)
  );
  if (filasParametros.length === 0) return [];

  const header = new TableRow({
    children: [
      celda("Parámetro", { bold: true, shade: "F1F5F9" }),
      celda("Unidad", { bold: true, shade: "F1F5F9" }),
      ...anios.map((a) => celda(String(a), { bold: true, shade: "F1F5F9" })),
    ],
  });

  const filas = filasParametros.map((param) => {
    return new TableRow({
      children: [
        celda(param.label),
        celda(param.unidad),
        ...p.mediciones.map((m) => {
          const v = m[param.key];
          const num = typeof v === "number" ? v : null;
          const fuera = fueraDeRango(param.key, num);
          return celda(v !== undefined && v !== null ? String(v) : "—", { bold: fuera });
        }),
      ],
    });
  });

  return [
    new Paragraph({ text: titulo, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...filas] }),
  ];
}

export async function generarInformeDocx(p: Punto, datos: DatosInforme): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "SUBDIRECCIÓN DE GESTIÓN AMBIENTAL", bold: true })],
          }),
          new Paragraph({ children: [new TextRun({ text: "GRUPO SUELO Y SUBSUELO", bold: true })] }),
          new Paragraph({
            text: `INFORME INDIVIDUAL DE MONITOREO DEL RECURSO HÍDRICO SUBTERRÁNEO DEL DEPARTAMENTO DEL META`,
            heading: HeadingLevel.TITLE,
            spacing: { before: 200, after: 300 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              filaEtiquetaValor("Expediente No.", p.expediente ?? ""),
              filaEtiquetaValor("ID", p.id),
              filaEtiquetaValor(
                "Asunto",
                `Visita de monitoreo de aguas subterráneas en el marco del Plan de Acción Cuatrienal 2024–2027, Programa 3203: "Gestión Integral del Recurso Hídrico" – Proyecto 8. RED REGIONAL DE MONITOREO DEL RECURSO HÍDRICO SUBTERRÁNEO DEL DEPARTAMENTO DEL META - RRMHS`
              ),
              filaEtiquetaValor("Usuario", p.usuario ?? ""),
              filaEtiquetaValor("Municipio", p.municipio ?? ""),
              filaEtiquetaValor("Fecha de la visita", datos.fechaVisita || "—"),
            ],
          }),

          new Paragraph({ text: "OBJETO Y RAZÓN DE ESTUDIO", heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }),
          ...parrafos(texto.OBJETO_Y_RAZON),

          new Paragraph({ text: "ANTECEDENTES", heading: HeadingLevel.HEADING_1, spacing: { before: 200 } }),
          ...parrafos(texto.ANTECEDENTES),

          new Paragraph({ text: `PUNTO DE MONITOREO ${p.id}`, heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }),

          new Paragraph({ text: "Ficha técnica", heading: HeadingLevel.HEADING_2, spacing: { before: 150 } }),
          tablaFichaTecnica(p),

          new Paragraph({ text: "Diseño del pozo profundo", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
          ...parrafos(texto.DISENO_POZO_INTRO),
          new Paragraph({
            text: "[Insertar figura del diseño del pozo, si está disponible en el expediente.]",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "Historial y cantidad de agua", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
          ...parrafos(texto.HISTORIAL_INTRO),
          tablaHistorialNiveles(p),

          new Paragraph({
            text: "MONITOREO DE CALIDAD DE AGUA SUBTERRÁNEA",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300 },
          }),
          ...parrafos(texto.CALIDAD_INTRO),

          new Paragraph({ text: "Medición de nivel estático", heading: HeadingLevel.HEADING_2, spacing: { before: 150 } }),
          ...parrafos(texto.MEDICION_NIVEL_ESTATICO),

          new Paragraph({ text: "Recolección de muestras para laboratorio", heading: HeadingLevel.HEADING_2, spacing: { before: 150 } }),
          ...parrafos(texto.RECOLECCION_MUESTRAS),

          new Paragraph({ text: "Reporte de resultados de los parámetros analizados", heading: HeadingLevel.HEADING_2, spacing: { before: 150 } }),
          ...tablaResultados(p, "Análisis fisicoquímico", PARAMETROS_FISICOQUIMICOS),
          ...tablaResultados(p, "Análisis microbiológico", PARAMETROS_MICROBIOLOGICOS),
          new Paragraph({
            children: [new TextRun({ text: texto.NOTA_LIMITES, italics: true })],
            spacing: { before: 150, after: 200 },
          }),

          new Paragraph({ text: "Registro fotográfico", heading: HeadingLevel.HEADING_2, spacing: { before: 150 } }),
          new Paragraph({ text: "[Insertar fotografías de la visita de monitoreo.]", spacing: { after: 200 } }),

          new Paragraph({
            text: `Descripción de la visita`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150 },
          }),
          new Paragraph({ text: datos.descripcionVisita || "[Describir la visita realizada.]", spacing: { after: 200 } }),

          new Paragraph({ text: "ESTADO DE LOS PERMISOS AMBIENTALES", heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }),
          new Paragraph({
            text:
              datos.estadoPermisos ||
              "[Revisar el expediente y describir el estado del trámite: vigente, en prórroga, vencido, en trámite sancionatorio, etc.]",
            spacing: { after: 200 },
          }),

          new Paragraph({ text: "CONCLUSIONES", heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }),
          new Paragraph({
            text: "Con base en la visita de monitoreo y la revisión documental del expediente del cual hace parte el presente punto de monitoreo, se concluye lo siguiente:",
            spacing: { after: 150 },
          }),
          ...(datos.conclusionesAdicionales || "[Agregar conclusiones específicas de la visita.]")
            .split("\n")
            .filter((l) => l.trim())
            .map((l) => new Paragraph({ text: l.trim(), bullet: { level: 0 }, spacing: { after: 100 } })),
          new Paragraph({
            children: [
              new TextRun({
                text: `EL PRESENTE INFORME SE EMITE DESDE EL PUNTO DE VISTA TÉCNICO Y AMBIENTAL, TENIENDO EN CUENTA LA DOCUMENTACIÓN PRESENTE EN EL EXPEDIENTE No. ${
                  p.expediente ?? ""
                } Y LO EVIDENCIADO EN LA VISITA DE MONITOREO DE CALIDAD Y CANTIDAD DE AGUAS SUBTERRÁNEAS.`,
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 400 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [celda("Proyectó:", { bold: true }), celda("Revisó:", { bold: true })],
              }),
              new TableRow({
                children: [
                  celda(datos.proyecto || "[Nombre - Cargo]\nSubdirección de Gestión Ambiental\nGrupo Suelo y Subsuelo"),
                  celda("[Nombre - Cargo]\nSubdirección de Gestión Ambiental\nGrupo Suelo y Subsuelo"),
                ],
              }),
              new TableRow({ children: [celda("Aprobó:", { bold: true }), celda("")] }),
              new TableRow({
                children: [
                  celda("[Nombre - Cargo]\nSubdirección de Gestión Ambiental\nGrupo Suelo y Subsuelo"),
                  celda(""),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
