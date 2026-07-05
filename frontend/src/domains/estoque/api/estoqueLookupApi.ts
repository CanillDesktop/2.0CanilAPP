import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import { HEADER_UNIDADE_ESTOQUE } from '../constants/unidadesEstoque';
import type { PagedResult } from '../types/tiposEstoque';

export type ItemEstoqueLookupDto = {
  id: number;
  codigo: string;
  descricao: string;
  saldo: number;
  origem: number;
};

export type LoteEstoqueLookupDto = {
  lote: string;
  saldo: number;
  validade?: string | null;
  dataEntrega: string;
  status: 'ok' | 'proximo_vencimento' | 'vencido' | string;
};

function headersUnidade(unidadeEstoqueId?: number | null) {
  return unidadeEstoqueId != null
    ? { [HEADER_UNIDADE_ESTOQUE]: String(unidadeEstoqueId) }
    : undefined;
}

export async function buscarItensLookupApi(
  texto: string,
  pageNumber: number,
  pageSize: number,
  unidadeEstoqueId?: number | null,
): Promise<PagedResult<ItemEstoqueLookupDto>> {
  const cliente = obterClienteHttp();
  const qs = montarQueryString({
    texto: texto.trim() || undefined,
    pageNumber,
    pageSize,
  });
  const { data } = await cliente.get<PagedResult<ItemEstoqueLookupDto>>(`/api/Estoque/lookup/itens${qs}`, {
    headers: headersUnidade(unidadeEstoqueId),
  });
  return data;
}

export async function buscarLotesLookupApi(
  itemId: number,
  texto: string,
  pageNumber: number,
  pageSize: number,
  orderBy: 'validade' | 'saldo' | 'lote' = 'validade',
  sortDirection: 'asc' | 'desc' = 'asc',
  unidadeEstoqueId?: number | null,
): Promise<PagedResult<LoteEstoqueLookupDto>> {
  const cliente = obterClienteHttp();
  const qs = montarQueryString({
    itemId,
    texto: texto.trim() || undefined,
    pageNumber,
    pageSize,
    orderBy,
    sortDirection,
  });
  const { data } = await cliente.get<PagedResult<LoteEstoqueLookupDto>>(`/api/Estoque/lookup/lotes${qs}`, {
    headers: headersUnidade(unidadeEstoqueId),
  });
  return data;
}
