// Ícones de traço simples (SVG inline, herdam a cor do texto).

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconeSeta = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconeVoltar = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

export const IconeCheck = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className} strokeWidth={2.6}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const IconeCadeado = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconeDocumento = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const IconeRelogio = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconeEnviar = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />
  </svg>
);

export const IconeEscudo = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </svg>
);

export const IconeBaixar = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

export const IconeClipe = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M20.5 11.5 12 20a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10 18a2 2 0 0 1-3-3l7.5-7.5" />
  </svg>
);

export const IconeX = ({ className = "h-5 w-5" }: Props) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
