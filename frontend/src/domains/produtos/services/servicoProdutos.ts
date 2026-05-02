import {
  atualizarProdutoApi,
  criarProdutoApi,
  excluirProdutoApi,
  listarProdutosApi,
  obterProdutoPorIdApi,
} from '../api/produtosApi';
import type {
  ProdutoCadastroDto,
  ProdutoFiltroDto,
  ProdutoLeituraDto,
  ProdutoPaginacaoDto,
} from '../types/tiposProdutos';

export const servicoProdutos = {
  listar(filtro?: ProdutoFiltroDto, paginacao?: ProdutoPaginacaoDto): Promise<ProdutoLeituraDto[]> {
    return listarProdutosApi(filtro, paginacao);
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
