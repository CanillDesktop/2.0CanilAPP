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

const MotionButton = motion(Button);

type StatusInsumo = 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer';

type FilterBarInsumosProps = {
  busca: string;
  unidade: string;
  status: 'todos' | StatusInsumo;
  unidades: string[];
  onBuscaChange: (valor: string) => void;
  onUnidadeChange: (valor: string) => void;
  onStatusChange: (valor: 'todos' | StatusInsumo) => void;
  onNovoInsumo: () => void;
};

export function FilterBarInsumos({
  busca,
  unidade,
  status,
  unidades,
  onBuscaChange,
  onUnidadeChange,
  onStatusChange,
  onNovoInsumo,
}: FilterBarInsumosProps) {
  const { cores } = useTemaApp();
  const inputSx = estilosCampoFiltro(cores);
  const labelSx = estilosLabelFiltro(cores);

  function handleStatusChange(e: SelectChangeEvent) {
    onStatusChange(e.target.value as 'todos' | StatusInsumo);
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
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            placeholder="Buscar por nome ou código"
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
        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={labelSx}>Unidade</InputLabel>
            <Select label="Unidade" value={unidade} onChange={(e) => onUnidadeChange(e.target.value)} sx={inputSx}>
              <MenuItem value="todas">Todas</MenuItem>
              {unidades.map((u) => (
                <MenuItem key={u} value={u}>
                  Unidade {u}
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
              onClick={onNovoInsumo}
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
              Novo insumo
            </MotionButton>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
