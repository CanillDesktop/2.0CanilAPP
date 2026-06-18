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
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { PainelErro } from '../../../shared/components/PainelErro';
import { AbaCodigoAtualLeitura } from '../components/AbaCodigoAtualLeitura';
import { AbaCodigoSegurancaAdmin } from '../components/AbaCodigoSegurancaAdmin';
import { FormularioUsuario } from '../components/FormularioUsuario';
import { ListagemUsuariosResponsiva } from '../components/ListagemUsuariosResponsiva';
import { ModalConfirmacaoSenha } from '../components/ModalConfirmacaoSenha';
import { ModalTrocarSenha } from '../components/ModalTrocarSenha';
import {
  contarFiltrosGestaoUsuariosAtivos,
  PainelFiltrosGestaoUsuarios,
} from '../components/PainelFiltrosGestaoUsuarios';
import { useUsuarios } from '../hooks/useUsuarios';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';
import { descreverPermissao, formatarTempoCadastro } from '../utils/exibirPerfilUsuario';

type AbaAdmin = 'meus-dados' | 'gestao' | 'codigo-seguranca';
type AbaLeitura = 'meus-dados' | 'codigo-atual';

export function PaginaListagemUsuarios() {
  const { usuario, recarregarSessao } = useAutenticacao();
  const { cores } = useTemaApp();
  const ehAdmin = (usuario?.permissao ?? 0) === 1;
  const {
    usuarios,
    usuarioAtual,
    carregandoLista,
    carregandoAcao,
    erro,
    sucesso,
    errosValidacao,
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
  const [filtrosGestaoExpandidos, setFiltrosGestaoExpandidos] = useState(false);
  const [abaAdmin, setAbaAdmin] = useState<AbaAdmin>('meus-dados');
  const [abaLeitura, setAbaLeitura] = useState<AbaLeitura>('meus-dados');
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

  async function confirmarTrocarSenha(senhaAtual: string, novaSenha: string) {
    if (!usuario?.id) return;
    const ok = await trocarSenha(usuario.id, { senhaAtual, novaSenha });
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

  const filtrosGestaoAtivos = useMemo(
    () => contarFiltrosGestaoUsuariosAtivos(buscaInput, status),
    [buscaInput, status],
  );

  const cardMeusDados = (
    <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: cores.textPrimary }}>
            Meus dados
          </Typography>
          <Typography variant="body1" sx={{ color: cores.textPrimary }}>
            <strong>Nome:</strong> {usuario?.primeiroNome ?? ''} {usuario?.sobrenome ?? ''}
          </Typography>
          <Typography variant="body1" sx={{ color: cores.textPrimary }}>
            <strong>Email:</strong> {usuario?.email ?? 'Não informado'}
          </Typography>
          <Typography variant="body1" sx={{ color: cores.textPrimary }}>
            <strong>Tempo cadastrado:</strong> {formatarTempoCadastro(usuario?.dataHoraCriacao)}
          </Typography>
          <Typography variant="body1" sx={{ color: cores.textPrimary }}>
            <strong>Permissão:</strong> {descreverPermissao(usuario?.permissao ?? -1)}
          </Typography>
          <Typography variant="body1" sx={{ color: cores.textPrimary }}>
            <strong>Status:</strong> {usuario?.isDeleted ? 'Inativo' : 'Ativo'}
          </Typography>
          <Typography variant="body2" sx={{ color: cores.textSecondary, pt: 0.5 }}>
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
  );

  const gestaoUsuariosAdmin = (
    <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: cores.textPrimary }}>
            Gestão de usuários
          </Typography>

          <PainelFiltrosGestaoUsuarios
            expandido={filtrosGestaoExpandidos}
            onExpandidoChange={setFiltrosGestaoExpandidos}
            buscaInput={buscaInput}
            onBuscaInputChange={(valor) => {
              setBuscaInput(valor);
              setPagina(1);
            }}
            status={status}
            onStatusChange={(valor) => {
              setStatus(valor);
              setPagina(1);
            }}
            filtrosAtivos={filtrosGestaoAtivos}
            carregandoLista={carregandoLista}
            carregandoAcao={carregandoAcao}
            onCadastrar={() => setDialogNovoAberto(true)}
          />

          {erro ? <Alert severity="error">{erro}</Alert> : null}

          {carregandoLista ? (
            <Stack direction="row" spacing={1.5} sx={{ py: 3, justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} />
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
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
  );

  return (
    <ShellComSidebar
      titulo="Usuários"
      subtitulo={
        ehAdmin
          ? 'Seus dados, permissão da conta e gestão de outras contas'
          : 'Seus dados e permissão da conta (apenas administradores alteram permissões de outros usuários)'
      }
    >
      {ehAdmin ? (
        <>
          <Tabs
            value={abaAdmin}
            onChange={(_, v) => setAbaAdmin(v as AbaAdmin)}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 2,
              borderBottom: `1px solid ${cores.border}`,
              '& .MuiTab-root': { color: cores.textMuted, textTransform: 'none', fontWeight: 600 },
              '& .Mui-selected': { color: cores.textPrimary },
            }}
          >
            <Tab value="meus-dados" label="Meus dados" />
            <Tab value="gestao" label="Gestão de usuários" />
            <Tab value="codigo-seguranca" label="Código de segurança" />
          </Tabs>

          {abaAdmin === 'meus-dados' ? cardMeusDados : null}
          {abaAdmin === 'gestao' ? gestaoUsuariosAdmin : null}
          {abaAdmin === 'codigo-seguranca' ? <AbaCodigoSegurancaAdmin /> : null}
        </>
      ) : (
        <>
          <Tabs
            value={abaLeitura}
            onChange={(_, v) => setAbaLeitura(v as AbaLeitura)}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 2,
              borderBottom: `1px solid ${cores.border}`,
              '& .MuiTab-root': { color: cores.textMuted, textTransform: 'none', fontWeight: 600 },
              '& .Mui-selected': { color: cores.textPrimary },
            }}
          >
            <Tab value="meus-dados" label="Meus dados" />
            <Tab value="codigo-atual" label="Código atual" />
          </Tabs>

          {abaLeitura === 'meus-dados' ? cardMeusDados : null}
          {abaLeitura === 'codigo-atual' ? <AbaCodigoAtualLeitura /> : null}
        </>
      )}

      {!ehAdmin && erro && !dialogTrocarSenhaAberto ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {erro}
        </Alert>
      ) : null}

      <Dialog open={dialogEditarAberto} onClose={carregandoAcao ? undefined : () => setDialogEditarAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editandoProprioUsuario ? 'Editar meus dados' : 'Editar usuário'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 0.5 }}>
            <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
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
            <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
            <FormularioUsuario incluirEmailSenha incluirPermissao carregando={carregandoAcao} onSubmit={abrirConfirmacaoCriacao} />
          </Box>
        </DialogContent>
      </Dialog>

      <ModalTrocarSenha
        aberto={dialogTrocarSenhaAberto}
        carregando={carregandoAcao}
        erro={erro}
        errosValidacao={errosValidacao}
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
        errosValidacao={errosValidacao}
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
