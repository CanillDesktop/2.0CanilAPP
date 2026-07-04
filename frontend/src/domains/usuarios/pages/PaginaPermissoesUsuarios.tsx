import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
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
import { FormularioPermissoesUnidade } from '../components/FormularioPermissoesUnidade';
import { usuariosService } from '../services/usuariosService';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';

export function PaginaPermissoesUsuarios() {
  const { usuario } = useAutenticacao();
  const { cores } = useTemaApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ehAdmin = (usuario?.permissao ?? 0) === 1;

  const usuarioIdParam = Number(params.get('usuarioId')) || null;

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
    if (!ehAdmin || !usuarioIdParam) {
      setUsuarioAlvo(null);
      return;
    }
    void carregarUsuario(usuarioIdParam);
  }, [carregarUsuario, ehAdmin, usuarioIdParam]);

  function voltarParaUsuarios() {
    navigate('/usuarios?aba=permissoes');
  }

  return (
    <ShellComSidebar
      titulo="Permissões por unidade"
      subtitulo="Defina o acesso do usuário à Secretaria e ao Canil"
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

        {!ehAdmin ? (
          <Alert severity="warning">Somente administradores podem gerenciar permissões por unidade.</Alert>
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
                <FormularioPermissoesUnidade usuario={usuarioAlvo} />
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
