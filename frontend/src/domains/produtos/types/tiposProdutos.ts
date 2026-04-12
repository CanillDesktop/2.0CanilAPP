import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';

export type { ItemEstoqueDto, ItemNivelEstoqueDto };

export type ProdutoLeituraDto = {
  idItem: number;
  codItem: string;
  nomeItem: string;
  descricaoDetalhada?: string | null;
  unidade: number;
  categoria: number;
  itemNivelEstoque: ItemNivelEstoqueDto;
  itensEstoque: ItemEstoqueDto[];
};

export type ProdutoCadastroDto = {
  idProduto: number;
  codProduto: string;
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

export type ProdutoFiltroDto = {
  codProduto?: string;
  descricaoSimples?: string;
  nfe?: string;
  categoria?: number;
  dataEntrega?: string;
  dataValidade?: string;
};
