import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import {
  montarParamsPaginacao,
  normalizarStatusEstoqueQuery,
} from '../../../shared/utils/listaItemComEstoqueApi';
import type {
  ProdutoCadastroDto,
  ProdutoFiltro,
  ProdutoLeituraDto,
  ProdutoPaginacaoDto,
  ProdutosListaPaginadaDto,
} from '../types/tiposProdutos';

function normalizarParamsFiltro(filtro?: ProdutoFiltro): Record<string, string | number | undefined> {
  if (!filtro) return {};
  const { statusEstoque, termo, categoria, dataEntrega, dataValidade, exclusivoUnidade } = filtro;
  return {
    termo: termo?.trim() || undefined,
    categoria,
    dataEntrega,
    dataValidade,
    statusEstoque: normalizarStatusEstoqueQuery(statusEstoque),
    exclusivoUnidade: exclusivoUnidade || undefined,
  };
}

/**
 * Lista produtos com paginação e metadados server-side (`totalCount`, `resumo`, etc.).
 */
export async function listarProdutosPaginadosApi(
  filtro?: ProdutoFiltro,
  paginacao?: ProdutoPaginacaoDto,
): Promise<ProdutosListaPaginadaDto> {
  const cliente = obterClienteHttp();
  const params: Record<string, string | number | undefined> = {
    ...montarParamsPaginacao(paginacao),
    ...normalizarParamsFiltro(filtro),
  };
  const qs = montarQueryString(params);
  const { data } = await cliente.get<ProdutosListaPaginadaDto>(`/api/Produtos${qs}`);
  return data;
}

export async function obterProdutoPorIdApi(id: number): Promise<ProdutoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<ProdutoLeituraDto>(`/api/Produtos/${id}`);
  return data;
}

export async function criarProdutoApi(dto: ProdutoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/Produtos', dto);
}

export async function atualizarProdutoApi(id: number, dto: ProdutoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put(`/api/Produtos/${id}`, { ...dto, idProduto: id });
}

export async function excluirProdutoApi(id: number): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Produtos/${id}`);
}
