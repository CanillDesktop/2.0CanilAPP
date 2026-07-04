import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';
import type {
  ItemComEstoqueListaPaginadaDto,
  ItemComEstoqueListaResumoDto,
  ItensPaginacaoDto,
  StatusEstoqueFiltro,
} from '../../../shared/types/itemComEstoqueLista';

export type InsumoLeituraDto = {
  id: number;
  codigo: string;
  nomeInformado?: string | null;
  nomeOuDescricaoSimples: string;
  descricaoSimplificada?: string | null;
  descricaoSimples?: string | null;
  descricaoDetalhada: string;
  unidade: number;
  unidadeRotulo?: string | null;
  itemNivelEstoque: ItemNivelEstoqueDto;
  itensEstoque: ItemEstoqueDto[];
};

export type InsumoCadastroDto = {
  descricaoSimplificada: string;
  descricaoDetalhada: string;
  quantidade: number;
  dataEntrega: string;
  nfe?: string | null;
  unidade: number;
  dataValidade?: string | null;
  nivelMinimoEstoque: number;
};

export type InsumoStatusEstoqueFiltro = StatusEstoqueFiltro;

export type InsumoFiltro = {
  /** Busca OR em código, descrições, NF-e e lote — server-side */
  termo?: string;
  unidade?: number;
  dataEntrega?: string;
  dataValidade?: string;
  statusEstoque?: InsumoStatusEstoqueFiltro;
};

export type InsumoPaginacaoDto = ItensPaginacaoDto;

export type InsumosListaResumoDto = ItemComEstoqueListaResumoDto;

export type InsumosListaPaginadaDto = ItemComEstoqueListaPaginadaDto<InsumoLeituraDto>;
