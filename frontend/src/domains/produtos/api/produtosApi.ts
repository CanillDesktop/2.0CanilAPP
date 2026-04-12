import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type { ProdutoCadastroDto, ProdutoFiltroDto, ProdutoLeituraDto } from '../types/tiposProdutos';

export async function listarProdutosApi(filtro?: ProdutoFiltroDto): Promise<ProdutoLeituraDto[]> {
  const cliente = obterClienteHttp();
  const qs = filtro ? montarQueryString(filtro as Record<string, string | number | undefined>) : '';
  const { data } = await cliente.get<ProdutoLeituraDto[]>(`/api/Produtos${qs}`);
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
