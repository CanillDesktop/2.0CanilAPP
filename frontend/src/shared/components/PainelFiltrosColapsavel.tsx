import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';

type PainelFiltrosColapsavelProps = {
  children: ReactNode;
  /** Quantidade de filtros diferentes do padrão (exibida no chip do mobile). */
  filtrosAtivos?: number;
  titulo?: string;
};

/**
 * No mobile, o card de filtros vira accordion (expandir/retrair), no mesmo padrão
 * de histórico de retiradas. No desktop, o conteúdo fica sempre visível.
 */
export function PainelFiltrosColapsavel({
  children,
  filtrosAtivos = 0,
  titulo = 'Filtros',
}: PainelFiltrosColapsavelProps) {
  const { cores } = useTemaApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandido, setExpandido] = useState(false);

  const sxBorda = {
    border: `1px solid ${cores.border}`,
    borderRadius: '12px !important',
    overflow: 'hidden' as const,
  };

  if (!isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: cores.bgCard,
          ...sxBorda,
          borderRadius: 3,
        }}
      >
        {children}
      </Paper>
    );
  }

  return (
    <Accordion
      expanded={expandido}
      onChange={(_, aberto) => setExpandido(aberto)}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: cores.bgCard,
        '&:before': { display: 'none' },
        ...sxBorda,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: cores.textMuted }} />}
        sx={{
          minHeight: 52,
          px: 2,
          '& .MuiAccordionSummary-content': { my: 1.25, alignItems: 'center', gap: 1, flexWrap: 'wrap' },
        }}
      >
        <FilterListIcon sx={{ color: cores.chipIcon ?? cores.focus, fontSize: 22 }} />
        <Typography sx={{ color: cores.textPrimary, fontWeight: 700, flex: 1 }}>
          {titulo}
        </Typography>
        {filtrosAtivos > 0 ? (
          <Chip
            size="small"
            label={`${filtrosAtivos} ativo${filtrosAtivos > 1 ? 's' : ''}`}
            sx={{
              height: 24,
              fontWeight: 700,
              bgcolor: cores.chipBg,
              color: cores.textPrimary,
              border: `1px solid ${cores.chipBorder}`,
            }}
          />
        ) : null}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2.5 }}>{children}</AccordionDetails>
    </Accordion>
  );
}
