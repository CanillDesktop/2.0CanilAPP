import { LoadingButton } from '@mui/lab';
import { Box, Button, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEstilosListagem } from '../../theme/useEstilosListagem';

type Props = {
  passoAtual: number;
  totalPassos: number;
  carregando?: boolean;
  podeAvancar?: boolean;
  podeSalvar?: boolean;
  rotuloSalvar: string;
  onCancelar: () => void;
  onPassoAnterior: () => void;
  onProximoPasso: () => void;
  onSubmit?: () => void;
};

export function BarraAcoesFormulario({
  passoAtual,
  totalPassos,
  carregando,
  podeAvancar = true,
  podeSalvar = true,
  rotuloSalvar,
  onCancelar,
  onPassoAnterior,
  onProximoPasso,
  onSubmit,
}: Props) {
  const { cores } = useEstilosListagem();
  const ultimoPasso = passoAtual >= totalPassos - 1;

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        mt: 2,
        py: 2,
        px: { xs: 0, sm: 0.5 },
        bgcolor: alpha(cores.bgShell, 0.92),
        backdropFilter: 'blur(8px)',
        borderTop: `1px solid ${cores.border}`,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="text"
          onClick={onCancelar}
          sx={{ color: cores.textMuted, textTransform: 'none', fontWeight: 600 }}
        >
          Cancelar
        </Button>

        <Stack direction="row" spacing={1}>
          {passoAtual > 0 ? (
            <Button
              variant="outlined"
              onClick={onPassoAnterior}
              sx={{ borderColor: cores.borderForte, color: cores.textPrimary, textTransform: 'none' }}
            >
              Anterior
            </Button>
          ) : null}

          {!ultimoPasso ? (
            <Button
              variant="contained"
              onClick={onProximoPasso}
              disabled={!podeAvancar}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: cores.accent,
                '&:hover': { bgcolor: cores.accentHover },
              }}
            >
              Próximo
            </Button>
          ) : (
            <LoadingButton
              type="submit"
              variant="contained"
              loading={carregando}
              disabled={!podeSalvar || carregando}
              onClick={onSubmit}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: cores.accent,
                '&:hover': { bgcolor: cores.accentHover },
              }}
            >
              {rotuloSalvar}
            </LoadingButton>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
