import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import type { CredenciaisLogin } from '../types/tiposAutenticacao';
import { normalizarEmailLogin, validarEmailLogin } from '../utils/emailLogin';

export function useAcaoLogin() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const entrar = useCallback(async (credenciais: CredenciaisLogin) => {
    setErro(null);
    setErrosValidacao(null);

    const login = normalizarEmailLogin(credenciais.login);
    const erroEmail = validarEmailLogin(login);
    if (erroEmail) {
      setErro(erroEmail);
      return false;
    }

    setCarregando(true);
    try {
      await servicoAutenticacao.entrar({ login, senha: credenciais.senha });
      return true;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { entrar, carregando, erro, errosValidacao };
}
