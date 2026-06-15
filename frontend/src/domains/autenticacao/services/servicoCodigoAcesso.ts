import { ErroApi } from '../../../infrastructure/http/erroApi';
import { validarCodigoAcessoApi } from '../api/codigoAcessoApi';
import { MSG_CODIGO_ACESSO, validarFormatoCodigoAcesso } from '../constants/mensagensCodigoAcesso';
import { marcarPreLoginConcluido } from './preLoginStorage';

export type ResultadoPreLogin = { ok: true } | { ok: false; mensagem: string };

/**
 * Orquestra a validação do código de acesso no pré-login.
 * A validação definitiva é sempre feita no backend; a checagem de formato local
 * serve apenas para feedback imediato de UX.
 */
export const servicoCodigoAcesso = {
  async validar(codigo: string): Promise<ResultadoPreLogin> {
    const valor = codigo.trim();

    const erroFormato = validarFormatoCodigoAcesso(valor);
    if (erroFormato) return { ok: false, mensagem: erroFormato };

    try {
      const { valido, versao } = await validarCodigoAcessoApi(valor);
      if (!valido) return { ok: false, mensagem: MSG_CODIGO_ACESSO.invalido };

      marcarPreLoginConcluido(versao);
      return { ok: true };
    } catch (e) {
      if (e instanceof ErroApi && e.statusCode === 400) {
        return { ok: false, mensagem: MSG_CODIGO_ACESSO.obrigatorio };
      }
      return { ok: false, mensagem: MSG_CODIGO_ACESSO.falhaValidacao };
    }
  },
};
