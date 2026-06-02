import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';

export type { ItemEstoqueDto, ItemNivelEstoqueDto };

export type ProdutoLeituraDto = {
  id: number;
  codigo: string;
  nomeInformado?: string | null;
  nomeComercial?: string | null;
  nomeOuDescricaoSimples: string;
  descricaoSimples?: string | null;
  descricaoDetalhada?: string | null;
  unidade: number;
  categoria: number;
  itemNivelEstoque: ItemNivelEstoqueDto;
  itensEstoque: ItemEstoqueDto[];
};

export type ProdutoCadastroDto = {
  descricaoSimples?: string | null;
  descricaoDetalhada?: string | null;
  unidade: number;
  categoria: number;
  lote?: string | null;
  quantidade: number;
  dataEntrega: string;
  nfe?: string | null;
  dataValidade?: string | null;
  nivelMinimoEstoque: number;
};

export type ProdutoStatusEstoqueFiltro = 'todos' | 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer';

export type ProdutoFiltroDto = {
  /** Busca em código OU descrição (OR), server-side */
  termoBusca?: string;
  codProduto?: string;
  descricaoSimples?: string;
  nfe?: string;
  categoria?: number;
  dataEntrega?: string;
  dataValidade?: string;
  statusEstoque?: ProdutoStatusEstoqueFiltro;
};

export type ProdutoPaginacaoDto = {
  pageNumber?: number;
  pageSize?: number;
};

export type ProdutosListaResumoDto = {
  totalNoRecorte: number;
  ativos: number;
  baixoEstoque: number;
  semEstoque: number;
  aVencer: number;
};

export type ProdutosListaPaginadaDto = {
  items: ProdutoLeituraDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  resumo: ProdutosListaResumoDto;
};
