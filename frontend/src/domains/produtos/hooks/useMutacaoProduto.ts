import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { servicoProdutos } from '../services/servicoProdutos';
import type { ProdutoCadastroDto } from '../types/tiposProdutos';

export function useMutacaoProduto() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const criar = useCallback(async (dto: ProdutoCadastroDto) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoProdutos.criar(dto);
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

  const excluir = useCallback(async (id: number) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoProdutos.excluir(id);
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

  return { criar, excluir, carregando, erro, errosValidacao };
}
