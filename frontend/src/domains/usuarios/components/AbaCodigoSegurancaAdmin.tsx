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
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
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
                Código de segurança
              </Typography>
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Código global usado pelo sistema. Somente administradores podem alterá-lo.
              </Typography>
            </Box>
          </Stack>

          {!apiDisponivel && !carregando ? (
            <Alert severity="info">
              A integração com o servidor ainda não está disponível. Alterações ficam salvas localmente neste
              navegador até a API ser implementada.
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
              <TextField
                label="Código de segurança"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                fullWidth
                disabled={salvando}
                placeholder="Informe o código do sistema"
                helperText="Este código será validado em operações sensíveis quando a integração estiver ativa."
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
