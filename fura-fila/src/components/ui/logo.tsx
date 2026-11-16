export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill={claro ? "#12305a" : "#0b1f3a"} />
        <circle cx="10.5" cy="23" r="2" fill="#a9bcd6" />
        <circle cx="16" cy="23" r="2" fill="#a9bcd6" />
        <circle cx="21.5" cy="23" r="2" fill="#a9bcd6" />
        <path d="M5.5 21.5C7.5 8 22.5 6.5 26 19" fill="none" stroke="#12b07c" strokeWidth="2.6" strokeLinecap="round" />
        <path
          d="M22.4 17.2 26.1 19.6l1.5-4.2"
          fill="none"
          stroke="#12b07c"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="leading-none">
        <span className={`block text-[15px] font-extrabold tracking-tight ${claro ? "text-white" : "text-tinta-900"}`}>
          Fura-Fila
        </span>
        <span className={`mt-0.5 block text-[11px] font-medium ${claro ? "text-slate-300" : "text-slate-500"}`}>
          de Aluguéis
        </span>
      </span>
    </span>
  );
}
