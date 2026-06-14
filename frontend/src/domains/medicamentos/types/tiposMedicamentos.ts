import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';
import type {
  ItemComEstoqueListaPaginadaDto,
  ItemComEstoqueListaResumoDto,
  ItensPaginacaoDto,
  StatusEstoqueFiltro,
} from '../../../shared/types/itemComEstoqueLista';

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

export type MedicamentoStatusEstoqueFiltro = StatusEstoqueFiltro;

export type MedicamentoFiltro = {
  /** Busca OR em código, descrição, fórmula, nome comercial, NF-e e lote — server-side */
  termo?: string;
  prioridade?: number;
  publicoAlvo?: number;
  dataEntrega?: string;
  dataValidade?: string;
  statusEstoque?: MedicamentoStatusEstoqueFiltro;
};

export type MedicamentoPaginacaoDto = ItensPaginacaoDto;

export type MedicamentosListaResumoDto = ItemComEstoqueListaResumoDto;

export type MedicamentosListaPaginadaDto = ItemComEstoqueListaPaginadaDto<MedicamentoLeituraDto>;
