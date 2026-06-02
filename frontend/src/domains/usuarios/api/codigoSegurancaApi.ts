import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { AtualizarCodigoSegurancaDto, CodigoSegurancaDto } from '../types/tiposCodigoSeguranca';

const ROTA = '/api/CodigoSeguranca';

/** Obtém o código de segurança atual do sistema. */
export async function obterCodigoSegurancaApi(): Promise<CodigoSegurancaDto | null> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<CodigoSegurancaDto>(ROTA);
  return data;
}

/** Atualiza o código de segurança (somente administrador). */
export async function atualizarCodigoSegurancaApi(dto: AtualizarCodigoSegurancaDto): Promise<CodigoSegurancaDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.put<CodigoSegurancaDto>(ROTA, dto);
  return data;
}
