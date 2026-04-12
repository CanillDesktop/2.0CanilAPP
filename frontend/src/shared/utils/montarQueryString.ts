/** Monta query string a partir de um objeto simples (valores undefined/null são ignorados). */
export function montarQueryString(params: Record<string, string | number | undefined | null>): string {
  const partes: string[] = [];
  for (const [chave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === null || valor === '') continue;
    partes.push(`${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`);
  }
  if (partes.length === 0) return '';
  return `?${partes.join('&')}`;
}
