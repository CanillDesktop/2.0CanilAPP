import axios, { type AxiosInstance } from 'axios';
import { urlBaseApi } from '../config/variaveisAmbiente';
import { obterAccessToken } from '../../shared/services/armazenamentoSessao';

/**
 * Fábrica do cliente HTTP centralizado (Axios).
 * Responsável por base URL, credenciais e injeção do access token.
 * O pipeline de resposta (401/refresh + ErroApi) é registrado no singleton.
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
    return config;
  });

  return cliente;
}
