import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';

type ValidarCodigoAcessoResposta = {
  valido: boolean;
  versao: string;
};

type VersaoCodigoAcessoResposta = {
  versao: string;
};

export type ResultadoValidacaoCodigo = {
  valido: boolean;
  versao: string;
};

/**
 * Valida o código de acesso do pré-login no backend (endpoint anônimo).
 * Retorna também a versão atual do código, para o cliente registrar a qual
 * valor o pré-login se refere. A decisão final depende sempre desta validação.
 */
export async function validarCodigoAcessoApi(codigo: string): Promise<ResultadoValidacaoCodigo> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<ValidarCodigoAcessoResposta>('/api/CodigoSeguranca/validar', { codigo });
  return { valido: Boolean(data?.valido), versao: data?.versao ?? '' };
}

/** Consulta a versão atual do código de acesso (identificador opaco, sem expor o valor). */
export async function obterVersaoCodigoAcessoApi(): Promise<string> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<VersaoCodigoAcessoResposta>('/api/CodigoSeguranca/versao');
  return data?.versao ?? '';
}
