import type { PreviewDossie } from "@/lib/preview";
import { IconeCadeado, IconeCheck } from "./ui/icones";

/** Miniatura do PDF em HTML. Na landing usa dados de exemplo; no paywall, os dados reais com o miolo borrado. */
export function DocumentoPreview({
  dados,
  bloqueado = false,
  etiqueta,
}: {
  dados: PreviewDossie;
  bloqueado?: boolean;
  etiqueta?: string;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-tinta-900/20 ring-1 ring-slate-900/10">
      {etiqueta && (
        <span className="absolute right-3 top-3 z-20 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 shadow-sm">
          {etiqueta}
        </span>
      )}

      <div className="relative bg-tinta-900 px-5 pb-5 pt-6 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-marca-600" />
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-marca-300">Dossiê do Inquilino</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">{dados.nome}</p>
            <p className="mt-1 truncate text-xs text-slate-300">{dados.cargo}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {dados.chips.map((c) => (
                <span key={c} className="rounded-full bg-tinta-800 px-2 py-0.5 text-[10px] font-medium text-white">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <QrFalso />
        </div>
      </div>

      <div className={`relative px-5 py-5 sm:px-6 ${bloqueado ? "select-none" : ""}`}>
        <div className={bloqueado ? "blur-[5px]" : ""} aria-hidden={bloqueado}>
          <p className="border-b border-slate-200 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-marca-700">
            Resumo executivo
          </p>
          <div className="mt-2.5 space-y-1.5">
            <div className="h-2 w-full rounded bg-slate-200" />
            <div className="h-2 w-[94%] rounded bg-slate-200" />
            <div className="h-2 w-[70%] rounded bg-slate-200" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {dados.indicadores.map((i) => (
              <div
                key={i.rotulo}
                className={`rounded-lg border px-2.5 py-2 ${
                  i.destaque ? "border-marca-100 bg-marca-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">{i.rotulo}</p>
                <p className="mt-0.5 text-sm font-bold text-tinta-900">{i.valor}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 border-b border-slate-200 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-marca-700">
            Pontos fortes do perfil
          </p>
          <ul className="mt-2 space-y-1.5">
            {dados.pontos.map((p) => (
              <li key={p} className="flex items-start gap-2 text-[11px] text-slate-700">
                <span className="mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-marca-50 text-marca-600">
                  <IconeCheck className="h-2.5 w-2.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <p className="mt-5 border-t border-slate-100 pt-2 text-[7.5px] leading-snug text-slate-400">
            Documento autenticado via Fura-Fila de Aluguéis. Conheça a tecnologia Vitrine Imóvel para a sua
            imobiliária.
          </p>
        </div>

        {bloqueado && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/30 via-white/60 to-white/80">
            <span className="inline-flex items-center gap-2 rounded-full bg-tinta-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
              <IconeCadeado className="h-4 w-4" />
              Conteúdo completo após o pagamento
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Desenho decorativo de um QR Code (o real só existe no PDF). */
function QrFalso() {
  const celulas = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1,
    0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0,
    0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1,
  ];
  return (
    <div className="shrink-0 rounded-md bg-white p-1.5" aria-hidden="true">
      <div className="grid grid-cols-9 gap-px">
        {celulas.map((c, i) => (
          <span key={i} className={`h-1.5 w-1.5 ${c ? "bg-tinta-900" : "bg-transparent"}`} />
        ))}
      </div>
    </div>
  );
}
