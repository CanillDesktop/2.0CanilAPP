import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type {
  DashboardAlertasFiltroDto,
  DashboardAlertasPaginadosDto,
  DashboardResumoDto,
} from '../types/tiposDashboard';

export async function obterResumoDashboardApi(): Promise<DashboardResumoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<DashboardResumoDto>('/api/Dashboard/resumo');
  return data;
}

export async function listarAlertasDashboardApi(
  filtro: DashboardAlertasFiltroDto,
): Promise<DashboardAlertasPaginadosDto> {
  const cliente = obterClienteHttp();
  const params: Record<string, string | number | undefined> = {
    tipo: filtro.tipo,
    origem: filtro.origem || undefined,
    termo: filtro.termo?.trim() || undefined,
    pageNumber: filtro.pageNumber ?? 1,
    pageSize: filtro.pageSize ?? 5,
  };
  const qs = montarQueryString(params);
  const { data } = await cliente.get<DashboardAlertasPaginadosDto>(`/api/Dashboard/alertas${qs}`);
  return data;
}
