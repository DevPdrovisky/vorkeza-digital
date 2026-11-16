import Link from "next/link";
import { PaginaInterna } from "@/components/site";
import { botaoPrimario } from "@/components/ui/estilos";

export default function NaoEncontrado() {
  return (
    <PaginaInterna>
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-semibold text-marca-700">Erro 404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-tinta-900">Página não encontrada</h1>
        <p className="mt-3 text-slate-600">O link pode estar incompleto ou o dossiê pode ter sido removido.</p>
        <Link href="/" className={`${botaoPrimario} mt-8`}>
          Ir para o início
        </Link>
      </div>
    </PaginaInterna>
  );
}
