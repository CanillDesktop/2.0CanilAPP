import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type {
  ProdutoCadastroDto,
  ProdutoFiltroDto,
  ProdutoLeituraDto,
  ProdutoPaginacaoDto,
  ProdutosListaPaginadaDto,
} from '../types/tiposProdutos';

const PADRAO_PAGINACAO: Required<ProdutoPaginacaoDto> = {
  pageNumber: 1,
  pageSize: 10,
};

function normalizarParamsFiltro(filtro?: ProdutoFiltroDto): Record<string, string | number | undefined> {
  if (!filtro) return {};
  const { statusEstoque, termoBusca, categoria, codProduto, descricaoSimples, nfe, dataEntrega, dataValidade } = filtro;
  return {
    termoBusca: termoBusca?.trim() || undefined,
    codProduto: codProduto?.trim() || undefined,
    descricaoSimples: descricaoSimples?.trim() || undefined,
    nfe: nfe?.trim() || undefined,
    categoria,
    dataEntrega,
    dataValidade,
    statusEstoque: statusEstoque && statusEstoque !== 'todos' ? statusEstoque : undefined,
  };
}

/**
 * Lista produtos com paginação e metadados server-side (`totalCount`, `resumo`, etc.).
 */
export async function listarProdutosPaginadosApi(
  filtro?: ProdutoFiltroDto,
  paginacao?: ProdutoPaginacaoDto,
): Promise<ProdutosListaPaginadaDto> {
  const cliente = obterClienteHttp();
  const pageNumber = paginacao?.pageNumber ?? PADRAO_PAGINACAO.pageNumber;
  const pageSize = paginacao?.pageSize ?? PADRAO_PAGINACAO.pageSize;
  const params: Record<string, string | number | undefined> = {
    pageNumber,
    pageSize,
    ...normalizarParamsFiltro(filtro),
  };
  const qs = montarQueryString(params);
  const { data } = await cliente.get<ProdutosListaPaginadaDto>(`/api/Produtos/pagination${qs}`);
  return data;
}

const PAGE_SIZE_LEITURA_ESTOQUE = 50;

/**
 * Carrega todos os produtos (várias páginas na API) para telas que agregam estoque no cliente.
 */
export async function listarTodosProdutosParaEstoqueApi(): Promise<ProdutoLeituraDto[]> {
  const todos: ProdutoLeituraDto[] = [];
  let pageNumber = 1;
  while (true) {
    const resposta = await listarProdutosPaginadosApi(undefined, {
      pageNumber,
      pageSize: PAGE_SIZE_LEITURA_ESTOQUE,
    });
    todos.push(...resposta.items);
    if (resposta.items.length < PAGE_SIZE_LEITURA_ESTOQUE || pageNumber >= resposta.totalPages) break;
    pageNumber += 1;
  }
  return todos;
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
