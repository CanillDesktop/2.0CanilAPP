import { useCallback, useEffect, useState } from 'react';
import { ErroApi, extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { atualizarCodigoSegurancaApi, obterCodigoSegurancaApi } from '../api/codigoSegurancaApi';

const CHAVE_LOCAL = 'canilapp_codigo_seguranca';

function lerCodigoLocal(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_LOCAL);
  } catch {
    return null;
  }
}

function salvarCodigoLocal(codigo: string) {
  try {
    window.localStorage.setItem(CHAVE_LOCAL, codigo);
  } catch {
    /* ignore */
  }
}

/** Carrega e persiste o código de segurança (API com fallback local até integração completa). */
export function useCodigoSeguranca(ehAdmin: boolean) {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [apiDisponivel, setApiDisponivel] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dto = await obterCodigoSegurancaApi();
      setApiDisponivel(true);
      setCodigo(dto?.codigo?.trim() ? dto.codigo : null);
    } catch (e) {
      setApiDisponivel(false);
      const local = lerCodigoLocal();
      setCodigo(local?.trim() ? local : null);
      if (e instanceof ErroApi && e.statusCode !== 404) {
        setErro(extrairMensagemErroApi(e));
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const salvar = useCallback(
    async (novoCodigo: string) => {
      if (!ehAdmin) return false;
      const valor = novoCodigo.trim();
      if (!valor) {
        setErro('Informe um código de segurança.');
        return false;
      }

      setSalvando(true);
      setErro(null);
      setSucesso(null);
      try {
        const dto = await atualizarCodigoSegurancaApi({ codigo: valor });
        setApiDisponivel(true);
        setCodigo(dto.codigo);
        setSucesso('Código de segurança atualizado com sucesso.');
        return true;
      } catch (e) {
        if (e instanceof ErroApi && (e.statusCode === 404 || e.statusCode === 501)) {
          salvarCodigoLocal(valor);
          setCodigo(valor);
          setSucesso(
            'Código salvo localmente. A sincronização com o servidor será habilitada em uma atualização futura.',
          );
          return true;
        }
        setErro(extrairMensagemErroApi(e));
        return false;
      } finally {
        setSalvando(false);
      }
    },
    [ehAdmin],
  );

  const limparFeedback = useCallback(() => {
    setErro(null);
    setSucesso(null);
  }, []);

  return {
    codigo,
    carregando,
    salvando,
    erro,
    sucesso,
    apiDisponivel,
    carregar,
    salvar,
    limparFeedback,
  };
}
