import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import type { CredenciaisLogin } from '../types/tiposAutenticacao';

export function useAcaoLogin() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const entrar = useCallback(async (credenciais: CredenciaisLogin) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoAutenticacao.entrar(credenciais);
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
