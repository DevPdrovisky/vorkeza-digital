/** Aceita o código digitado de qualquer jeito ("ff7k3m9qx2dh", "FF 7K3M9 QX2DH"…) e devolve FF-XXXXX-XXXXX. */
export function normalizarCodigo(entrada: string) {
  let s = entrada.toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (s.startsWith("FF") && s.length === 12) s = s.slice(2);
  if (s.length !== 10) return null;
  return `FF-${s.slice(0, 5)}-${s.slice(5)}`;
}
