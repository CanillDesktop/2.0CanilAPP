import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { PainelErro } from '../../../shared/components/PainelErro';
import { AbaCodigoSegurancaAdmin } from '../components/AbaCodigoSegurancaAdmin';
import { AbaPermissoesUnidadeAdmin } from '../components/AbaPermissoesUnidadeAdmin';
import { ListagemUsuariosAdminConteudo } from '../components/ListagemUsuariosAdminConteudo';
import { FormularioUsuario } from '../components/FormularioUsuario';
import { ModalConfirmacaoSenha } from '../components/ModalConfirmacaoSenha';
import { ModalTrocarSenha } from '../components/ModalTrocarSenha';
import { useUsuarios } from '../hooks/useUsuarios';
import type { FiltrosUsuariosListagem, UsuarioCriadoDto } from '../types/tiposUsuarios';
import { rotuloStatusUsuario, StatusUsuario } from '../types/tiposUsuarios';
import { descreverPermissao, formatarTempoCadastro } from '../utils/exibirPerfilUsuario';
import { montarUnidadesEstoqueCadastro } from '../../estoque/constants/unidadesEstoque';
import type { EscolhaUnidadeCadastro } from '../../estoque/constants/unidadesEstoque';

type AbaAdmin = 'meus-dados' | 'gestao' | 'permissoes' | 'codigo-seguranca';

type AcaoCritica = 'criar' | 'inativar' | 'remover' | 'reativar' | 'remover-definitivo';

const DESCRICOES_MODAL: Record<Exclude<AcaoCritica, 'criar'>, string> = {
  inativar: 'Informe sua senha para inativar este usuário. Ele não poderá acessar o sistema até ser reativado.',
  remover: 'Informe sua senha para excluir logicamente este usuário. O registro permanecerá no histórico.',
  reativar: 'Informe sua senha para reativar este usuário e restaurar o acesso ao sistema.',
  'remover-definitivo':
    'Informe sua senha para remover permanentemente este usuário do banco de dados. Esta ação é irreversível.',
};

