import { useCallback, useMemo, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { mesclarUsuarioArmazenado } from '../../../shared/services/armazenamentoSessao';
import type { UsuarioSessao } from '../../../shared/types/usuarioSessao';
import { usuariosService } from '../services/usuariosService';
import type {
  ConfirmacaoSenhaDto,
  FiltrosUsuariosListagem,
  TrocarSenhaDto,
  UsuarioAtualizacaoDto,
  UsuarioCadastroComConfirmacaoDto,
  UsuarioCriadoDto,
  UsuariosPaginadosDto,
} from '../types/tiposUsuarios';
import { StatusUsuario } from '../types/tiposUsuarios';

/** Orquestra listagem e mutações de usuários (API + estado). */
export function useUsuarios(usuario: UsuarioSessao | null, ehAdmin: boolean) {
  const [usuarios, setUsuarios] = useState<UsuarioCriadoDto[]>([]);
  const [paginacao, setPaginacao] = useState<Omit<UsuariosPaginadosDto, 'items'>>({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 8,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const carregarUsuarios = useCallback(
    async (filtros: FiltrosUsuariosListagem = {}) => {
      if (!ehAdmin) {
        setUsuarios([]);
        return;
      }
      setCarregandoLista(true);
      setErro(null);
      try {
        const resultado = await usuariosService.listar(filtros);
        setUsuarios(resultado.items);
        setPaginacao({
          totalCount: resultado.totalCount,
          pageNumber: resultado.pageNumber,
          pageSize: resultado.pageSize,
          totalPages: resultado.totalPages,
          hasPrevious: resultado.hasPrevious,
          hasNext: resultado.hasNext,
        });
      } catch (e) {
        setErro(extrairMensagemErroApi(e));
      } finally {
        setCarregandoLista(false);
      }
    },
    [ehAdmin],
  );

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
      status: (usuario.status ?? (usuario.isDeleted ? StatusUsuario.Inativo : StatusUsuario.Ativo)) as UsuarioCriadoDto['status'],
    } satisfies UsuarioCriadoDto;
  }, [usuario, usuarios]);

  const limparFeedback = useCallback(() => {
    setErro(null);
    setSucesso(null);
    setErrosValidacao(null);
  }, []);

  const atualizarUsuario = useCallback(
    async (id: number, dto: UsuarioAtualizacaoDto) => {
      setCarregandoAcao(true);
      setErro(null);
      setErrosValidacao(null);
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
        if (e instanceof ErroApi && e.errors) {
          setErrosValidacao(e.extrairMensagemErros());
        }
        return null;
      } finally {
        setCarregandoAcao(false);
      }
    },
    [usuario?.id],
  );

  const trocarSenha = useCallback(async (id: number, dto: TrocarSenhaDto): Promise<boolean> => {
    setCarregandoAcao(true);
    setErro(null);
    setErrosValidacao(null);
    setSucesso(null);
    try {
      await usuariosService.trocarSenha(id, dto);
      setSucesso('Senha alterada com sucesso.');
      return true;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return false;
    } finally {
      setCarregandoAcao(false);
    }
  }, []);

  const criarUsuario = useCallback(async (dto: UsuarioCadastroComConfirmacaoDto) => {
    setCarregandoAcao(true);
    setErro(null);
    setErrosValidacao(null);
    setSucesso(null);
    try {
      const novo = await usuariosService.criar(dto);
      setSucesso('Usuário cadastrado com sucesso.');
      return novo;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return null;
    } finally {
      setCarregandoAcao(false);
    }
  }, []);

  const executarAcaoCritica = useCallback(
    async (
      acao: 'inativar' | 'remover' | 'reativar' | 'remover-definitivo',
      id: number,
      dto: ConfirmacaoSenhaDto,
      descricaoSucesso: string,
    ): Promise<boolean> => {
      setCarregandoAcao(true);
      setErro(null);
      setErrosValidacao(null);
      setSucesso(null);
      try {
        if (acao === 'inativar') await usuariosService.inativar(id, dto);
        else if (acao === 'reativar') await usuariosService.reativar(id, dto);
        else if (acao === 'remover-definitivo') await usuariosService.remover(id, dto, true);
        else await usuariosService.remover(id, dto, false);

        setSucesso(descricaoSucesso);
        return true;
      } catch (e) {
        setErro(extrairMensagemErroApi(e));
        if (e instanceof ErroApi && e.errors) {
          setErrosValidacao(e.extrairMensagemErros());
        }
        return false;
      } finally {
        setCarregandoAcao(false);
      }
    },
    [],
  );

  return {
    usuarios,
    paginacao,
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
    errosValidacao,
  };
}
