import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { estilosCampoFiltro } from '../../../shared/theme/estilosCampos';
import type { FiltrosUsuariosListagem } from '../types/tiposUsuarios';

type StatusFiltro = NonNullable<FiltrosUsuariosListagem['status']>;

type Props = {
  expandido: boolean;
  onExpandidoChange: (expandido: boolean) => void;
  buscaInput: string;
  onBuscaInputChange: (valor: string) => void;
  status: StatusFiltro;
  onStatusChange: (valor: StatusFiltro) => void;
  filtrosAtivos: number;
  carregandoLista: boolean;
  carregandoAcao: boolean;
  onCadastrar?: () => void;
  tituloAccordion?: string;
};

export function contarFiltrosGestaoUsuariosAtivos(busca: string, status: StatusFiltro) {
  let n = 0;
  if (busca.trim()) n += 1;
  if (status !== 'ativos') n += 1;
  return n;
}

export function PainelFiltrosGestaoUsuarios({
  expandido,
  onExpandidoChange,
  buscaInput,
  onBuscaInputChange,
  status,
  onStatusChange,
  filtrosAtivos,
  carregandoLista,
  carregandoAcao,
  onCadastrar,
  tituloAccordion = 'Filtros e cadastro',
}: Props) {
  const { cores } = useTemaApp();
  const sxCampo = estilosCampoFiltro(cores);

  return (
    <Accordion
      expanded={expandido}
      onChange={(_, aberto) => onExpandidoChange(aberto)}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        '&:before': { display: 'none' },
        border: `1px solid ${cores.border}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: cores.textMuted }} />}
        sx={{
          minHeight: 52,
          px: 2,
          '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1, my: 1 },
        }}
      >
        <FilterListIcon sx={{ color: cores.focus, fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: cores.textPrimary, flex: 1 }}>
          {tituloAccordion}
        </Typography>
        {filtrosAtivos > 0 ? (
          <Chip
            size="small"
            label={`${filtrosAtivos} filtro${filtrosAtivos > 1 ? 's' : ''} ativo${filtrosAtivos > 1 ? 's' : ''}`}
            sx={{ bgcolor: cores.hoverSurfaceStrong, color: cores.textPrimary, fontWeight: 600 }}
          />
        ) : null}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
            <TextField
              label="Buscar por nome/email"
              value={buscaInput}
              onChange={(e) => onBuscaInputChange(e.target.value)}
              fullWidth
              disabled={carregandoLista}
              sx={sxCampo}
            />
            <TextField
              label="Status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as StatusFiltro)}
              select
              sx={{ minWidth: { xs: '100%', md: 200 }, ...sxCampo }}
              disabled={carregandoLista}
            >
              <MenuItem value="ativos">Ativos</MenuItem>
              <MenuItem value="inativos">Inativos</MenuItem>
              <MenuItem value="todos">Todos (ativos + inativos)</MenuItem>
              <MenuItem value="excluidos">Excluídos</MenuItem>
            </TextField>
            {onCadastrar ? (
              <Button
                variant="contained"
                onClick={onCadastrar}
                disabled={carregandoAcao || carregandoLista}
                sx={{ whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', md: 'center' } }}
              >
                Cadastrar usuário
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
