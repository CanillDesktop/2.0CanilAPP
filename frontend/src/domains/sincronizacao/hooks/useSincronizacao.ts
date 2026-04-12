import { useCallback, useState } from 'react';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { servicoSincronizacao } from '../services/servicoSincronizacao';

export function useSincronizacao() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const sincronizar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setMensagem(null);
    try {
      const r = await servicoSincronizacao.sincronizar();
      setMensagem(r.message);
      return true;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  const limpar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setMensagem(null);
    try {
      const r = await servicoSincronizacao.limpar();
      setMensagem(r.message);
      return true;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { sincronizar, limpar, carregando, erro, mensagem };
}
