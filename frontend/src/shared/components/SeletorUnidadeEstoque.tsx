import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useUnidadeEstoque } from '../../app/providers/ContextoUnidadeEstoque';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';

type Props = {
  compacto?: boolean;
};

export function SeletorUnidadeEstoque({ compacto = false }: Props) {
  const { cores } = useTemaApp();
  const { contexto, unidadeAtivaId, definirUnidadeAtiva, carregando } = useUnidadeEstoque();

  const unidades = contexto?.unidadesDisponiveis ?? [];
  if (unidades.length <= 1) return null;

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
