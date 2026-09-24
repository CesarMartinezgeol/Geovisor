import { notFound } from "next/navigation";
import Link from "next/link";
import { getPunto, getPuntos } from "@/lib/puntos";
import InformeForm from "./InformeForm";

export function generateStaticParams() {
  return getPuntos().map((p) => ({ id: p.id }));
}

export default async function InformePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const punto = getPunto(id);
  if (!punto) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <Link href={`/puntos/${punto.id}`} className="text-sm text-emerald-700 underline">
        ← Volver a la ficha de {punto.id}
      </Link>
      <h1 className="mt-2 mb-1 text-xl font-semibold">
        Informe individual de monitoreo · {punto.id}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {punto.usuario} · Expediente {punto.expediente}
      </p>
      <InformeForm punto={punto} />
    </div>
  );
}
