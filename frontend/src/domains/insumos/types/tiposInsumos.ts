import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';

export type InsumoLeituraDto = {
  idItem: number;
  codItem: string;
  nomeItem: string;
  descricaoDetalhada: string;
  unidade: number;
  itemNivelEstoque: ItemNivelEstoqueDto;
  itensEstoque: ItemEstoqueDto[];
};

export type InsumoCadastroDto = {
  codigoId: number;
  codInsumo: string;
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
