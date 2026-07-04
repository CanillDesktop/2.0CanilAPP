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
  unidadeRotulo?: string | null;
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

/** Produtos com saldo apenas na unidade indicada (requer acesso às duas unidades). */
export type ProdutoExclusivoUnidadeFiltro = 'secretaria' | 'canil';

export type ProdutoFiltro = {
  /** Busca em código OU descrição (OR), server-side */
  termo?: string;
  categoria?: number;
  dataEntrega?: string;
  dataValidade?: string;
  statusEstoque?: ProdutoStatusEstoqueFiltro;
  /** Quando definido, lista só produtos com saldo exclusivo nessa unidade. */
  exclusivoUnidade?: ProdutoExclusivoUnidadeFiltro;
};

export type ProdutoPaginacaoDto = ItensPaginacaoDto;

export type ProdutosListaResumoDto = ItemComEstoqueListaResumoDto;

export type ProdutosListaPaginadaDto = ItemComEstoqueListaPaginadaDto<ProdutoLeituraDto>;
