import axios, { type AxiosInstance } from 'axios';
import { urlBaseApi } from '../config/variaveisAmbiente';
import { ErroApi } from './erroApi';
import type { RespostaErroApi } from '../../shared/types/respostaErroApi';
import { obterAccessToken } from '../../shared/services/armazenamentoSessao';

/**
 * Fábrica do cliente HTTP centralizado (Axios).
 * Responsável por base URL, credenciais e tratamento básico de falhas.
 */
export function criarClienteHttp(): AxiosInstance {
  const cliente = axios.create({
    baseURL: urlBaseApi,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
  });

  cliente.interceptors.request.use((config) => {
    const token = obterAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  cliente.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
      const status = erro.response?.status ?? 0;
      const dados = erro.response?.data as RespostaErroApi | undefined;
      const mensagem =
        dados && typeof dados.message === 'string'
          ? dados.message
          : erro.message ?? 'Falha na requisição';
      return Promise.reject(new ErroApi(mensagem, status, dados ?? erro.response?.data));
    },
  );

  return cliente;
}
