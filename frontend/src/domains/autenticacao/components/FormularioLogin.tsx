import type { FormEvent } from 'react';
import { useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useAcaoLogin } from '../hooks/useAcaoLogin';

type Props = {
  aoAutenticar: () => void;
};

export function FormularioLogin({ aoAutenticar }: Props) {
  const { cores } = useTemaApp();
  const campoSx = estilosCampoFormulario(cores, { semAnelFoco: true });
  const { entrar, carregando, erro, errosValidacao } = useAcaoLogin();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    const ok = await entrar({ login, senha });
    if (ok) aoAutenticar();
  }

  return (
    <Paper
      component="form"
      onSubmit={aoEnviar}
      elevation={0}
      sx={{
        width: '100%',
        minHeight: { xs: 'auto', md: 540 },
        p: { xs: 3, sm: 4.5 },
        borderRadius: 4,
        border: `1px solid ${cores.borderForte}`,
        backgroundColor: cores.bgCard,
        boxShadow: cores.sombraCard,
        backdropFilter: 'blur(18px)',
      }}
    >
      <Stack sx={{ gap: 3, height: '100%', justifyContent: 'center' }}>
        <Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              display: 'grid',
              placeItems: 'center',
              mb: 2,
              borderRadius: 3,
              backgroundColor: `${cores.accent}2e`,
              color: cores.chipIcon,
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h4" sx={{ color: cores.textPrimary, fontWeight: 800, letterSpacing: -0.5 }}>
            Entrar
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: cores.textSecondary }}>
            Informe suas credenciais para acessar o painel administrativo.
          </Typography>
        </Box>

        {(erro || errosValidacao?.length) && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {erro ?? MSG_ERRO.validacaoResumo}
            {errosValidacao?.length ? (
              <Box component="ul" sx={{ pl: 2.2, my: erro ? 1 : 0 }}>
                {errosValidacao.map((mensagem) => (
                  <li key={mensagem}>{mensagem}</li>
                ))}
              </Box>
            ) : null}
          </Alert>
        )}

        <Stack sx={{ gap: 2 }}>
          <TextField
            label="E-mail (login)"
            type="email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            required
            fullWidth
            sx={campoSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <CampoSenha
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
            sx={campoSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        <Button
          type="submit"
          disabled={carregando}
          variant="contained"
          size="large"
          startIcon={carregando ? <CircularProgress size={18} color="inherit" /> : <LoginOutlinedIcon />}
          sx={{
            minHeight: 48,
            borderRadius: 2,
            fontWeight: 800,
            textTransform: 'none',
            backgroundColor: cores.accent,
            color: cores.textOnAccent,
            '&:hover': {
              backgroundColor: cores.accentHover,
            },
            '&:disabled': {
              backgroundColor: `${cores.accent}6b`,
              color: `${cores.textOnAccent}b8`,
            },
          }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </Button>

        <Typography variant="body2" sx={{ color: cores.textSecondary, textAlign: 'center' }}>
          Ainda não tem acesso?{' '}
          <Box
            component={Link}
            to="/cadastro"
            sx={{
              color: cores.focus,
              fontWeight: 700,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Criar conta
          </Box>
        </Typography>
      </Stack>
    </Paper>
  );
}
