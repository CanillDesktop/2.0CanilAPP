import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { usePreLogin } from '../hooks/usePreLogin';

export function PaginaPreLogin() {
  const { autenticado } = useAutenticacao();
  const { cores } = useTemaApp();
  const navegar = useNavigate();
  const { validar, carregando, erro } = usePreLogin();
  const [codigo, setCodigo] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Após um erro, mantém o foco no campo para correção imediata.
  useEffect(() => {
    if (erro) inputRef.current?.focus();
  }, [erro]);

  if (autenticado) return <Navigate to="/" replace />;

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    if (carregando) return;
    const ok = await validar(codigo);
    if (ok) navegar('/login', { replace: true });
  }

  return (
    <Box
      component="main"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
        background: cores.gradienteLogin,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.66)',
          backdropFilter: 'blur(2px)',
          zIndex: 0,
        }}
      />

      <Paper
        component="form"
        onSubmit={aoEnviar}
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: `1px solid ${cores.borderForte}`,
          backgroundColor: cores.bgCard,
          boxShadow: cores.sombraCard,
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 3,
                backgroundColor: `${cores.accent}2e`,
                color: cores.chipIcon,
              }}
            >
              <LockPersonOutlinedIcon />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary }}>
              Acesso restrito
            </Typography>
            <Typography variant="body2" sx={{ color: cores.textSecondary }}>
              Informe o código de acesso para continuar até a tela de login.
            </Typography>
          </Stack>

          {erro ? (
            <Alert severity="error" sx={{ borderRadius: 2 }} role="alert">
              {erro}
            </Alert>
          ) : null}

          <CampoSenha
            inputRef={inputRef}
            label="Código de acesso"
            visivelInicial
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            fullWidth
            autoFocus
            autoComplete="off"
            disabled={carregando}
            placeholder="Digite o código"
            sx={estilosCampoFormulario(cores)}
            slotProps={{ htmlInput: { 'aria-label': 'Código de acesso', autoCapitalize: 'none', spellCheck: false } }}
          />

          <Button
            type="submit"
            disabled={carregando}
            variant="contained"
            size="large"
            startIcon={carregando ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{
              minHeight: 48,
              borderRadius: 2,
              fontWeight: 800,
              textTransform: 'none',
              backgroundColor: cores.accent,
              color: cores.textOnAccent,
              '&:hover': { backgroundColor: cores.accentHover },
              '&:disabled': {
                backgroundColor: `${cores.accent}6b`,
                color: `${cores.textOnAccent}b8`,
              },
            }}
          >
            {carregando ? 'Validando...' : 'Continuar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
