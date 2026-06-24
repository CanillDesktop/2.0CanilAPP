const CHAVE_UNIDADE_ATIVA = 'canilapp_unidade_estoque_ativa';

export function salvarUnidadeAtivaId(id: number): void {
  localStorage.setItem(CHAVE_UNIDADE_ATIVA, String(id));
}

export function obterUnidadeAtivaId(): number | null {
  const bruto = localStorage.getItem(CHAVE_UNIDADE_ATIVA);
  if (!bruto) return null;
  const id = Number(bruto);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function limparUnidadeAtivaId(): void {
  localStorage.removeItem(CHAVE_UNIDADE_ATIVA);
}
