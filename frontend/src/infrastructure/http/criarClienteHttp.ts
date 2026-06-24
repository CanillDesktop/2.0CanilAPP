import axios, { type AxiosInstance } from 'axios';
import { HEADER_UNIDADE_ESTOQUE } from '../../domains/estoque/constants/unidadesEstoque';
import { urlBaseApi } from '../config/variaveisAmbiente';
import { obterAccessToken } from '../../shared/services/armazenamentoSessao';
import { obterUnidadeAtivaId } from '../../shared/services/armazenamentoUnidadeEstoque';

/**
 * Fábrica do cliente HTTP centralizado (Axios).
 * Responsável por base URL, credenciais e injeção do access token.
 * O pipeline de resposta (401 → refresh → retry → ErroApi) é registrado no singleton.
 */
export function criarClienteHttp(): AxiosInstance {
  const cliente = axios.create({
    baseURL: urlBaseApi,
    headers: { 'Content-Type': 'application/json' },
    timeout: 50_000,
    /** Cookie HttpOnly do refresh token — necessário em dev (proxy) e prod (cross-origin). */
    withCredentials: true,
  });

  cliente.interceptors.request.use((config) => {
    const token = obterAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const unidadeId = obterUnidadeAtivaId();
    if (unidadeId != null) {
      config.headers[HEADER_UNIDADE_ESTOQUE] = String(unidadeId);
    }
    return config;
  });

  return cliente;
}
