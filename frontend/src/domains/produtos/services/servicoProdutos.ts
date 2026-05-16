import {
  atualizarProdutoApi,
  criarProdutoApi,
  excluirProdutoApi,
  listarProdutosPaginadosApi,
  obterProdutoPorIdApi,
} from '../api/produtosApi';
import type {
  ProdutoCadastroDto,
  ProdutoFiltroDto,
  ProdutoLeituraDto,
  ProdutoPaginacaoDto,
  ProdutosListaPaginadaDto,
} from '../types/tiposProdutos';

export const servicoProdutos = {
  listarPaginado(filtro?: ProdutoFiltroDto, paginacao?: ProdutoPaginacaoDto): Promise<ProdutosListaPaginadaDto> {
    return listarProdutosPaginadosApi(filtro, paginacao);
  },
  obterPorId(id: number): Promise<ProdutoLeituraDto> {
    return obterProdutoPorIdApi(id);
  },
  criar(dto: ProdutoCadastroDto): Promise<void> {
    return criarProdutoApi(dto);
  },
  atualizar(id: number, dto: ProdutoCadastroDto): Promise<void> {
    return atualizarProdutoApi(id, dto);
  },
  excluir(id: number): Promise<void> {
    return excluirProdutoApi(id);
  },
};
