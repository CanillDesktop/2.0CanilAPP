import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import { HEADER_UNIDADE_ESTOQUE } from '../constants/unidadesEstoque';
import type {
  EstoqueConsultaParametros,
  EstoqueContagemPorOrigemDto,
  EstoqueFiltroDto,
  EstoqueLinhaDto,
  PagedResult,
} from '../types/tiposEstoque';

function headersUnidade(unidadeEstoqueId?: number | null) {
  return unidadeEstoqueId != null
    ? { [HEADER_UNIDADE_ESTOQUE]: String(unidadeEstoqueId) }
    : undefined;
}

/**
 * Listagem operacional paginada/filtrada/ordenada server-side (Opção A: uma origem por requisição).
 * Escopo sempre da unidade ativa informada (saldo/lotes daquela unidade).
 */
export async function consultarEstoquePaginadoApi(
  filtro: EstoqueFiltroDto,
  parametros: EstoqueConsultaParametros,
  unidadeEstoqueId?: number | null,
): Promise<PagedResult<EstoqueLinhaDto>> {
  const cliente = obterClienteHttp();
  const qs = montarQueryString({
    origem: filtro.origem,
    termoBusca: filtro.termoBusca?.trim() || undefined,
    statusOperacional: filtro.statusOperacional || undefined,
    quantidadeMinima: filtro.quantidadeMinima,
    quantidadeMaxima: filtro.quantidadeMaxima,
    validadeDe: filtro.validadeDe || undefined,
    validadeAte: filtro.validadeAte || undefined,
    movimentacaoDe: filtro.movimentacaoDe || undefined,
    movimentacaoAte: filtro.movimentacaoAte || undefined,
    pageNumber: parametros.pageNumber,
    pageSize: parametros.pageSize,
    orderBy: parametros.orderBy,
    sortDirection: parametros.sortDirection,
  });
  const { data } = await cliente.get<PagedResult<EstoqueLinhaDto>>(`/api/Estoque/pagination${qs}`, {
    headers: headersUnidade(unidadeEstoqueId),
  });
  return data;
}

/** Totais por aba (Produtos / Medicamentos / Insumos) para os rótulos da UI. */
export async function obterContagensEstoqueApi(
  unidadeEstoqueId?: number | null,
): Promise<EstoqueContagemPorOrigemDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<EstoqueContagemPorOrigemDto>('/api/Estoque/contagens', {
    headers: headersUnidade(unidadeEstoqueId),
  });
  return data;
}
