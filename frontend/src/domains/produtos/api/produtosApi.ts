import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type {
  ProdutoCadastroDto,
  ProdutoFiltroDto,
  ProdutoLeituraDto,
  ProdutoPaginacaoDto,
} from '../types/tiposProdutos';

const PADRAO_PAGINACAO: Required<ProdutoPaginacaoDto> = {
  pageNumber: 1,
  pageSize: 10,
};

export async function listarProdutosApi(
  filtro?: ProdutoFiltroDto,
  paginacao?: ProdutoPaginacaoDto,
): Promise<ProdutoLeituraDto[]> {
  const cliente = obterClienteHttp();
  const pageNumber = paginacao?.pageNumber ?? PADRAO_PAGINACAO.pageNumber;
  const pageSize = paginacao?.pageSize ?? PADRAO_PAGINACAO.pageSize;
  const params: Record<string, string | number | undefined> = {
    pageNumber,
    pageSize,
    ...(filtro as Record<string, string | number | undefined> | undefined),
  };
  const qs = montarQueryString(params);
  const { data } = await cliente.get<ProdutoLeituraDto[]>(`/api/Produtos/pagination${qs}`);
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
