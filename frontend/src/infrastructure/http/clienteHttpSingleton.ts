import type { AxiosInstance } from 'axios';
import { configurarInterceptadorRenovacaoSessao } from '../../domains/autenticacao/http/configurarInterceptadorRenovacaoSessao';
import { criarClienteHttp } from './criarClienteHttp';

let instancia: AxiosInstance | null = null;

/**
 * Instância única do cliente HTTP (padrão singleton simples para o app).
 */
export function obterClienteHttp(): AxiosInstance {
  if (!instancia) {
    instancia = criarClienteHttp();
    configurarInterceptadorRenovacaoSessao(instancia);
  }
  return instancia;
}
