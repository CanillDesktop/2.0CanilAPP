import type { ItemEstoqueDto } from '../types/itemEstoque';
import type { LoteDetalhe } from '../types/loteDetalhe';
import type { CampoOrdenacaoLote, DirecaoOrdenacao } from '../types/ordenacaoLotes';
import { obterStatusValidade } from './loteValidade';

function aplicarDirecao(valor: number, direction: DirecaoOrdenacao): number {
  return direction === 'asc' ? valor : -valor;
}

function compararTexto(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
}

function compararDatas(a: string | null | undefined, b: string | null | undefined): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
}

function pesoStatusValidade(validade: string | null | undefined): number {
  const { label } = obterStatusValidade(validade);
  if (label === 'Vencido') return 0;
  if (label === 'A vencer') return 1;
  if (label === 'Válido') return 2;
  return 3;
}

function pesoStatusItemEstoque(lote: ItemEstoqueDto, nivelMinimo: number): number {
  if (lote.quantidade < nivelMinimo) return -1;
  return pesoStatusValidade(lote.dataValidade);
}

function ordenarPorCampo<T>(
  itens: T[],
  comparador: (a: T, b: T) => number,
  direction: DirecaoOrdenacao,
): T[] {
  return [...itens].sort((a, b) => aplicarDirecao(comparador(a, b), direction));
}

export function ordenarLotesDetalhe(
  lotes: LoteDetalhe[],
  orderBy: CampoOrdenacaoLote,
  direction: DirecaoOrdenacao,
): LoteDetalhe[] {
  switch (orderBy) {
    case 'lote':
      return ordenarPorCampo(lotes, (a, b) => compararTexto(a.codigo, b.codigo), direction);
    case 'quantidade':
      return ordenarPorCampo(lotes, (a, b) => a.quantidade - b.quantidade, direction);
    case 'validade':
      return ordenarPorCampo(lotes, (a, b) => compararDatas(a.validade, b.validade), direction);
    case 'status':
      return ordenarPorCampo(lotes, (a, b) => pesoStatusValidade(a.validade) - pesoStatusValidade(b.validade), direction);
    default:
      return lotes;
  }
}

export function ordenarItensEstoque(
  lotes: ItemEstoqueDto[],
  orderBy: CampoOrdenacaoLote,
  direction: DirecaoOrdenacao,
  nivelMinimo = 0,
): ItemEstoqueDto[] {
  switch (orderBy) {
    case 'lote':
      return ordenarPorCampo(lotes, (a, b) => compararTexto(a.lote ?? '', b.lote ?? ''), direction);
    case 'quantidade':
      return ordenarPorCampo(lotes, (a, b) => a.quantidade - b.quantidade, direction);
    case 'validade':
      return ordenarPorCampo(lotes, (a, b) => compararDatas(a.dataValidade, b.dataValidade), direction);
    case 'status':
      return ordenarPorCampo(
        lotes,
        (a, b) => pesoStatusItemEstoque(a, nivelMinimo) - pesoStatusItemEstoque(b, nivelMinimo),
        direction,
      );
    default:
      return lotes;
  }
}
