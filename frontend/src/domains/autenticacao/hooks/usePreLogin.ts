import { useCallback, useState } from 'react';
import { servicoCodigoAcesso } from '../services/servicoCodigoAcesso';

/** Estado e ação do pré-login (validação do código de acesso). */
export function usePreLogin() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const validar = useCallback(async (codigo: string) => {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await servicoCodigoAcesso.validar(codigo);
      if (!resultado.ok) {
        setErro(resultado.mensagem);
        return false;
      }
      return true;
    } finally {
      setCarregando(false);
    }
  }, []);

  const limparErro = useCallback(() => setErro(null), []);

  return { validar, carregando, erro, limparErro };
}
