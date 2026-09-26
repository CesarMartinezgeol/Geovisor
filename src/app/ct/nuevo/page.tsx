import Link from "next/link";
import CTForm from "./CTForm";

export default function NuevoCTPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <Link href="/ct" className="text-sm text-emerald-700 underline">
        ← Volver al tablero de CT
      </Link>
      <h1 className="mt-2 mb-6 text-xl font-semibold">Generar encabezado de Concepto Técnico (F.GA-39)</h1>
      <CTForm />
    </div>
  );
}
