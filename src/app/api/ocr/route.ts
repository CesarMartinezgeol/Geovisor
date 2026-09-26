import { NextRequest, NextResponse } from "next/server";
import { extraerCamposCT, ocrTexto } from "@/lib/ocr/claude";

const TIPOS_PERMITIDOS = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

const TAMANO_MAXIMO = 32 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar ANTHROPIC_API_KEY en el servidor." },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const archivo = form.get("archivo");
  const modo = form.get("modo") === "campos-ct" ? "campos-ct" : "texto";

  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo a procesar." }, { status: 400 });
  }
  if (!TIPOS_PERMITIDOS.has(archivo.type)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usa PDF, PNG, JPG o WEBP." },
      { status: 400 },
    );
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return NextResponse.json({ error: "El archivo supera el límite de 32 MB." }, { status: 400 });
  }

  const data = Buffer.from(await archivo.arrayBuffer());

  try {
    if (modo === "campos-ct") {
      const campos = await extraerCamposCT({ data, mimeType: archivo.type });
      return NextResponse.json({ campos });
    }
    const texto = await ocrTexto({ data, mimeType: archivo.type });
    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Error de OCR:", err);
    return NextResponse.json({ error: "No se pudo procesar el documento con OCR." }, { status: 502 });
  }
}
