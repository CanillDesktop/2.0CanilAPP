import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';

export type { ItemEstoqueDto, ItemNivelEstoqueDto };

export type ProdutoLeituraDto = {
  id: number;
  codigo: string;
  nomeOuDescricaoSimples: string;
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

export type ProdutoFiltroDto = {
  codProduto?: string;
  descricaoSimples?: string;
  nfe?: string;
  categoria?: number;
  dataEntrega?: string;
  dataValidade?: string;
};
