import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { usuariosService } from '../services/usuariosService';
import type { UsuarioUnidadeEstoqueAtribuicaoDto, UsuarioUnidadeEstoqueDto } from '../types/tiposUsuarios';

export function usePermissoesUnidadeUsuario() {
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [permissoes, setPermissoes] = useState<UsuarioUnidadeEstoqueDto[]>([]);

  const carregar = useCallback(async (idUsuario: number) => {
    setCarregando(true);
    setErro(null);
    setSucesso(null);
    try {
      const lista = await usuariosService.listarUnidadesEstoque(idUsuario);
      setPermissoes(lista);
      return lista;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      setPermissoes([]);
      return [];
    } finally {
      setCarregando(false);
    }
  }, []);

  const salvar = useCallback(
    async (idUsuario: number, unidades: UsuarioUnidadeEstoqueAtribuicaoDto[], permissao?: number) => {
      setSalvando(true);
      setErro(null);
      setErrosValidacao(null);
      setSucesso(null);
      try {
        await usuariosService.atualizar(idUsuario, {
          primeiroNome: '',
          email: '',
          unidadesEstoque: unidades,
          ...(permissao !== undefined ? { permissao } : {}),
        });
        setSucesso('Permissões atualizadas com sucesso.');
        return true;
      } catch (e) {
        setErro(extrairMensagemErroApi(e));
        if (e instanceof ErroApi && e.errors) {
          setErrosValidacao(e.extrairMensagemErros());
        }
        return false;
      } finally {
        setSalvando(false);
      }
    },
    [],
  );

  const limparFeedback = useCallback(() => {
    setErro(null);
    setSucesso(null);
    setErrosValidacao(null);
  }, []);

  return {
    permissoes,
    setPermissoes,
    carregando,
    salvando,
    erro,
    errosValidacao,
    sucesso,
    carregar,
    salvar,
    limparFeedback,
  };
}
