import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useCodigoSeguranca } from '../hooks/useCodigoSeguranca';

export function AbaCodigoAtualLeitura() {
  const { cores } = useTemaApp();
  const { codigo, carregando, erro, apiDisponivel } = useCodigoSeguranca(false);

  const exibicao = codigo?.trim() ? codigo : '—';

  return (
    <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <VisibilityOutlinedIcon sx={{ color: cores.focus }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                Código atual
              </Typography>
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Visualização somente leitura do código de segurança vigente no sistema.
              </Typography>
            </Box>
          </Stack>

          {!apiDisponivel && !carregando ? (
            <Alert severity="info">
              O código será obtido automaticamente do servidor quando a integração estiver disponível.
            </Alert>
          ) : null}

          {erro ? <Alert severity="warning">{erro}</Alert> : null}

          {carregando ? (
            <Stack direction="row" spacing={1.5} sx={{ py: 2, alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Carregando código…
              </Typography>
            </Stack>
          ) : (
            <TextField
              label="Código atual do sistema"
              value={exibicao}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
              helperText="Você não tem permissão para alterar este código."
              sx={{
                ...estilosCampoFormulario(cores),
                '& .MuiInputBase-input': { fontWeight: 700, letterSpacing: 1.5, fontFamily: 'monospace' },
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
