import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';

export type MedicamentoLeituraDto = {
  idItem: number;
  codItem: string;
  nomeItem: string;
  prioridade: number;
  descricaoMedicamento: string;
  formula: string;
  publicoAlvo: number;
  itemNivelEstoque: ItemNivelEstoqueDto;
  itensEstoque: ItemEstoqueDto[];
};

export type MedicamentoCadastroDto = {
  codigoId: number;
  codMedicamento: string;
  prioridade: number;
  descricaoMedicamento: string;
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
