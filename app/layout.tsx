import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tez — Calculadora de Especificação",
  description: "Sistema comercial de especificação de materiais Tez Textura e Arte",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-[#FAF6EF] text-[#2C2520] antialiased">{children}</body>
    </html>
  );
}
