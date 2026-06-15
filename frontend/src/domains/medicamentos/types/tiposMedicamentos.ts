import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';

export type MedicamentoLeituraDto = {
  id: number;
  codigo: string;
  nomeInformado?: string | null;
  nomeComercial?: string | null;
  nomeOuDescricaoSimples: string;
  descricaoSimples?: string | null;
  descricaoDetalhada?: string;
  prioridade: number;
  descricao: string;
  formula: string;
  publicoAlvo: number;
  itemNivelEstoque: ItemNivelEstoqueDto;
  itensEstoque: ItemEstoqueDto[];
};

export type MedicamentoCadastroDto = {
  prioridade: number;
  descricao: string;
  lote?: string | null;
  quantidade: number;
  dataEntrega: string;
  nfe?: string | null;
  formula: string;
  nomeComercial: string;
  publicoAlvo: number;
  dataValidade?: string | null;
  nivelMinimoEstoque: number;
};

export type MedicamentosFiltroDto = {
  codMedicamento?: string;
  nomeComercial?: string;
  formula?: string;
  descricaoMedicamento?: string;
  nfe?: string;
  prioridade?: number;
  publicoAlvo?: number;
  dataEntrega?: string;
  dataValidade?: string;
};
