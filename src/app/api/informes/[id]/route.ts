import { NextRequest, NextResponse } from "next/server";
import { getPunto } from "@/lib/puntos";
import { generarInformeDocx } from "@/lib/docx/generarInforme";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const punto = getPunto(id);
  if (!punto) {
    return NextResponse.json({ error: "Punto no encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const buffer = await generarInformeDocx(punto, {
    fechaVisita: body.fechaVisita ?? "",
    descripcionVisita: body.descripcionVisita ?? "",
    estadoPermisos: body.estadoPermisos ?? "",
    conclusionesAdicionales: body.conclusionesAdicionales ?? "",
    proyecto: body.proyecto ?? "",
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${punto.id}_Informe_Exp.${punto.expediente ?? ""}.docx"`,
    },
  });
}
