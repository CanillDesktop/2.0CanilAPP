import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Chip,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTemaApp } from '../../../../app/providers/ContextoTemaApp';
import { estilosCampoFiltro } from '../../../../shared/theme/estilosCampos';
import type { UsuarioResumoFiltroDto } from '../../../usuarios/types/tiposUsuarios';
import type { PeriodoRapidoRetiradasDto } from '../../types/tiposEstoque';
import { rotuloFusoBrasilia } from '../../../../shared/utils/fusoBrasilia';

type Props = {
  expandido: boolean;
  onExpandidoChange: (expandido: boolean) => void;
  carregando: boolean;
  usarIntervaloLivre: boolean;
  onUsarIntervaloLivreChange: (valor: boolean) => void;
  periodoRapido: PeriodoRapidoRetiradasDto;
  onPeriodoRapidoChange: (valor: PeriodoRapidoRetiradasDto) => void;
  dataIni: string;
  onDataIniChange: (valor: string) => void;
  dataFim: string;
  onDataFimChange: (valor: string) => void;
  idRetirante: number | null;
  onIdRetiranteChange: (valor: number | null) => void;
  idRecebedor: number | null;
  onIdRecebedorChange: (valor: number | null) => void;
  termoBusca: string;
  onTermoBuscaChange: (valor: string) => void;
  usuariosResumo: UsuarioResumoFiltroDto[];
  faixaTituloHumano: string | null;
  filtrosAtivos: number;
};

export function PainelFiltrosHistoricoRetiradas({
  expandido,
  onExpandidoChange,
  carregando,
  usarIntervaloLivre,
  onUsarIntervaloLivreChange,
  periodoRapido,
  onPeriodoRapidoChange,
  dataIni,
  onDataIniChange,
  dataFim,
  onDataFimChange,
  idRetirante,
  onIdRetiranteChange,
  idRecebedor,
  onIdRecebedorChange,
  termoBusca,
  onTermoBuscaChange,
  usuariosResumo,
  faixaTituloHumano,
  filtrosAtivos,
}: Props) {
  const { cores } = useTemaApp();
  const sxCampoFiltro = estilosCampoFiltro(cores);

  return (
    <Accordion
      expanded={expandido}
      onChange={(_, aberto) => onExpandidoChange(aberto)}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        border: `1px solid ${cores.border}`,
        borderRadius: '12px !important',
        '&:before': { display: 'none' },
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: cores.textMuted }} />}
        sx={{
          minHeight: 52,
          px: 2,
          '& .MuiAccordionSummary-content': { my: 1.25, alignItems: 'center', gap: 1 },
        }}
      >
        <FilterListIcon sx={{ color: cores.chipIcon, fontSize: 22 }} />
        <Typography sx={{ color: cores.textPrimary, fontWeight: 700 }}>Filtros</Typography>
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
        {carregando ? <CircularProgress size={18} sx={{ ml: 'auto', mr: 1 }} /> : null}
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2.5 }}>
        <Stack spacing={2.2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={usarIntervaloLivre}
                  onChange={(_, c) => onUsarIntervaloLivreChange(c)}
                />
              }
              label={`Intervalo livre (${rotuloFusoBrasilia})`}
              sx={{ color: cores.textPrimary, '& .MuiFormControlLabel-label': { color: cores.textPrimary } }}
            />
            {!usarIntervaloLivre && (
              <ToggleButtonGroup
                exclusive
                value={periodoRapido}
                onChange={(_, v) => v != null && onPeriodoRapidoChange(v)}
                size="small"
                sx={{
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                    color: cores.textMuted,
                    borderColor: cores.borderForte,
                    '&.Mui-selected': {
                      color: cores.textPrimary,
                      bgcolor: cores.hoverSurface,
                      borderColor: cores.focus,
                    },
                  },
                }}
              >
                <ToggleButton value="HOJE">Hoje</ToggleButton>
                <ToggleButton value="ULTIMOS_7_DIAS">Últimos 7 dias</ToggleButton>
                <ToggleButton value="ULTIMOS_30_DIAS">Últimos 30 dias</ToggleButton>
              </ToggleButtonGroup>
            )}
          </Stack>

          {faixaTituloHumano && (
            <Typography variant="caption" sx={{ color: cores.textSecondary }}>
              Período amostrado nesta consulta ({rotuloFusoBrasilia}): <strong>{faixaTituloHumano}</strong>. Os
              atalhos «Hoje» e «Últimos N dias» também seguem o calendário de Brasília.
            </Typography>
          )}

          {usarIntervaloLivre && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={`Data inicial (${rotuloFusoBrasilia})`}
                type="date"
                size="small"
                value={dataIni}
                onChange={(e) => onDataIniChange(e.target.value)}
                fullWidth
                sx={sxCampoFiltro}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label={`Data final (${rotuloFusoBrasilia})`}
                type="date"
                size="small"
                value={dataFim}
                onChange={(e) => onDataFimChange(e.target.value)}
                fullWidth
                sx={sxCampoFiltro}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Autocomplete
              options={usuariosResumo}
              getOptionLabel={(o) => o.nomeExibicao}
              value={usuariosResumo.find((u) => u.id === idRetirante) ?? null}
              onChange={(_, v) => onIdRetiranteChange(v?.id ?? null)}
              renderInput={(params) => (
                <TextField {...params} label="Quem retirou" size="small" sx={sxCampoFiltro} />
              )}
              slotProps={{
                paper: { sx: { bgcolor: cores.bgCard, border: `1px solid ${cores.border}` } },
              }}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Autocomplete
              options={usuariosResumo}
              getOptionLabel={(o) => o.nomeExibicao}
              value={usuariosResumo.find((u) => u.id === idRecebedor) ?? null}
              onChange={(_, v) => onIdRecebedorChange(v?.id ?? null)}
              renderInput={(params) => (
                <TextField {...params} label="Destinatário (quem recebeu)" size="small" sx={sxCampoFiltro} />
              )}
              slotProps={{
                paper: { sx: { bgcolor: cores.bgCard, border: `1px solid ${cores.border}` } },
              }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>

          <TextField
            size="small"
            label="Busca"
            placeholder="Buscar por ID, produto, lote, usuário ou observação..."
            value={termoBusca}
            onChange={(e) => onTermoBuscaChange(e.target.value)}
            fullWidth
            sx={{
              ...sxCampoFiltro,
              '& .MuiFormHelperText-root': { color: cores.textMuted },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: cores.textMuted, opacity: 0.85 }} />
                  </InputAdornment>
                ),
              },
            }}
            helperText="A busca abrange código, nome, lote, retirante, destinatário, observações e IDs numéricos."
          />

          {usarIntervaloLivre && dataIni > dataFim && (
            <Alert severity="warning">A data inicial não pode ser maior que a data final.</Alert>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export function contarFiltrosHistoricoRetiradasAtivos({
  usarIntervaloLivre,
  periodoRapido,
  idRetirante,
  idRecebedor,
  termoBusca,
}: {
  usarIntervaloLivre: boolean;
  periodoRapido: PeriodoRapidoRetiradasDto;
  idRetirante: number | null;
  idRecebedor: number | null;
  termoBusca: string;
}): number {
  let total = 0;
  if (usarIntervaloLivre) total += 1;
  else if (periodoRapido !== 'ULTIMOS_30_DIAS') total += 1;
  if (idRetirante != null) total += 1;
  if (idRecebedor != null) total += 1;
  if (termoBusca.trim().length > 0) total += 1;
  return total;
}
