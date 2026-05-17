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
import { useAcaoLogin } from '../hooks/useAcaoLogin';

type Props = {
  aoAutenticar: () => void;
};

export function FormularioLogin({ aoAutenticar }: Props) {
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
        border: '1px solid rgba(148, 163, 184, 0.18)',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        boxShadow: '0 26px 80px rgba(0, 0, 0, 0.42)',
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
              backgroundColor: 'rgba(37, 99, 235, 0.18)',
              color: '#93c5fd',
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h4" sx={{ color: '#e2e8f0', fontWeight: 800, letterSpacing: -0.5 }}>
            Entrar
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'rgba(203, 213, 225, 0.82)' }}>
            Informe suas credenciais para acessar o painel administrativo.
          </Typography>
        </Box>

        {(erro || errosValidacao?.length) && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {erro}
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
          <TextField
            label="Senha"
            type="password"
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
            backgroundColor: '#2563eb',
            color: '#f8fafc',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
            '&:disabled': {
              backgroundColor: 'rgba(37, 99, 235, 0.42)',
              color: 'rgba(248, 250, 252, 0.72)',
            },
          }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </Button>

        <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.78)', textAlign: 'center' }}>
          Ainda nao tem acesso?{' '}
          <Box
            component={Link}
            to="/cadastro"
            sx={{
              color: '#7dd3fc',
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

const campoSx = {
  '& .MuiInputLabel-root': {
    color: '#cbd5e1',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#7dd3fc',
  },
  '& .MuiInputBase-input': {
    color: '#f8fafc',
  },
  '& .MuiInputAdornment-root': {
    color: '#94a3b8',
  },
  '& .MuiOutlinedInput-root': {
    minHeight: 54,
    borderRadius: 2,
    backgroundColor: '#020617',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(148, 163, 184, 0.5)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(125, 211, 252, 0.75)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#38bdf8',
      boxShadow: '0 0 0 2px rgba(56, 189, 248, 0.22)',
    },
  },
};
