import type { EstoqueLinhaDto, LinhaOperacionalEstoque } from '../types/tiposEstoque';
import { ESTOQUE_ORIGEM_POR_NUMERO } from '../types/tiposEstoque';

export function mapearEstoqueLinhaDto(dto: EstoqueLinhaDto): LinhaOperacionalEstoque {
  return {
    id: dto.id,
    nome: dto.nome,
    quantidade: dto.quantidade,
    minimo: dto.minimo,
    validade: dto.validade,
    origem: ESTOQUE_ORIGEM_POR_NUMERO[dto.origem] ?? 'produto',
    status: dto.statusOperacional,
    ultimaMovimentacao: dto.ultimaMovimentacao,
    validadeMs: dto.menorValidadeUtc ? new Date(dto.menorValidadeUtc).getTime() : null,
    movimentacaoMs: dto.ultimaMovimentacaoUtc ? new Date(dto.ultimaMovimentacaoUtc).getTime() : null,
  };
}

export function mapearAlertaDashboardParaLinha(item: {
  id: number;
  nome: string;
  quantidade: number;
  minimo: number;
  validade: string;
  origem: LinhaOperacionalEstoque['origem'];
  status: LinhaOperacionalEstoque['status'];
  ultimaMovimentacao: string;
  validadeMs?: number | null;
  movimentacaoMs?: number | null;
}): LinhaOperacionalEstoque {
  return {
    id: item.id,
    nome: item.nome,
    quantidade: item.quantidade,
    minimo: item.minimo,
    validade: item.validade,
    origem: item.origem,
    status: item.status,
    ultimaMovimentacao: item.ultimaMovimentacao,
    validadeMs: item.validadeMs ?? null,
    movimentacaoMs: item.movimentacaoMs ?? null,
  };
}
