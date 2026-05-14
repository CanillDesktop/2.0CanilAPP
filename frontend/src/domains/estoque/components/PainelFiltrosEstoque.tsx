import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

type Props = {
  isMobile: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFiltro: '' | LinhaOperacionalEstoque['status'];
  onStatusChange: (value: '' | LinhaOperacionalEstoque['status']) => void;
  qtdMin: string;
  onQtdMinChange: (value: string) => void;
  qtdMax: string;
  onQtdMaxChange: (value: string) => void;
  validadeDe: string;
  onValidadeDeChange: (value: string) => void;
  validadeAte: string;
  onValidadeAteChange: (value: string) => void;
  movDe: string;
  onMovDeChange: (value: string) => void;
  movAte: string;
  onMovAteChange: (value: string) => void;
  onLimpar: () => void;
  filtrosAtivos: boolean;
};

const sxField = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'rgba(2, 6, 23, 0.55)',
    color: '#e2e8f0',
    '& fieldset': { borderColor: 'rgba(148,163,184,0.25)' },
  },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiInputBase-input': { color: '#e2e8f0' },
};

type CamposFiltrosProps = {
  statusFiltro: '' | LinhaOperacionalEstoque['status'];
  onStatusChange: (value: '' | LinhaOperacionalEstoque['status']) => void;
  qtdMin: string;
  onQtdMinChange: (value: string) => void;
  qtdMax: string;
  onQtdMaxChange: (value: string) => void;
  validadeDe: string;
  onValidadeDeChange: (value: string) => void;
  validadeAte: string;
  onValidadeAteChange: (value: string) => void;
  movDe: string;
  onMovDeChange: (value: string) => void;
  movAte: string;
  onMovAteChange: (value: string) => void;
};

function CamposFiltros({
  statusFiltro,
  onStatusChange,
  qtdMin,
  onQtdMinChange,
  qtdMax,
  onQtdMaxChange,
  validadeDe,
  onValidadeDeChange,
  validadeAte,
  onValidadeAteChange,
  movDe,
  onMovDeChange,
  movAte,
  onMovAteChange,
}: CamposFiltrosProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth size="small" sx={sxField}>
          <InputLabel id="filtro-status">Status</InputLabel>
          <Select
            labelId="filtro-status"
            label="Status"
            value={statusFiltro}
            onChange={(e) => onStatusChange(e.target.value as '' | LinhaOperacionalEstoque['status'])}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ok">OK</MenuItem>
            <MenuItem value="baixo">Abaixo do mínimo</MenuItem>
            <MenuItem value="proximo_vencimento">Próximo vencimento</MenuItem>
            <MenuItem value="critico">Crítico</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Qtd. mín."
          type="number"
          value={qtdMin}
          onChange={(e) => onQtdMinChange(e.target.value)}
          sx={sxField}
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Qtd. máx."
          type="number"
          value={qtdMax}
          onChange={(e) => onQtdMaxChange(e.target.value)}
          sx={sxField}
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <TextField
          fullWidth
          size="small"
          label="Validade (de)"
          type="date"
          value={validadeDe}
          onChange={(e) => onValidadeDeChange(e.target.value)}
          sx={sxField}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <TextField
          fullWidth
          size="small"
          label="Validade (até)"
          type="date"
          value={validadeAte}
          onChange={(e) => onValidadeAteChange(e.target.value)}
          sx={sxField}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <TextField
          fullWidth
          size="small"
          label="Movimentação (de)"
          type="date"
          value={movDe}
          onChange={(e) => onMovDeChange(e.target.value)}
          sx={sxField}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <TextField
          fullWidth
          size="small"
          label="Movimentação (até)"
          type="date"
          value={movAte}
          onChange={(e) => onMovAteChange(e.target.value)}
          sx={sxField}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
    </Grid>
  );
}

export function PainelFiltrosEstoque({
  isMobile,
  search,
  onSearchChange,
  statusFiltro,
  onStatusChange,
  qtdMin,
  onQtdMinChange,
  qtdMax,
  onQtdMaxChange,
  validadeDe,
  onValidadeDeChange,
  validadeAte,
  onValidadeAteChange,
  movDe,
  onMovDeChange,
  movAte,
  onMovAteChange,
  onLimpar,
  filtrosAtivos,
}: Props) {
  const camposAvancados = (
    <CamposFiltros
      statusFiltro={statusFiltro}
      onStatusChange={onStatusChange}
      qtdMin={qtdMin}
      onQtdMinChange={onQtdMinChange}
      qtdMax={qtdMax}
      onQtdMaxChange={onQtdMaxChange}
      validadeDe={validadeDe}
      onValidadeDeChange={onValidadeDeChange}
      validadeAte={validadeAte}
      onValidadeAteChange={onValidadeAteChange}
      movDe={movDe}
      onMovDeChange={onMovDeChange}
      movAte={movAte}
      onMovAteChange={onMovAteChange}
    />
  );

  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        size="small"
        label="Buscar por nome"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Digite para filtrar..."
        sx={{
          ...sxField,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'rgba(2, 6, 23, 0.55)',
            color: '#e2e8f0',
            '& fieldset': {
              borderColor: filtrosAtivos ? 'rgba(59,130,246,0.55)' : 'rgba(148,163,184,0.25)',
            },
          },
        }}
      />

      {isMobile ? (
        <Accordion
          defaultExpanded={false}
          sx={{
            bgcolor: '#0f172a',
            border: '1px solid rgba(148,163,184,0.16)',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<FilterListIcon sx={{ color: '#94a3b8' }} />}>
            <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>Filtros avançados</Typography>
          </AccordionSummary>
          <AccordionDetails>{camposAvancados}</AccordionDetails>
        </Accordion>
      ) : (
        <Box>{camposAvancados}</Box>
      )}

      <Box>
        <Button variant="text" onClick={onLimpar} sx={{ color: '#93c5fd', fontWeight: 600 }}>
          Limpar filtros
        </Button>
      </Box>
    </Stack>
  );
}
