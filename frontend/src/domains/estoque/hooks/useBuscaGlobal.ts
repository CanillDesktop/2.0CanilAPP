import { useEffect, useRef, useState } from 'react';
import { buscarGlobalApi, type BuscaGlobalItem } from '../services/buscaService';

export function useBuscaGlobal(termo: string) {
  const [resultados, setResultados] = useState<BuscaGlobalItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const requisicaoId = useRef(0);

  useEffect(() => {
    const termoLimpo = termo.trim();
    if (termoLimpo.length < 2) {
      setResultados([]);
      setCarregando(false);
      setErro(null);
      return;
    }

    const idAtual = ++requisicaoId.current;
    const timeout = window.setTimeout(() => {
      setCarregando(true);
      setErro(null);

      void buscarGlobalApi(termoLimpo)
        .then((dados) => {
          if (requisicaoId.current !== idAtual) return;
          setResultados(dados);
        })
        .catch(() => {
          if (requisicaoId.current !== idAtual) return;
          setErro('Nao foi possivel buscar itens no momento.');
          setResultados([]);
        })
        .finally(() => {
          if (requisicaoId.current !== idAtual) return;
          setCarregando(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [termo]);

  return { resultados, carregando, erro };
}
