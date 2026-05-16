import { Chip, type ChipProps } from '@mui/material';

type Props = Omit<ChipProps, 'color' | 'label'> & { status?: string | null };

/** Mapeamento visual de estado da retirada para auditoria rápida. */
export function HistoricoRetiradasStatusChip({ status, sx, ...chipProps }: Props) {
  const normalizado = (status ?? '').trim().toUpperCase() || '—';

  let color: ChipProps['color'] = 'default';
  if (normalizado === 'CONFIRMADA') color = 'success';
  else if (normalizado === 'PENDENTE') color = 'warning';
  else if (normalizado === 'CANCELADA') color = 'error';
  else if (normalizado === 'ESTORNADA') color = 'secondary';

  return (
    <Chip
      {...chipProps}
      size={chipProps.size ?? 'small'}
      variant="filled"
      label={normalizado === '—' ? 'SEM STATUS' : normalizado}
      color={color}
      sx={{
        fontWeight: 700,
        letterSpacing: 0.3,
        textTransform: 'none',
        ...sx,
      }}
    />
  );
}
