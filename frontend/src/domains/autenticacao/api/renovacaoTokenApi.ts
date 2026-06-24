import axios from 'axios';
import { urlBaseApi } from '../../../infrastructure/config/variaveisAmbiente';

/**
 * Cliente dedicado à renovação de sessão — sem interceptadores de 401
 * para evitar loop infinito ao chamar `/api/Auth/refresh`.
 */
const clienteRenovacao = axios.create({
  baseURL: urlBaseApi,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
});

/** Renova o access token usando o refresh token HttpOnly (cookie). */
export async function solicitarRenovacaoTokenDiretoApi(): Promise<unknown> {
  const { data } = await clienteRenovacao.post<unknown>('/api/Auth/refresh');
  return data;
}
