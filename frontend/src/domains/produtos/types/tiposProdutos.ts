import type { ItemEstoqueDto, ItemNivelEstoqueDto } from '../../../shared/types/itemEstoque';
import type {
  ItemComEstoqueListaPaginadaDto,
  ItemComEstoqueListaResumoDto,
  ItensPaginacaoDto,
  StatusEstoqueFiltro,
} from '../../../shared/types/itemComEstoqueLista';

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
  descricaoSimples: string;
  descricaoDetalhada: string;
  unidade: number;
  categoria: number;
  quantidade: number;
  dataEntrega: string;
  nfe?: string | null;
  dataValidade?: string | null;
  nivelMinimoEstoque: number;
};

export type ProdutoStatusEstoqueFiltro = StatusEstoqueFiltro;

export type ProdutoFiltro = {
  /** Busca em código OU descrição (OR), server-side */
  termo?: string;
  categoria?: number;
  dataEntrega?: string;
  dataValidade?: string;
  statusEstoque?: ProdutoStatusEstoqueFiltro;
};

export type ProdutoPaginacaoDto = ItensPaginacaoDto;

export type ProdutosListaResumoDto = ItemComEstoqueListaResumoDto;

export type ProdutosListaPaginadaDto = ItemComEstoqueListaPaginadaDto<ProdutoLeituraDto>;
