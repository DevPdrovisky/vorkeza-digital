import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Fura-Fila de Aluguéis — Dossiê do Inquilino em 3 minutos",
    template: "%s · Fura-Fila de Aluguéis",
  },
  description:
    "Seja o primeiro a ser aprovado. Gere seu currículo de inquilino em PDF, com renda, referências e comprovantes organizados, em 3 minutos.",
  openGraph: {
    title: "Seja o primeiro a ser aprovado no aluguel",
    description: "Gere seu Dossiê do Inquilino em PDF em 3 minutos.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
