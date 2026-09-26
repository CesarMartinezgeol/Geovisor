import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geovisor RRMRHS",
  description:
    "Red Regional de Monitoreo del Recurso Hídrico Subterráneo del departamento del Meta - Cormacarena",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b bg-emerald-800 text-white">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              Geovisor RRMRHS
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Mapa
              </Link>
              <Link href="/puntos" className="hover:underline">
                Puntos de monitoreo
              </Link>
              <Link href="/ct" className="hover:underline">
                Conceptos Técnicos
              </Link>
              <Link href="/ocr" className="hover:underline">
                OCR
              </Link>
            </nav>
            <span className="ml-auto text-xs text-emerald-100">
              Grupo Suelo y Subsuelo · Cormacarena
            </span>
          </div>
        </header>
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </body>
    </html>
  );
}
