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
import { podeGerenciarPermissoesUsuarios } from '../../../shared/utils/possuiPermissao';
import { FormularioPermissoesUnidade } from '../components/FormularioPermissoesUnidade';
import { usuariosService } from '../services/usuariosService';
import { descreverCargo } from '../utils/exibirPerfilUsuario';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';

export function PaginaPermissoesUsuarios() {
  const { usuario } = useAutenticacao();
  const { cores } = useTemaApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const podeGerenciar = podeGerenciarPermissoesUsuarios(usuario);

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
    if (!podeGerenciar || !usuarioIdParam) {
      setUsuarioAlvo(null);
      return;
    }
    void carregarUsuario(usuarioIdParam);
  }, [carregarUsuario, podeGerenciar, usuarioIdParam]);

  function voltarParaUsuarios() {
    navigate('/usuarios?aba=permissoes');
  }

  return (
    <ShellComSidebar
      titulo="Permissões do usuário"
      subtitulo="Cargo do usuário e vínculos por unidade de estoque (Secretaria / Canil)"
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
          <Alert severity="warning">Você não tem permissão para gerenciar permissões de usuários.</Alert>
        ) : !usuarioIdParam ? (
          <Alert severity="info">
            Nenhum usuário selecionado. Volte à aba Permissões unidade e escolha um usuário na listagem.
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
                <Stack spacing={2}>
                  <Alert severity="info">
                    <strong>Cargo:</strong> {descreverCargo(usuarioAlvo)}. Para alterar permissões globais, edite o cargo
                    em{' '}
                    <Box component={Link} to="/cargos" sx={{ color: cores.focus, fontWeight: 600 }}>
                      Cargos
                    </Box>{' '}
                    ou mude o cargo do usuário em Usuários.
                  </Alert>
                  <FormularioPermissoesUnidade usuario={usuarioAlvo} />
                </Stack>
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
