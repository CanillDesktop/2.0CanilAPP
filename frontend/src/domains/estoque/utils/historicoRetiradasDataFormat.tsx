import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { FUSO_BRASILIA } from '../../../shared/utils/fusoBrasilia';

/** Formato fixo PT-BR no horário de Brasília (operação diária); UTC continua no tooltip técnico. */
const formatoDataCurta = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: FUSO_BRASILIA,
});

const formatoHoraCurta = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: FUSO_BRASILIA,
});

const formatoUtcIso = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'UTC',
});

export type PartesInstanteAuditavel = {
  /** Data legível em Brasília (dia). */
  dataLocal: string;
  /** Horário legível em Brasília. */
  horaLocal: string;
  /** Texto completo técnico em UTC (auditoria). */
  tecnicoUtc: string;
};

export function partesInstanteAuditavel(iso: string): PartesInstanteAuditavel {
  const d = new Date(iso);
  return {
    dataLocal: formatoDataCurta.format(d),
    horaLocal: formatoHoraCurta.format(d),
    tecnicoUtc: formatoUtcIso.format(d),
  };
}

/** Célula compacta para tabela — data empilhada + horário + ícone tooltip com UTC. */
export function HistoricoRetiradasCelulaData({ iso }: { iso: string }) {
  const { cores } = useTemaApp();
  const p = partesInstanteAuditavel(iso);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.15, minWidth: 0 }}>
        <Typography variant="body2" component="span" sx={{ fontWeight: 650, color: cores.textPrimary, lineHeight: 1.2 }}>
          {p.dataLocal}
        </Typography>
        <Typography variant="caption" sx={{ color: cores.textMuted, letterSpacing: 0.2 }}>
          {p.horaLocal}
        </Typography>
      </Box>
      <Tooltip arrow title={`Referência técnica (UTC): ${p.tecnicoUtc}`}>
        <IconButton size="small" aria-label="Ver referência em UTC" sx={{ color: cores.textMuted }}>
          <InfoOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
