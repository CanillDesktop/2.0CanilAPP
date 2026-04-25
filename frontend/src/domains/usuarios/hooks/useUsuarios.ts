import { useCallback, useMemo, useState } from 'react';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { mesclarUsuarioArmazenado } from '../../../shared/services/armazenamentoSessao';
import type { UsuarioSessao } from '../../../shared/types/usuarioSessao';
import { usuariosService } from '../services/usuariosService';
import type {
  ConfirmacaoSenhaDto,
  FiltrosUsuarios,
  TrocarSenhaDto,
  UsuarioAtualizacaoDto,
  UsuarioCadastroComConfirmacaoDto,
  UsuarioCriadoDto,
} from '../types/tiposUsuarios';

function normalizar(valor?: string | null): string {
  return (valor ?? '').trim().toLowerCase();
}

/** Orquestra listagem e mutações de usuários (API + estado). */
export function useUsuarios(usuario: UsuarioSessao | null, ehAdmin: boolean) {
  const [usuarios, setUsuarios] = useState<UsuarioCriadoDto[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const carregarUsuarios = useCallback(async () => {
    if (!ehAdmin) {
      setUsuarios([]);
      return;
    }
    setCarregandoLista(true);
    setErro(null);
    try {
      const lista = await usuariosService.listar();
      setUsuarios(lista);
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setCarregandoLista(false);
    }
  }, [ehAdmin]);

  const usuarioAtual = useMemo(() => {
    if (!usuario) return null;
    const registroLista = usuarios.find((item) => item.id === usuario.id);
    if (registroLista) return registroLista;
    return {
      id: usuario.id ?? null,
      email: usuario.email,
      primeiroNome: usuario.primeiroNome,
      sobrenome: usuario.sobrenome,
      permissao: usuario.permissao,
      dataHoraCriacao: String(usuario.dataHoraCriacao),
      dataHoraAtualizacao: String(usuario.dataHoraAtualizacao),
      isDeleted: Boolean(usuario.isDeleted),
    } satisfies UsuarioCriadoDto;
  }, [usuario, usuarios]);

  const limparFeedback = useCallback(() => {
    setErro(null);
    setSucesso(null);
  }, []);

  const atualizarUsuario = useCallback(async (id: number, dto: UsuarioAtualizacaoDto) => {
    setCarregandoAcao(true);
    setErro(null);
    setSucesso(null);
    try {
      const atualizado = await usuariosService.atualizar(id, dto);
      setUsuarios((atual) =>
        atual.some((u) => u.id === id) ? atual.map((u) => (u.id === id ? atualizado : u)) : atual,
      );
      if (usuario?.id === id) {
        mesclarUsuarioArmazenado({
          primeiroNome: atualizado.primeiroNome,
          sobrenome: atualizado.sobrenome ?? '',
          email: atualizado.email,
          dataHoraAtualizacao: new Date(atualizado.dataHoraAtualizacao),
        });
      }
      setSucesso('Dados do usuário atualizados com sucesso.');
      return atualizado;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      return null;
    } finally {
      setCarregandoAcao(false);
    }
  }, [usuario?.id]);

  const trocarSenha = useCallback(async (id: number, dto: TrocarSenhaDto): Promise<boolean> => {
    setCarregandoAcao(true);
    setErro(null);
    setSucesso(null);
    try {
      await usuariosService.trocarSenha(id, dto);
      setSucesso('Senha alterada com sucesso.');
      return true;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      return false;
    } finally {
      setCarregandoAcao(false);
    }
  }, []);

  const criarUsuario = useCallback(async (dto: UsuarioCadastroComConfirmacaoDto) => {
    setCarregandoAcao(true);
    setErro(null);
    setSucesso(null);
    try {
        const novo = await usuariosService.criarComConfirmacao(dto);
      setUsuarios((atual) => [novo, ...atual]);
      setSucesso('Usuário cadastrado com sucesso.');
      return novo;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      return null;
    } finally {
      setCarregandoAcao(false);
    }
  }, []);

  const executarAcaoCritica = useCallback(
    async (
      acao: 'inativar' | 'remover',
      id: number,
      dto: ConfirmacaoSenhaDto,
      descricaoSucesso: string,
    ): Promise<boolean> => {
      setCarregandoAcao(true);
      setErro(null);
      setSucesso(null);
      try {
          if (acao === 'inativar') await usuariosService.inativar(id, dto);
          else await usuariosService.remover(id, dto);

        setUsuarios((atual) => {
          if (acao === 'remover') return atual.filter((item) => item.id !== id);
          return atual.map((item) => (item.id === id ? { ...item, isDeleted: true } : item));
        });
        setSucesso(descricaoSucesso);
        return true;
      } catch (e) {
        setErro(extrairMensagemErroApi(e));
        return false;
      } finally {
        setCarregandoAcao(false);
      }
    },
    [],
  );

  const filtrarUsuarios = useCallback(
    (filtros: FiltrosUsuarios) => {
      const termo = normalizar(filtros.busca);
      return usuarios.filter((item) => {
        const nomeCompleto = `${item.primeiroNome} ${item.sobrenome ?? ''}`;
        const atendeBusca =
          !termo || normalizar(nomeCompleto).includes(termo) || normalizar(item.email).includes(termo);
        if (!atendeBusca) return false;

        if (filtros.status === 'ativos') return !item.isDeleted;
        if (filtros.status === 'inativos') return item.isDeleted;
        return true;
      });
    },
    [usuarios],
  );

  return {
    usuarios,
    usuarioAtual,
    carregandoLista,
    carregandoAcao,
    erro,
    sucesso,
    limparFeedback,
    carregarUsuarios,
    atualizarUsuario,
    trocarSenha,
    criarUsuario,
    executarAcaoCritica,
    filtrarUsuarios,
  };
}
