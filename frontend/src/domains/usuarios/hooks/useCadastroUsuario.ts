import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { servicoUsuarios } from '../services/servicoUsuarios';
import type { UsuarioCadastroComConfirmacaoDto, UsuarioCriadoDto } from '../types/tiposUsuarios';

export function useCadastroUsuario() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);
  const [criado, setCriado] = useState<UsuarioCriadoDto | null>(null);

  const cadastrar = useCallback(async (dto: UsuarioCadastroComConfirmacaoDto) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    setCriado(null);
    try {
      const resposta = await servicoUsuarios.criar(dto);
      setCriado(resposta);
      return resposta;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { cadastrar, carregando, erro, criado, errosValidacao };
}
