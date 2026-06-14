import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import {
  carregarTodasPaginasLista,
  montarParamsPaginacao,
  normalizarStatusEstoqueQuery,
} from '../../../shared/utils/listaItemComEstoqueApi';
import type {
  InsumoCadastroDto,
  InsumoFiltro,
  InsumoLeituraDto,
  InsumoPaginacaoDto,
  InsumosListaPaginadaDto,
} from '../types/tiposInsumos';

function normalizarParamsFiltro(filtro?: InsumoFiltro): Record<string, string | number | undefined> {
  if (!filtro) return {};
  const { statusEstoque, termo, unidade, dataEntrega, dataValidade } = filtro;
  return {
    termo: termo?.trim() || undefined,
    unidade,
    dataEntrega,
    dataValidade,
    statusEstoque: normalizarStatusEstoqueQuery(statusEstoque),
  };
}

/**
 * Lista insumos com paginação e metadados server-side (`totalCount`, `resumo`, etc.).
 */
export async function listarInsumosPaginadosApi(
  filtro?: InsumoFiltro,
  paginacao?: InsumoPaginacaoDto,
): Promise<InsumosListaPaginadaDto> {
  const cliente = obterClienteHttp();
  const params: Record<string, string | number | undefined> = {
    ...montarParamsPaginacao(paginacao),
    ...normalizarParamsFiltro(filtro),
  };
  const qs = montarQueryString(params);
  const { data } = await cliente.get<InsumosListaPaginadaDto>(`/api/Insumos${qs}`);
  return data;
}

/**
 * Carrega todos os insumos (várias páginas na API) para telas que agregam estoque no cliente.
 */
export async function listarTodosInsumosParaEstoqueApi(): Promise<InsumoLeituraDto[]> {
  return carregarTodasPaginasLista((pageNumber, pageSize) =>
    listarInsumosPaginadosApi(undefined, { pageNumber, pageSize }),
  );
}

export async function obterInsumoPorIdApi(id: number): Promise<InsumoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<InsumoLeituraDto>(`/api/Insumos/${id}`);
  return data;
}

export async function criarInsumoApi(dto: InsumoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/Insumos', dto);
}

export async function atualizarInsumoApi(dto: InsumoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put('/api/Insumos', dto);
}

export async function excluirInsumoApi(id: number): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Insumos/${id}`);
}
