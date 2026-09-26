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
import { TipoTramite } from "../ct/types";
import { ESTRUCTURA_POR_TRAMITE } from "./estructuraCT";

export interface DatosCT {
  conceptoTecnicoNo: string;
  autoNo: string;
  expediente: string;
  asunto: string;
  interesado: string;
  localizacion: string;
  fechaVisita: string;
  tipoTramite: TipoTramite;
  elaboro: string;
  revisoAprobo: string;
}

function celda(text: string, opts: { bold?: boolean; shade?: string; width?: number } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shade ? { type: ShadingType.CLEAR, color: "auto", fill: opts.shade } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold: opts.bold })] })],
  });
}

function filaEtiquetaValor(label: string, value: string, width1 = 30) {
  return new TableRow({
    children: [
      celda(label, { bold: true, shade: "F1F5F9", width: width1 }),
      celda(value || "—", { width: 100 - width1 }),
    ],
  });
}

export async function generarCTDocx(datos: DatosCT): Promise<Buffer> {
  const secciones = ESTRUCTURA_POR_TRAMITE[datos.tipoTramite];

  const cuerpoSecciones = secciones.flatMap((titulo) => {
    const esSubseccion = titulo.startsWith("  ");
    return [
      new Paragraph({
        text: titulo.trim(),
        heading: esSubseccion ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1,
        spacing: { before: esSubseccion ? 150 : 300 },
      }),
      new Paragraph({ text: "[Contenido pendiente de redactar.]", spacing: { after: 100 } }),
    ];
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  celda("", { width: 60 }),
                  celda("Código: F-GA-39\nVersión: 01", { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  celda("CONCEPTO TÉCNICO", { bold: true, width: 60 }),
                  celda("", { width: 40 }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 200 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  celda("DATOS GENERALES", { bold: true, shade: "D1FAE5", width: 100 }),
                ],
              }),
              filaEtiquetaValor("CONCEPTO TÉCNICO No.", datos.conceptoTecnicoNo),
              filaEtiquetaValor("AUTO No.", datos.autoNo),
              filaEtiquetaValor("EXPEDIENTE No.", datos.expediente),
              filaEtiquetaValor("ASUNTO", datos.asunto),
              filaEtiquetaValor("INTERESADO", datos.interesado),
              filaEtiquetaValor("LOCALIZACIÓN", datos.localizacion),
              filaEtiquetaValor("FECHA DE VISITA", datos.fechaVisita),
              filaEtiquetaValor("TIPO DE TRÁMITE", datos.tipoTramite),
            ],
          }),

          ...cuerpoSecciones,

          new Paragraph({
            children: [
              new TextRun({
                text:
                  "El concepto técnico que se emite no compromete la responsabilidad de Cormacarena por sí sola, ni serán de obligatorio cumplimiento o ejecución sin que medie acto administrativo que lo apruebe. Por el contenido de este documento se hacen responsables en los términos de la Ley 1952 de 2019, los funcionarios y contratistas de Cormacarena que intervengan en su elaboración, revisión y aprobación.",
                italics: true,
              }),
            ],
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            text: "Remítase este concepto técnico a la Oficina Jurídica para que se profiera el Acto Administrativo correspondiente.",
            spacing: { after: 400 },
          }),

          new Paragraph({ text: "Concepto técnico elaborado por:", spacing: { before: 200 } }),
          new Paragraph({ text: datos.elaboro || "[Nombre - Cargo - Grupo Suelo y Subsuelo]", spacing: { after: 300 } }),
          new Paragraph({ text: "Revisó y aprobó:" }),
          new Paragraph({ text: datos.revisoAprobo || "[Nombre - Cargo - Grupo Suelo y Subsuelo]" }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
