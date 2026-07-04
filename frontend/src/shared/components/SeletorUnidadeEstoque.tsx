import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import { useUnidadeEstoque } from '../../app/providers/ContextoUnidadeEstoque';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';

type Props = {
  compacto?: boolean;
};

export function SeletorUnidadeEstoque({ compacto = false }: Props) {
  const { cores } = useTemaApp();
  const { contexto, unidadeAtivaId, definirUnidadeAtiva, carregando } = useUnidadeEstoque();

  const unidades = contexto?.unidadesDisponiveis ?? [];
  const unidadeAtiva =
    unidades.find((u) => u.id === unidadeAtivaId) ??
    (contexto && unidadeAtivaId != null
      ? {
          id: contexto.unidadeAtivaId,
          nome: contexto.unidadeAtivaNome,
          sigla: contexto.unidadeAtivaSigla,
        }
      : null);

  if (!unidadeAtiva) return null;

  const rotuloCompleto = `${unidadeAtiva.sigla} — ${unidadeAtiva.nome}`;

  if (unidades.length > 1) {
    function aoMudar(e: SelectChangeEvent<number>) {
      definirUnidadeAtiva(Number(e.target.value));
    }

    return (
      <FormControl size="small" sx={{ minWidth: compacto ? 120 : 160 }}>
        <InputLabel id="seletor-unidade-label" sx={{ color: cores.textMuted }}>
          Unidade
        </InputLabel>
        <Select
          labelId="seletor-unidade-label"
          label="Unidade"
          value={unidadeAtivaId ?? ''}
          onChange={aoMudar}
          disabled={carregando || unidadeAtivaId == null}
          sx={{
            color: cores.textPrimary,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: cores.borderForte },
          }}
        >
          {unidades.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.sigla} — {u.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <Chip
      icon={<WarehouseOutlinedIcon />}
      label={`Unidade: ${rotuloCompleto}`}
      size="small"
      title={rotuloCompleto}
      sx={{
        height: 36,
        fontWeight: 700,
        color: cores.textPrimary,
        bgcolor: `${cores.accent}1f`,
        border: `1px solid ${cores.borderForte}`,
        '& .MuiChip-icon': { color: cores.chipIcon },
        '& .MuiChip-label': {
          px: 1,
          maxWidth: { xs: 140, sm: 220 },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    />
  );
}
