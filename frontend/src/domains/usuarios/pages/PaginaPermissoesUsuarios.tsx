import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { PainelErro } from '../../../shared/components/PainelErro';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { podeGerenciarAtribuicaoPermissoes } from '../../../shared/utils/possuiPermissao';
import { FormularioAtribuicaoPermissoesUsuario } from '../components/FormularioAtribuicaoPermissoesUsuario';
import { FormularioPermissoesUnidade } from '../components/FormularioPermissoesUnidade';
import { usuariosService } from '../services/usuariosService';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';

type AbaPermissoes = 'unidade' | 'atribuicoes';

export function PaginaPermissoesUsuarios() {
  const { usuario } = useAutenticacao();
  const { cores } = useTemaApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const podeGerenciar = podeGerenciarAtribuicaoPermissoes(usuario);

  const usuarioIdParam = Number(params.get('usuarioId')) || null;
  const abaParam = params.get('aba');
  const abaAtiva: AbaPermissoes = abaParam === 'atribuicoes' ? 'atribuicoes' : 'unidade';

  const [usuarioAlvo, setUsuarioAlvo] = useState<UsuarioCriadoDto | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarUsuario = useCallback(async (id: number) => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await usuariosService.obterPorId(id);
      setUsuarioAlvo(dados);
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      setUsuarioAlvo(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!podeGerenciar || !usuarioIdParam) {
      setUsuarioAlvo(null);
      return;
    }
    void carregarUsuario(usuarioIdParam);
  }, [carregarUsuario, podeGerenciar, usuarioIdParam]);

  function voltarParaUsuarios() {
    navigate('/usuarios?aba=permissoes');
  }

  function mudarAba(novaAba: AbaPermissoes) {
    const next = new URLSearchParams(params);
    if (novaAba === 'unidade') {
      next.delete('aba');
    } else {
      next.set('aba', novaAba);
    }
    setParams(next, { replace: true });
  }

  return (
    <ShellComSidebar
      titulo="Permissões do usuário"
      subtitulo="Vínculos por unidade de estoque e atribuição detalhada de permissões"
    >
      <Stack spacing={2}>
        <Box>
          <Button
            component={Link}
            to="/usuarios?aba=permissoes"
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={(e) => {
              e.preventDefault();
              voltarParaUsuarios();
            }}
            sx={{ borderColor: cores.borderForte, color: cores.textPrimary, textTransform: 'none' }}
          >
            Voltar para usuários
          </Button>
        </Box>

        {!podeGerenciar ? (
          <Alert severity="warning">
            Você não tem permissão para gerenciar permissões de usuários.
          </Alert>
        ) : !usuarioIdParam ? (
          <Alert severity="info">
            Nenhum usuário selecionado. Volte à{' '}
            <Box
              component={Link}
              to="/usuarios?aba=permissoes"
              sx={{ color: cores.focus, fontWeight: 600 }}
            >
              aba Permissões unidade
            </Box>{' '}
            e escolha um usuário na listagem.
          </Alert>
        ) : (
          <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
            <Tabs
              value={abaAtiva}
              onChange={(_, v: AbaPermissoes) => mudarAba(v)}
              sx={{ px: 2, pt: 1, borderBottom: `1px solid ${cores.border}` }}
            >
              <Tab value="unidade" label="Unidade de estoque" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab value="atribuicoes" label="Permissões completas" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>
            <CardContent>
              {carregando ? (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                    Carregando usuário…
                  </Typography>
                </Stack>
              ) : erro ? (
                <PainelErro mensagem={erro} />
              ) : usuarioAlvo?.id ? (
                abaAtiva === 'unidade' ? (
                  <FormularioPermissoesUnidade usuario={usuarioAlvo} />
                ) : (
                  <FormularioAtribuicaoPermissoesUsuario usuario={usuarioAlvo} />
                )
              ) : (
                <Alert severity="warning">Usuário não encontrado.</Alert>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </ShellComSidebar>
  );
}
