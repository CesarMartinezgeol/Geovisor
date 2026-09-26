import { NextRequest, NextResponse } from "next/server";
import { generarCTDocx } from "@/lib/docx/generarCT";
import { TIPOS_TRAMITE, TipoTramite } from "@/lib/ct/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tipoTramite = TIPOS_TRAMITE.includes(body.tipoTramite) ? (body.tipoTramite as TipoTramite) : TIPOS_TRAMITE[0];

  const buffer = await generarCTDocx({
    conceptoTecnicoNo: body.conceptoTecnicoNo ?? "",
    autoNo: body.autoNo ?? "",
    expediente: body.expediente ?? "",
    asunto: body.asunto ?? "",
    interesado: body.interesado ?? "",
    localizacion: body.localizacion ?? "",
    fechaVisita: body.fechaVisita ?? "",
    tipoTramite,
    elaboro: body.elaboro ?? "",
    revisoAprobo: body.revisoAprobo ?? "",
  });

  const nombre = (body.expediente || "CT").toString().replace(/[^\w.-]+/g, "_");
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="CT_${nombre}.docx"`,
    },
  });
}
