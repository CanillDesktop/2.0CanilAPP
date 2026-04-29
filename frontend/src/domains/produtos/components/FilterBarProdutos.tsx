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
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

type FilterBarProdutosProps = {
  busca: string;
  categoria: string;
  status: 'todos' | 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer';
  categorias: string[];
  onBuscaChange: (valor: string) => void;
  onCategoriaChange: (valor: string) => void;
  onStatusChange: (valor: 'todos' | 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer') => void;
  onNovoProduto: () => void;
};

export function FilterBarProdutos({
  busca,
  categoria,
  status,
  categorias,
  onBuscaChange,
  onCategoriaChange,
  onStatusChange,
  onNovoProduto,
}: FilterBarProdutosProps) {
  const theme = useTheme();

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: '#020617',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(148,163,184,0.5)',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(125,211,252,0.75)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#38bdf8',
        boxShadow: `0 0 0 2px rgba(56,189,248,0.22)`,
      },
    },
    '& .MuiInputBase-input': {
      color: theme.palette.common.white,
    },
    '& .MuiInputLabel-root': {
      color: '#cbd5e1',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#7dd3fc',
    },
    '& .MuiSelect-icon': {
      color: '#cbd5e1',
    },
    '& .MuiSelect-select': {
      color: '#f8fafc',
    },
  };

  const labelSx = {
    color: '#cbd5e1',
    backgroundColor: '#0f172a',
    px: 0.5,
    '&.Mui-focused': {
      color: '#7dd3fc',
    },
  };

  function handleStatusChange(e: SelectChangeEvent) {
    onStatusChange(e.target.value as 'todos' | 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer');
  }

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            placeholder="Buscar por nome ou codigo"
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
            <InputLabel sx={labelSx}>Categoria</InputLabel>
            <Select label="Categoria" value={categoria} onChange={(e) => onCategoriaChange(e.target.value)} sx={inputSx}>
              <MenuItem value="todas">Todas</MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  Categoria {cat}
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
              onClick={onNovoProduto}
              sx={{
                minHeight: 40,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                width: { xs: '100%', md: 'auto' },
                backgroundColor: '#2563eb',
                color: '#f8fafc',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
              }}
            >
              Novo Produto
            </MotionButton>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
