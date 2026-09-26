import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const OCR_MODEL = process.env.OCR_MODEL || "claude-opus-5";

let clienteCache: Anthropic | null = null;
function cliente() {
  if (!clienteCache) clienteCache = new Anthropic();
  return clienteCache;
}

export interface ArchivoOCR {
  data: Buffer;
  mimeType: string;
}

type MediaTypeImagen = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

function bloqueDocumento(archivo: ArchivoOCR): Anthropic.ContentBlockParam {
  if (archivo.mimeType === "application/pdf") {
    return {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: archivo.data.toString("base64"),
      },
    };
  }
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: archivo.mimeType as MediaTypeImagen,
      data: archivo.data.toString("base64"),
    },
  };
}

const PROMPT_OCR_TEXTO = `Eres un sistema de OCR de alta fidelidad para documentos oficiales colombianos de CORMACARENA (expedientes de agua subterránea), a menudo escaneados con calidad irregular, con sellos, firmas y anotaciones manuscritas.

Transcribe TODO el texto del documento, en español, siguiendo estas reglas:
- Sigue el orden de lectura natural del documento (encabezado, cuerpo, pie de página).
- Conserva la estructura: usa encabezados Markdown (#, ##) para títulos de sección, y tablas Markdown para cualquier dato tabular (coordenadas, niveles, caudales, cuadros de un FUN, etc.).
- Marca las casillas de selección como [x] si están marcadas o [ ] si no.
- Transcribe el texto manuscrito igual que el impreso; si una palabra o número es genuinamente ilegible, escribe [ilegible] en su lugar en vez de adivinar.
- Si el documento tiene varias páginas, separa cada página con la línea "--- página N ---".
- No resumas, no omitas ni "mejores" nada: la transcripción debe ser completa y literal.
- No agregues comentarios tuyos fuera de la transcripción.`;

export async function ocrTexto(archivo: ArchivoOCR): Promise<string> {
  const respuesta = await cliente().messages.create({
    model: OCR_MODEL,
    max_tokens: 16000,
    system: PROMPT_OCR_TEXTO,
    messages: [
      {
        role: "user",
        content: [bloqueDocumento(archivo), { type: "text", text: "Transcribe este documento." }],
      },
    ],
  });

  let texto = "";
  for (const bloque of respuesta.content) {
    if (bloque.type === "text") texto += bloque.text;
  }
  return texto;
}

const CamposCTSchema = z.object({
  conceptoTecnicoNo: z.string().nullable(),
  autoNo: z.string().nullable(),
  expediente: z.string().nullable(),
  interesado: z.string().nullable(),
  localizacion: z.string().nullable(),
  fechaVisita: z.string().nullable(),
  tipoTramiteSugerido: z.string().nullable(),
  asunto: z.string().nullable(),
});

export type CamposCT = z.infer<typeof CamposCTSchema>;

const PROMPT_CAMPOS_CT = `Eres un asistente que extrae datos de encabezado de expedientes de CORMACARENA (Grupo Suelo y Subsuelo) a partir de un FUN, un Auto de inicio u otro documento del expediente, para precargar un formulario. Trabajas sobre documentos escaneados, a veces con mala calidad, sellos o letra manuscrita.

Reglas:
- Usa null en cualquier campo que no aparezca claramente en el documento. No inventes ni completes con suposiciones.
- "conceptoTecnicoNo": número de Concepto Técnico si aparece (ej. "PM-GA.3.44.26").
- "autoNo": identificador completo del auto administrativo, con su fecha si la trae (ej. "Auto PS-GJ.1.2.64.24.1234 del 12 de marzo de 2024").
- "expediente": número de expediente (ej. "3.37.2.24.1234").
- "interesado": nombre del usuario/solicitante/empresa con su identificación (NIT o cédula) tal como aparece.
- "localizacion": predio, vereda y municipio del punto o actividad.
- "fechaVisita": solo si el documento indica una fecha de visita técnica; formato YYYY-MM-DD si se puede convertir con certeza, si no, tal como aparece escrita.
- "tipoTramiteSugerido": una frase corta describiendo el trámite según el documento (ej. "concesión de aguas subterráneas", "prospección", "vertimiento al suelo"), no un código interno.
- "asunto": si el documento trae explícito un asunto u objeto de la solicitud, cópialo; si no, null.`;

export async function extraerCamposCT(archivo: ArchivoOCR): Promise<CamposCT> {
  const respuesta = await cliente().messages.parse({
    model: OCR_MODEL,
    max_tokens: 4096,
    system: PROMPT_CAMPOS_CT,
    messages: [
      {
        role: "user",
        content: [bloqueDocumento(archivo), { type: "text", text: "Extrae los campos de este documento." }],
      },
    ],
    output_config: { format: zodOutputFormat(CamposCTSchema) },
  });

  if (!respuesta.parsed_output) {
    throw new Error("El modelo no devolvió los campos en el formato esperado.");
  }
  return respuesta.parsed_output;
}
