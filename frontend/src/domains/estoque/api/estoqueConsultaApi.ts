import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type {
  EstoqueConsultaParametros,
  EstoqueContagemPorOrigemDto,
  EstoqueFiltroDto,
  EstoqueLinhaDto,
  PagedResult,
} from '../types/tiposEstoque';

/**
 * Listagem operacional paginada/filtrada/ordenada server-side (Opção A: uma origem por requisição).
 */
export async function consultarEstoquePaginadoApi(
  filtro: EstoqueFiltroDto,
  parametros: EstoqueConsultaParametros,
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
  const { data } = await cliente.get<PagedResult<EstoqueLinhaDto>>(`/api/Estoque/pagination${qs}`);
  return data;
}

/** Totais por aba (Produtos / Medicamentos / Insumos) para os rótulos da UI. */
export async function obterContagensEstoqueApi(): Promise<EstoqueContagemPorOrigemDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<EstoqueContagemPorOrigemDto>('/api/Estoque/contagens');
  return data;
}
