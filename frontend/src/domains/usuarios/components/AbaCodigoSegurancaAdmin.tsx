import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
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
import { useEffect, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useCodigoSeguranca } from '../hooks/useCodigoSeguranca';

export function AbaCodigoSegurancaAdmin() {
  const { cores } = useTemaApp();
  const { codigo, carregando, salvando, erro, sucesso, apiDisponivel, salvar } = useCodigoSeguranca(true);
  const [valor, setValor] = useState('');

  useEffect(() => {
    setValor(codigo ?? '');
  }, [codigo]);

  async function aoSalvar() {
    await salvar(valor);
  }

  return (
    <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <LockOutlinedIcon sx={{ color: cores.focus }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                Código de acesso
              </Typography>
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Código exigido no primeiro acesso (pré-login), antes da tela de login. Somente administradores
                podem alterá-lo.
              </Typography>
            </Box>
          </Stack>

          {!apiDisponivel && !carregando ? (
            <Alert severity="warning">
              Não foi possível conectar ao servidor agora. As alterações ficam salvas apenas neste navegador até a
              reconexão.
            </Alert>
          ) : null}

          {erro ? <Alert severity="error">{erro}</Alert> : null}
          {sucesso ? <Alert severity="success">{sucesso}</Alert> : null}

          {carregando ? (
            <Stack direction="row" spacing={1.5} sx={{ py: 2, alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Carregando código…
              </Typography>
            </Stack>
          ) : (
            <>
              <CampoSenha
                label="Código de acesso"
                visivelInicial
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                fullWidth
                disabled={salvando}
                placeholder="Informe o código do sistema"
                helperText="Usuários em primeiro acesso precisam informar este código antes de ver a tela de login. Use de 4 a 64 caracteres, sem espaços."
                sx={estilosCampoFormulario(cores)}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={salvando ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  disabled={salvando || valor.trim() === (codigo ?? '')}
                  onClick={() => void aoSalvar()}
                >
                  Salvar código
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
