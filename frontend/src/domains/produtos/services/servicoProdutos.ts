import {
  atualizarProdutoApi,
  criarProdutoApi,
  excluirProdutoApi,
  listarProdutosApi,
  obterProdutoPorIdApi,
} from '../api/produtosApi';
import type { ProdutoCadastroDto, ProdutoFiltroDto, ProdutoLeituraDto } from '../types/tiposProdutos';

export const servicoProdutos = {
  listar(filtro?: ProdutoFiltroDto): Promise<ProdutoLeituraDto[]> {
    return listarProdutosApi(filtro);
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
