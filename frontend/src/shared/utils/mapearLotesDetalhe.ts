import type { ItemEstoqueDto } from '../types/itemEstoque';
import type { LoteDetalhe } from '../types/loteDetalhe';

function compararValidade(a: LoteDetalhe, b: LoteDetalhe): number {
  if (!a.validade && !b.validade) return 0;
  if (!a.validade) return 1;
  if (!b.validade) return -1;
  return new Date(a.validade).getTime() - new Date(b.validade).getTime();
}

export function mapearItensEstoqueParaLotes(idItem: number, originais: ItemEstoqueDto[]): LoteDetalhe[] {
  return originais
    .map((lote, idx) => ({
      id: `${idItem}-${lote.lote ?? idx}`,
      codigo: lote.lote ?? '',
      quantidade: lote.quantidade,
      validade: lote.dataValidade ?? null,
    }))
    .sort(compararValidade);
}

export function textoProximoVencimento(lotes: LoteDetalhe[]): string {
  if (!lotes.length) return '—';
  const comValidade = lotes.filter((lote) => lote.validade);
  if (!comValidade.length) return 'Sem validade';
  const ordenados = [...comValidade].sort(compararValidade);
  return new Date(ordenados[0].validade!).toLocaleDateString('pt-BR');
}
