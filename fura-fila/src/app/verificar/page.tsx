import type { Metadata } from "next";
import { PaginaInterna } from "@/components/site";
import { FormularioVerificacao } from "./formulario";

export const metadata: Metadata = {
  title: "Verificar dossiê",
  description: "Confira se um Dossiê do Inquilino é autêntico pelo código impresso no documento.",
};

export default function PaginaVerificar() {
  return (
    <PaginaInterna>
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <p className="text-sm font-semibold text-marca-700">Para corretores e proprietários</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-tinta-900">Verificar um dossiê</h1>
        <p className="mt-3 text-slate-600">
          Digite o código de autenticidade que aparece no topo e no fim do PDF (ex.: FF-7K3M9-QX2DH).
        </p>
        <FormularioVerificacao />
      </div>
    </PaginaInterna>
  );
}
