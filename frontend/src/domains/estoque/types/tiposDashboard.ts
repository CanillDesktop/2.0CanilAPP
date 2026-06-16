import type { LinhaOperacionalEstoque } from './tiposEstoque';

export type DashboardResumoDto = {
  produtos: number;
  medicamentos: number;
  insumos: number;
  totalItens: number;
};

export type DashboardAlertaItemDto = LinhaOperacionalEstoque;

export type DashboardAlertasPaginadosDto = {
  items: DashboardAlertaItemDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export type DashboardTipoAlerta = 'abaixo_minimo' | 'proximo_vencimento';

export type DashboardAlertasFiltroDto = {
  tipo: DashboardTipoAlerta;
  origem?: '' | LinhaOperacionalEstoque['origem'];
  termo?: string;
  pageNumber?: number;
  pageSize?: number;
};
