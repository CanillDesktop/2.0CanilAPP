import { useCallback, useState } from 'react';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { servicoUsuarios } from '../services/servicoUsuarios';
import type { UsuarioCadastroDto, UsuarioCriadoDto } from '../types/tiposUsuarios';

export function useCadastroUsuario() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [criado, setCriado] = useState<UsuarioCriadoDto | null>(null);

  const cadastrar = useCallback(async (dto: UsuarioCadastroDto) => {
    setCarregando(true);
    setErro(null);
    setCriado(null);
    try {
      const resposta = await servicoUsuarios.criar(dto);
      setCriado(resposta);
      return resposta;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { cadastrar, carregando, erro, criado };
}
