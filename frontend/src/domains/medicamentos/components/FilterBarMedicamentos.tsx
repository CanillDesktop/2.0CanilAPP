import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { estilosCampoFiltro, estilosLabelFiltro } from '../../../shared/theme/estilosCampos';
import {
  OPCOES_PRIORIDADE_MEDICAMENTO_FILTRO,
  OPCOES_PUBLICO_ALVO_MEDICAMENTO_FILTRO,
} from '../constants/opcoesFiltroMedicamento';
import type { MedicamentoStatusEstoqueFiltro } from '../types/tiposMedicamentos';

const MotionButton = motion(Button);

type FilterBarMedicamentosProps = {
  busca: string;
  prioridade: 'todas' | string;
  publicoAlvo: 'todos' | string;
  status: MedicamentoStatusEstoqueFiltro;
  dataEntrega: string;
  dataValidade: string;
  onBuscaChange: (valor: string) => void;
  onPrioridadeChange: (valor: string) => void;
  onPublicoAlvoChange: (valor: string) => void;
  onStatusChange: (valor: MedicamentoStatusEstoqueFiltro) => void;
  onDataEntregaChange: (valor: string) => void;
  onDataValidadeChange: (valor: string) => void;
  onLimpar: () => void;
  onNovoMedicamento: () => void;
};

export function FilterBarMedicamentos({
  busca,
  prioridade,
  publicoAlvo,
  status,
  dataEntrega,
  dataValidade,
  onBuscaChange,
  onPrioridadeChange,
  onPublicoAlvoChange,
  onStatusChange,
  onDataEntregaChange,
  onDataValidadeChange,
  onLimpar,
  onNovoMedicamento,
}: FilterBarMedicamentosProps) {
  const { cores } = useTemaApp();
  const inputSx = estilosCampoFiltro(cores);
  const labelSx = estilosLabelFiltro(cores);

  function handleStatusChange(e: SelectChangeEvent) {
    onStatusChange(e.target.value as MedicamentoStatusEstoqueFiltro);
  }

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: cores.bgCard,
        border: `1px solid ${cores.border}`,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            placeholder="Buscar por código, descrição, fórmula, NF-e ou lote"
            variant="outlined"
            size="small"
            fullWidth
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            sx={inputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={labelSx}>Prioridade</InputLabel>
            <Select
              label="Prioridade"
              value={prioridade}
              onChange={(e) => onPrioridadeChange(e.target.value)}
              sx={inputSx}
            >
              <MenuItem value="todas">Todas</MenuItem>
              {OPCOES_PRIORIDADE_MEDICAMENTO_FILTRO.map((opcao) => (
                <MenuItem key={opcao.valor} value={String(opcao.valor)}>
                  {opcao.rotulo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={labelSx}>Público-alvo</InputLabel>
            <Select
              label="Público-alvo"
              value={publicoAlvo}
              onChange={(e) => onPublicoAlvoChange(e.target.value)}
              sx={inputSx}
            >
              <MenuItem value="todos">Todos</MenuItem>
              {OPCOES_PUBLICO_ALVO_MEDICAMENTO_FILTRO.map((opcao) => (
                <MenuItem key={opcao.valor} value={String(opcao.valor)}>
                  {opcao.rotulo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={labelSx}>Status</InputLabel>
            <Select label="Status" value={status} onChange={handleStatusChange} sx={inputSx}>
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativo">Ativos</MenuItem>
              <MenuItem value="a_vencer">A vencer</MenuItem>
              <MenuItem value="baixo">Baixo estoque</MenuItem>
              <MenuItem value="sem_estoque">Sem estoque</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: { md: 'flex-end' }, height: '100%' }}>
            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={onNovoMedicamento}
              sx={{
                minHeight: 40,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                width: { xs: '100%', md: 'auto' },
                backgroundColor: cores.accent,
                color: cores.textOnAccent,
                '&:hover': {
                  backgroundColor: cores.accentHover,
                },
              }}
            >
              Novo medicamento
            </MotionButton>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="date"
            label="Data de entrega"
            value={dataEntrega}
            onChange={(e) => onDataEntregaChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="date"
            label="Data de validade"
            value={dataValidade}
            onChange={(e) => onDataValidadeChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Button variant="text" onClick={onLimpar} sx={{ color: cores.focus, fontWeight: 600, textTransform: 'none' }}>
              Limpar filtros
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