export function PaginaListagemUsuarios() {
  const { usuario, recarregarSessao } = useAutenticacao();
  const { cores } = useTemaApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const ehAdmin = (usuario?.permissao ?? 0) === 1;
  const {
    usuarios,
    paginacao,
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
  } = useUsuarios(usuario, ehAdmin);

  const [buscaInput, setBuscaInput] = useState('');
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<NonNullable<FiltrosUsuariosListagem['status']>>('ativos');
  const [pagina, setPagina] = useState(1);
  const [filtrosGestaoExpandidos, setFiltrosGestaoExpandidos] = useState(false);
  const [filtrosPermissoesExpandidos, setFiltrosPermissoesExpandidos] = useState(false);
  const abaInicial = (searchParams.get('aba') as AbaAdmin | null) ?? 'meus-dados';
  const [abaAdmin, setAbaAdmin] = useState<AbaAdmin>(
    abaInicial === 'gestao' || abaInicial === 'permissoes' || abaInicial === 'codigo-seguranca'
      ? abaInicial
      : 'meus-dados',
  );
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogTrocarSenhaAberto, setDialogTrocarSenhaAberto] = useState(false);
  const [dialogNovoAberto, setDialogNovoAberto] = useState(false);
  const [alvoEdicao, setAlvoEdicao] = useState<UsuarioCriadoDto | null>(null);
  const [confirmacao, setConfirmacao] = useState<{
    aberto: boolean;
    acao: AcaoCritica | null;
    usuarioAlvo?: UsuarioCriadoDto;
    payloadCriacao?: {
      primeiroNome: string;
      sobrenome?: string | null;
      email: string;
      senha: string;
      permissao: number;
      unidadeCadastro: EscolhaUnidadeCadastro;
    };
  }>({ aberto: false, acao: null });

  useEffect(() => {
    const t = window.setTimeout(() => setBusca(buscaInput), 350);
    return () => window.clearTimeout(t);
  }, [buscaInput]);

  const recarregarLista = useCallback(() => {
    void carregarUsuarios({ busca, status, pageNumber: pagina, pageSize: 8 });
  }, [busca, carregarUsuarios, pagina, status]);

  useEffect(() => {
    recarregarLista();
  }, [recarregarLista]);

  useEffect(() => {
    const aba = searchParams.get('aba') as AbaAdmin | null;
    if (aba === 'gestao' || aba === 'permissoes' || aba === 'codigo-seguranca') {
      setAbaAdmin(aba);
    }
  }, [searchParams]);

  function alterarAba(novaAba: AbaAdmin) {
    setAbaAdmin(novaAba);
    if (novaAba === 'meus-dados') {
      searchParams.delete('aba');
    } else {
      searchParams.set('aba', novaAba);
    }
    setSearchParams(searchParams, { replace: true });
  }

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
      recarregarLista();
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
    unidadeCadastro?: EscolhaUnidadeCadastro;
  }) {
    if (!dados.email || !dados.senha || !dados.permissao || !dados.unidadeCadastro) return;
    setConfirmacao({
      aberto: true,
      acao: 'criar',
      payloadCriacao: {
        primeiroNome: dados.primeiroNome,
        sobrenome: dados.sobrenome,
        email: dados.email,
        senha: dados.senha,
        permissao: dados.permissao,
        unidadeCadastro: dados.unidadeCadastro,
      },
    });
  }

  async function confirmarAcaoCritica(senhaConfirmacao: string) {
    if (!confirmacao.acao) return;
    if (confirmacao.acao === 'criar' && confirmacao.payloadCriacao) {
      const criado = await criarUsuario({
        ...confirmacao.payloadCriacao,
        senhaConfirmacao,
        unidadesEstoque: montarUnidadesEstoqueCadastro(confirmacao.payloadCriacao.unidadeCadastro),
      });
      if (criado) {
        setDialogNovoAberto(false);
        setConfirmacao({ aberto: false, acao: null });
        recarregarLista();
      }
      return;
    }
    if (!confirmacao.usuarioAlvo?.id || confirmacao.acao === 'criar') return;

    const acao = confirmacao.acao;
    const mensagens: Record<typeof acao, string> = {
      inativar: 'Usuário inativado com sucesso.',
      remover: 'Usuário excluído com sucesso.',
      reativar: 'Usuário reativado com sucesso.',
      'remover-definitivo': 'Usuário removido permanentemente do sistema.',
    };

    const sucessoAcao = await executarAcaoCritica(
      acao,
      confirmacao.usuarioAlvo.id,
      { senhaConfirmacao },
      mensagens[acao],
    );
    if (sucessoAcao) {
      setConfirmacao({ aberto: false, acao: null });
      recarregarLista();
    }
  }

  const editandoProprioUsuario = Boolean(alvoEdicao?.id && usuario?.id === alvoEdicao.id);

  const statusSessao = usuario?.status ?? (usuario?.isDeleted ? StatusUsuario.Inativo : StatusUsuario.Ativo);

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
            <strong>Status:</strong> {rotuloStatusUsuario(statusSessao as 1 | 2 | 3)}
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
    <ListagemUsuariosAdminConteudo
      modo="gestao"
      titulo="Gestão de usuários"
      usuarios={usuarios}
      paginacao={paginacao}
      usuarioLogadoId={usuario?.id}
      carregandoLista={carregandoLista}
      carregandoAcao={carregandoAcao}
      erro={erro}
      buscaInput={buscaInput}
      buscaAplicada={busca}
      onBuscaInputChange={(valor) => {
        setBuscaInput(valor);
        setPagina(1);
      }}
      status={status}
      onStatusChange={(valor) => {
        setStatus(valor);
        setPagina(1);
      }}
      pagina={pagina}
      onPaginaChange={setPagina}
      filtrosExpandidos={filtrosGestaoExpandidos}
      onFiltrosExpandidosChange={setFiltrosGestaoExpandidos}
      onCadastrar={() => setDialogNovoAberto(true)}
      onEditar={(u) => {
        setAlvoEdicao(u);
        setDialogEditarAberto(true);
      }}
      onInativar={(u) => setConfirmacao({ aberto: true, acao: 'inativar', usuarioAlvo: u })}
      onReativar={(u) => setConfirmacao({ aberto: true, acao: 'reativar', usuarioAlvo: u })}
      onRemover={(u) => setConfirmacao({ aberto: true, acao: 'remover', usuarioAlvo: u })}
      onRemoverDefinitivo={(u) =>
        setConfirmacao({ aberto: true, acao: 'remover-definitivo', usuarioAlvo: u })
      }
    />
  );

  const propsListagemCompartilhada = {
    usuarios,
    paginacao,
    usuarioLogadoId: usuario?.id,
    carregandoLista,
    carregandoAcao,
    erro,
    buscaInput,
    buscaAplicada: busca,
    onBuscaInputChange: (valor: string) => {
      setBuscaInput(valor);
      setPagina(1);
    },
    status,
    onStatusChange: (valor: NonNullable<FiltrosUsuariosListagem['status']>) => {
      setStatus(valor);
      setPagina(1);
    },
    pagina,
    onPaginaChange: setPagina,
  };

  const descricaoModal =
    confirmacao.acao && confirmacao.acao !== 'criar'
      ? DESCRICOES_MODAL[confirmacao.acao]
      : 'Informe a senha do usuário logado para concluir esta ação crítica.';

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
            onChange={(_, v) => alterarAba(v as AbaAdmin)}
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
            <Tab value="permissoes" label="Permissões unidade" />
            <Tab value="codigo-seguranca" label="Código de acesso" />
          </Tabs>

          {abaAdmin === 'meus-dados' ? cardMeusDados : null}
          {abaAdmin === 'gestao' ? gestaoUsuariosAdmin : null}
          {abaAdmin === 'permissoes' ? (
            <AbaPermissoesUnidadeAdmin
              {...propsListagemCompartilhada}
              filtrosExpandidos={filtrosPermissoesExpandidos}
              onFiltrosExpandidosChange={setFiltrosPermissoesExpandidos}
            />
          ) : null}
          {abaAdmin === 'codigo-seguranca' ? <AbaCodigoSegurancaAdmin /> : null}
        </>
      ) : (
        cardMeusDados
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
            <FormularioUsuario
              incluirEmailSenha
              incluirPermissao
              incluirUnidade
              carregando={carregandoAcao}
              onSubmit={abrirConfirmacaoCriacao}
            />
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
        descricao={descricaoModal}
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
