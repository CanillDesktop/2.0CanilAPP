import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';

export type InsumoLeituraDto = {
  id: number;
  codigo: string;
  nomeOuDescricaoSimples: string;
  descricaoDetalhada: string;
  unidade: number;
  itemNivelEstoque: ItemNivelEstoqueDto;
  itensEstoque: ItemEstoqueDto[];
};

export type InsumoCadastroDto = {
  descricaoSimplificada: string;
  descricaoDetalhada: string;
  lote?: string | null;
  quantidade: number;
  dataEntrega: string;
  nfe?: string | null;
  unidade: number;
  dataValidade?: string | null;
  nivelMinimoEstoque: number;
};

export type InsumosFiltroDto = {
  codInsumo?: string;
  descricaoSimplificada?: string;
  nfe?: string;
  unidade?: number;
  dataEntrega?: string;
  dataValidade?: string;
};
