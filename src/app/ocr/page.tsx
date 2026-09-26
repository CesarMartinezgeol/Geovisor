import OCRClient from "./OCRClient";

export default function OCRPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <h1 className="mb-2 text-xl font-semibold">OCR de documentos</h1>
      <p className="mb-6 text-sm text-slate-600">
        Sube un PDF o una imagen escaneada (FUN, Auto de inicio, expediente completo, ficha
        técnica) y obtén la transcripción completa en texto, con tablas y estructura conservadas,
        lista para copiar, buscar o pegar en un CT.
      </p>
      <OCRClient />
    </div>
  );
}
