import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

export type Lote = {
  id: string;
  codigo: string;
  quantidade: number;
  validade: string;
};

function obterStatusValidade(validadeIso: string): {
  label: string;
  color: 'success' | 'warning' | 'error';
} {
  const validade = new Date(validadeIso);
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() + 30);

  if (validade < hoje) return { label: 'Vencido', color: 'error' };
  if (validade <= limite) return { label: 'A vencer', color: 'error' };
  return { label: 'Valido', color: 'success' };
}

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export function LoteItem({ lote, onRegistrarRetirada }: { lote: Lote; onRegistrarRetirada?: (lote: Lote) => void }) {
  const theme = useTheme();
  const ehMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const status = obterStatusValidade(lote.validade);
  const validade = new Date(lote.validade);
  const validadeFormatada = validade.toLocaleDateString('pt-BR');

  if (ehMobile) {
    return (
      <MotionCard whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.2 }} sx={{ borderRadius: 2.5 }}>
        <CardContent>
          <Stack sx={{ gap: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Lote {lote.codigo}
              </Typography>
              <Chip label={status.label} color={status.color} size="small" />
            </Stack>
            <Typography variant="body2">Qtd: {lote.quantidade}</Typography>
            <Tooltip title={validade.toLocaleString('pt-BR')}>
              <Typography variant="body2">Validade: {validadeFormatada}</Typography>
            </Tooltip>
            <Button variant="contained" size="small" onClick={() => onRegistrarRetirada?.(lote)} disabled={lote.quantidade <= 0}>
              Registrar retirada
            </Button>
          </Stack>
        </CardContent>
      </MotionCard>
    );
  }

  return (
    <MotionBox
      whileHover={{ y: -1, scale: 1.002 }}
      transition={{ duration: 0.2 }}
      sx={{
        p: 1.4,
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.2 }}>
          <WarningAmberOutlinedIcon fontSize="small" color={status.color} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Lote {lote.codigo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Qtd: {lote.quantidade}
          </Typography>
          <Tooltip title={validade.toLocaleString('pt-BR')}>
            <Typography variant="body2" color="text.secondary">
              Validade: {validadeFormatada}
            </Typography>
          </Tooltip>
        </Stack>
        <Chip label={status.label} color={status.color} size="small" />
      </Stack>
      <Box sx={{ mt: 1 }}>
        <Button variant="contained" size="small" onClick={() => onRegistrarRetirada?.(lote)} disabled={lote.quantidade <= 0}>
          Registrar retirada
        </Button>
      </Box>
    </MotionBox>
  );
}
