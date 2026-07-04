import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type {
  TipoItemUnidadeMedida,
  UnidadeMedidaCadastroDto,
  UnidadeMedidaDto,
} from '../types/tiposUnidadeMedida';

export async function listarUnidadesMedidaApi(opcoes?: {
  aplicavelA?: TipoItemUnidadeMedida;
  apenasAtivas?: boolean;
}): Promise<UnidadeMedidaDto[]> {
  const cliente = obterClienteHttp();
  const qs = montarQueryString({
    aplicavelA: opcoes?.aplicavelA,
    apenasAtivas: opcoes?.apenasAtivas ?? true,
  });
  const { data } = await cliente.get<UnidadeMedidaDto[]>(`/api/UnidadesMedida${qs}`);
  return data;
}

export async function criarUnidadeMedidaApi(dto: UnidadeMedidaCadastroDto): Promise<UnidadeMedidaDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<UnidadeMedidaDto>('/api/UnidadesMedida', dto);
  return data;
}

export async function atualizarUnidadeMedidaApi(
  id: number,
  dto: UnidadeMedidaCadastroDto,
): Promise<UnidadeMedidaDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.put<UnidadeMedidaDto>(`/api/UnidadesMedida/${id}`, dto);
  return data;
}
