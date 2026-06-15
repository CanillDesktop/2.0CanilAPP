import type { ItemEstoqueDto } from '../types/itemEstoque';
import type { LoteDetalhe } from '../types/loteDetalhe';

export function mapearItensEstoqueParaLotes(idItem: number, originais: ItemEstoqueDto[]): LoteDetalhe[] {
  return originais
    .map((lote, idx) => ({
      id: `${idItem}-${lote.lote ?? idx}`,
      codigo: lote.lote ?? '',
      quantidade: lote.quantidade,
      validade: lote.dataValidade ?? new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    }))
    .sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());
}

export function textoProximoVencimento(lotes: LoteDetalhe[]): string {
  if (!lotes.length) return '—';
  const ordenados = [...lotes].sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());
  return new Date(ordenados[0].validade).toLocaleDateString('pt-BR');
}
