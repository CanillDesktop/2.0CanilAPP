import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';
import type { LoteProduto } from '../types/loteProduto';

export function mapearItensEstoqueParaLotes(idItem: number, originais: ItemEstoqueDto[]): LoteProduto[] {
  return originais
    .map((lote, idx) => ({
      id: `${idItem}-${lote.lote ?? idx}`,
      codigo: lote.lote ?? `L${idx + 1}`,
      quantidade: lote.quantidade,
      validade: lote.dataValidade ?? new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    }))
    .sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());
}
