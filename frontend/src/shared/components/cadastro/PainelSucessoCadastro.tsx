import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { useEstilosListagem } from '../../theme/useEstilosListagem';

type Props = {
  tituloItem: string;
  nomeItem: string;
  idItem?: number;
  rotuloTipo: string;
  rotaLista: string;
  rotaDetalhe?: string;
  onCadastrarOutro: () => void;
  onIrParaLista: () => void;
  onVerItem?: () => void;
};

export function PainelSucessoCadastro({
  tituloItem,
  nomeItem,
  idItem,
  rotuloTipo,
  rotaLista,
  onCadastrarOutro,
  onIrParaLista,
  onVerItem,
}: Props) {
  const estilos = useEstilosListagem();
  const { cores } = estilos;
  const podeVerItem = idItem != null && onVerItem;

  return (
    <Card
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 3,
        textAlign: 'center',
        bgcolor: cores.metricCardBg,
        border: `1px solid ${cores.metricCardBorder}`,
        boxShadow: cores.sombraCard,
      }}
    >
      <CheckCircleOutlinedIcon sx={{ fontSize: 56, color: cores.accent, mb: 1.5 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary, mb: 0.75 }}>
        {tituloItem}
      </Typography>
      <Typography variant="body1" sx={{ color: cores.textSecondary, mb: 0.5 }}>
        <strong style={{ color: cores.textPrimary }}>{nomeItem}</strong> foi cadastrado com sucesso.
      </Typography>
      <Typography variant="body2" sx={{ color: cores.textMuted, mb: 3 }}>
        Escolha o próximo passo — você não será redirecionado automaticamente.
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {podeVerItem ? (
          <Button
            variant="contained"
            startIcon={<VisibilityOutlinedIcon />}
            onClick={onVerItem}
            sx={estilos.botaoPrimario}
          >
            Ver {rotuloTipo.toLowerCase()}
          </Button>
        ) : null}
        <Button
          variant={podeVerItem ? 'outlined' : 'contained'}
          startIcon={<AddCircleOutlinedIcon />}
          onClick={onCadastrarOutro}
          sx={
            podeVerItem
              ? { borderColor: cores.borderForte, color: cores.textPrimary, textTransform: 'none', fontWeight: 700 }
              : estilos.botaoPrimario
          }
        >
          Cadastrar outro
        </Button>
        <Button
          variant="outlined"
          startIcon={<ListAltOutlinedIcon />}
          onClick={onIrParaLista}
          sx={{ borderColor: cores.borderForte, color: cores.textPrimary, textTransform: 'none', fontWeight: 600 }}
        >
          Ir para lista
        </Button>
      </Stack>

      {!podeVerItem ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: cores.textMuted }}>
            O item já está na listagem em {rotaLista}.
          </Typography>
        </Box>
      ) : null}
    </Card>
  );
}
