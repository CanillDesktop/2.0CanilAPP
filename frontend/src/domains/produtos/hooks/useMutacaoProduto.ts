import { useCallback, useState } from 'react';
import { capturarErroMutacao, ErroApi, type ResultadoMutacao } from '../../../infrastructure/http/erroApi';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { servicoProdutos } from '../services/servicoProdutos';
import type { ProdutoCadastroDto } from '../types/tiposProdutos';

export function useMutacaoProduto() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const criar = useCallback(async (dto: ProdutoCadastroDto): Promise<ResultadoMutacao> => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoProdutos.criar(dto);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, MSG_ERRO.operacao);
      if (!falha.ok) setErro(falha.mensagem);
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return falha;
    } finally {
      setCarregando(false);
    }
  }, []);

  const excluir = useCallback(async (id: number): Promise<ResultadoMutacao> => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoProdutos.excluir(id);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, MSG_ERRO.excluirProduto);
      if (!falha.ok) setErro(falha.mensagem);
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return falha;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { criar, excluir, carregando, erro, errosValidacao };
}
