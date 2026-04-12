import { useCallback, useState } from 'react';
import { extrairMensagemErroApi } from '../../infrastructure/http/erroApi';

export type EstadoAssincrono<T> = {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
};

const estadoInicial = <T,>(): EstadoAssincrono<T> => ({
  dados: null,
  carregando: false,
  erro: null,
});

/**
 * Hook genérico para encapsular carregamento, erro e resultado de operações assíncronas.
 */
export function useEstadoAssincrono<T>() {
  const [estado, setEstado] = useState<EstadoAssincrono<T>>(estadoInicial);

  const executar = useCallback(async (operacao: () => Promise<T>) => {
    setEstado({ dados: null, carregando: true, erro: null });
    try {
      const dados = await operacao();
      setEstado({ dados, carregando: false, erro: null });
      return dados;
    } catch (e) {
      const mensagem = extrairMensagemErroApi(e);
      setEstado({ dados: null, carregando: false, erro: mensagem });
      return null;
    }
  }, []);

  const redefinir = useCallback(() => setEstado(estadoInicial()), []);

  return { estado, executar, redefinir, setEstado };
}
