import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { FormularioUsuario } from '../components/FormularioUsuario';
import { ListagemUsuariosResponsiva } from '../components/ListagemUsuariosResponsiva';
import { ModalConfirmacaoSenha } from '../components/ModalConfirmacaoSenha';
import { ModalTrocarSenha } from '../components/ModalTrocarSenha';
import { useUsuarios } from '../hooks/useUsuarios';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';
import { descreverPermissao, formatarTempoCadastro } from '../utils/exibirPerfilUsuario';

export function PaginaListagemUsuarios() {
  const { usuario, recarregarSessao } = useAutenticacao();
  const ehAdmin = (usuario?.permissao ?? 0) === 1;
  const {
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
  } = useUsuarios(usuario, ehAdmin);

  const [buscaInput, setBuscaInput] = useState('');
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [pagina, setPagina] = useState(1);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogTrocarSenhaAberto, setDialogTrocarSenhaAberto] = useState(false);
  const [dialogNovoAberto, setDialogNovoAberto] = useState(false);
  const [alvoEdicao, setAlvoEdicao] = useState<UsuarioCriadoDto | null>(null);
  const [confirmacao, setConfirmacao] = useState<{
    aberto: boolean;
    acao: 'criar' | 'inativar' | 'remover' | null;
    usuarioAlvo?: UsuarioCriadoDto;
    payloadCriacao?: { primeiroNome: string; sobrenome?: string | null; email: string; senha: string; permissao: number };
  }>({ aberto: false, acao: null });

  useEffect(() => {
    const t = window.setTimeout(() => setBusca(buscaInput), 350);
    return () => window.clearTimeout(t);
  }, [buscaInput]);

  useEffect(() => {
    void carregarUsuarios();
  }, [carregarUsuarios]);

  const usuariosFiltrados = useMemo(() => filtrarUsuarios({ busca, status }), [busca, filtrarUsuarios, status]);
  const pageSize = 8;
  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / pageSize));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * pageSize;
    return usuariosFiltrados.slice(inicio, inicio + pageSize);
  }, [paginaAtual, usuariosFiltrados]);

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  async function salvarEdicao(dados: {
    primeiroNome: string;
    sobrenome?: string | null;
    email?: string;
    permissao?: number;
  }) {
    if (!alvoEdicao?.id) return;
    const emailTrim = dados.email?.trim();
    if (!emailTrim) return;
    const dto = {
      primeiroNome: dados.primeiroNome,
      sobrenome: dados.sobrenome,
      email: emailTrim,
      ...(ehAdmin && usuario?.id !== alvoEdicao.id && dados.permissao !== undefined
        ? { permissao: dados.permissao }
        : {}),
    };
    const atualizado = await atualizarUsuario(alvoEdicao.id, dto);
    if (atualizado) {
      setDialogEditarAberto(false);
      if (usuario?.id === alvoEdicao.id) recarregarSessao();
    }
  }

  async function confirmarTrocarSenha(senhaAtual: string, senhaNova: string) {
    if (!usuario?.id) return;
    const ok = await trocarSenha(usuario.id, { senhaAtual, senhaNova });
    if (ok) setDialogTrocarSenhaAberto(false);
  }

  function abrirConfirmacaoCriacao(dados: {
    primeiroNome: string;
    sobrenome?: string | null;
    email?: string;
    senha?: string;
    permissao?: number;
  }) {
    if (!dados.email || !dados.senha || !dados.permissao) return;
    setConfirmacao({
      aberto: true,
      acao: 'criar',
      payloadCriacao: {
        primeiroNome: dados.primeiroNome,
        sobrenome: dados.sobrenome,
        email: dados.email,
        senha: dados.senha,
        permissao: dados.permissao,
      },
    });
  }

  async function confirmarAcaoCritica(senhaConfirmacao: string) {
    if (!confirmacao.acao) return;
    if (confirmacao.acao === 'criar' && confirmacao.payloadCriacao) {
      const criado = await criarUsuario({ ...confirmacao.payloadCriacao, senhaConfirmacao });
      if (criado) {
        setDialogNovoAberto(false);
        setConfirmacao({ aberto: false, acao: null });
      }
      return;
    }
    if (!confirmacao.usuarioAlvo?.id) return;
    const tipoAcao = confirmacao.acao as 'inativar' | 'remover';
    const sucessoAcao = await executarAcaoCritica(
      tipoAcao,
      confirmacao.usuarioAlvo.id,
      { senhaConfirmacao },
      tipoAcao === 'inativar' ? 'Usuário inativado com sucesso.' : 'Usuário removido com sucesso.',
    );
    if (sucessoAcao) setConfirmacao({ aberto: false, acao: null });
  }

  const listaVaziaSemFiltro = ehAdmin && !carregandoLista && usuarios.length === 0 && !erro;
  const listaFiltradaVazia =
    ehAdmin && !carregandoLista && usuarios.length > 0 && usuariosFiltrados.length === 0 && !erro;

  const editandoProprioUsuario = Boolean(alvoEdicao?.id && usuario?.id === alvoEdicao.id);

  return (
    <ShellComSidebar
      titulo="Usuários"
      subtitulo={
        ehAdmin
          ? 'Seus dados, permissão da conta e gestão de outras contas'
          : 'Seus dados e permissão da conta (apenas administradores alteram permissões de outros usuários)'
      }
    >
      <Stack spacing={2}>
        <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', boxShadow: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Meus dados
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <strong>Nome:</strong> {usuario?.primeiroNome ?? ''} {usuario?.sobrenome ?? ''}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <strong>Email:</strong> {usuario?.email ?? 'Nao informado'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <strong>Tempo cadastrado:</strong> {formatarTempoCadastro(usuario?.dataHoraCriacao)}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <strong>Permissão:</strong> {descreverPermissao(usuario?.permissao ?? -1)}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <strong>Status:</strong> {usuario?.isDeleted ? 'Inativo' : 'Ativo'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', pt: 0.5 }}>
                Você pode atualizar nome, sobrenome e email. A permissão só pode ser alterada por um administrador ao
                editar outro usuário na lista (quando houver outro admin ativo no sistema).
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, pt: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (usuarioAtual?.id != null) {
                      setAlvoEdicao(usuarioAtual);
                      setDialogEditarAberto(true);
                    }
                  }}
                >
                  Editar meus dados
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    limparFeedback();
                    setDialogTrocarSenhaAberto(true);
                  }}
                >
                  Alterar senha
                </Button>
                <Button variant="outlined" onClick={recarregarSessao}>
                  Atualizar sessão
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {ehAdmin ? (
          <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', boxShadow: 3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Gestão de usuários
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
                  <TextField
                    label="Buscar por nome/email"
                    value={buscaInput}
                    onChange={(e) => {
                      setBuscaInput(e.target.value);
                      setPagina(1);
                    }}
                    fullWidth
                    disabled={carregandoLista}
                  />
                  <TextField
                    label="Status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as 'todos' | 'ativos' | 'inativos');
                      setPagina(1);
                    }}
                    select
                    sx={{ minWidth: { xs: '100%', md: 200 } }}
                    disabled={carregandoLista}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="ativos">Ativos</MenuItem>
                    <MenuItem value="inativos">Inativos</MenuItem>
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={() => setDialogNovoAberto(true)}
                    disabled={carregandoAcao || carregandoLista}
                  >
                    Cadastrar usuário
                  </Button>
                </Stack>

                {erro ? <Alert severity="error">{erro}</Alert> : null}

                {carregandoLista ? (
                  <Stack direction="row" spacing={1.5} sx={{ py: 3, justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Carregando usuários…
                    </Typography>
                  </Stack>
                ) : null}

                {listaVaziaSemFiltro ? (
                  <Alert severity="info">Nenhum usuário cadastrado no sistema ainda.</Alert>
                ) : null}

                {listaFiltradaVazia ? (
                  <Alert severity="warning">Nenhum usuário corresponde à busca ou ao filtro de status.</Alert>
                ) : null}

                {!carregandoLista && usuariosFiltrados.length > 0 ? (
                  <>
                    <ListagemUsuariosResponsiva
                      usuarios={usuariosPaginados}
                      carregando={carregandoAcao}
                      onEditar={(u) => {
                        setAlvoEdicao(u);
                        setDialogEditarAberto(true);
                      }}
                      onInativar={(u) => setConfirmacao({ aberto: true, acao: 'inativar', usuarioAlvo: u })}
                      onRemover={(u) => setConfirmacao({ aberto: true, acao: 'remover', usuarioAlvo: u })}
                    />
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        disabled={paginaAtual <= 1 || usuariosFiltrados.length === 0}
                        onClick={() => setPagina((v) => Math.max(1, v - 1))}
                      >
                        Anterior
                      </Button>
                      <Button variant="outlined" disabled>
                        {usuariosFiltrados.length === 0 ? '0 / 0' : `${paginaAtual} / ${totalPaginas}`}
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={paginaAtual >= totalPaginas || usuariosFiltrados.length === 0}
                        onClick={() => setPagina((v) => Math.min(totalPaginas, v + 1))}
                      >
                        Próxima
                      </Button>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Stack>

      {!ehAdmin && erro && !dialogTrocarSenhaAberto ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {erro}
        </Alert>
      ) : null}

      <Dialog open={dialogEditarAberto} onClose={carregandoAcao ? undefined : () => setDialogEditarAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editandoProprioUsuario ? 'Editar meus dados' : 'Editar usuário'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 0.5 }}>
            <FormularioUsuario
              usuario={alvoEdicao}
              incluirEmailEdicao
              permissaoEdicao={
                alvoEdicao && ehAdmin && usuario?.id !== alvoEdicao.id
                  ? 'editavel'
                  : alvoEdicao
                    ? 'somenteLeitura'
                    : 'oculto'
              }
              carregando={carregandoAcao}
              onSubmit={salvarEdicao}
            />
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogNovoAberto} onClose={carregandoAcao ? undefined : () => setDialogNovoAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo usuário</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 0.5 }}>
            <FormularioUsuario incluirEmailSenha incluirPermissao carregando={carregandoAcao} onSubmit={abrirConfirmacaoCriacao} />
          </Box>
        </DialogContent>
      </Dialog>

      <ModalTrocarSenha
        aberto={dialogTrocarSenhaAberto}
        carregando={carregandoAcao}
        erro={erro}
        onFechar={() => {
          if (!carregandoAcao) {
            limparFeedback();
            setDialogTrocarSenhaAberto(false);
          }
        }}
        onConfirmar={confirmarTrocarSenha}
      />

      <ModalConfirmacaoSenha
        aberto={confirmacao.aberto}
        titulo="Confirmação obrigatória"
        descricao="Informe a senha do usuário logado para concluir esta ação crítica."
        carregando={carregandoAcao}
        erro={erro}
        onFechar={() => setConfirmacao({ aberto: false, acao: null })}
        onConfirmar={confirmarAcaoCritica}
      />

      <Snackbar open={Boolean(sucesso)} autoHideDuration={3500} onClose={limparFeedback}>
        <Alert severity="success" onClose={limparFeedback} sx={{ width: '100%' }}>
          {sucesso}
        </Alert>
      </Snackbar>
    </ShellComSidebar>
  );
}
