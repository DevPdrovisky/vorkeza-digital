import type { Metadata } from "next";
import { Assistente } from "@/components/formulario/assistente";

export const metadata: Metadata = {
  title: "Criar meu dossiê",
  robots: { index: false },
};

export default function PaginaCriar() {
  return <Assistente />;
}
