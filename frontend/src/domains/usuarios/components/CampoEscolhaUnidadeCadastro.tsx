import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import type { EscolhaUnidadeCadastro } from '../../estoque/constants/unidadesEstoque';
import { ROTULOS_UNIDADE_CADASTRO } from '../../estoque/constants/unidadesEstoque';

type Props = {
  valor: EscolhaUnidadeCadastro;
  onChange: (valor: EscolhaUnidadeCadastro) => void;
  obrigatorio?: boolean;
  helperText?: string;
};

export function CampoEscolhaUnidadeCadastro({
  valor,
  onChange,
  obrigatorio = true,
  helperText = 'Define em qual unidade o usuário atuará no estoque.',
}: Props) {
  return (
    <FormControl fullWidth required={obrigatorio}>
      <InputLabel id="unidade-cadastro-label">Unidade de atuação</InputLabel>
      <Select
        labelId="unidade-cadastro-label"
        label="Unidade de atuação"
        value={valor}
        onChange={(e) => onChange(e.target.value as EscolhaUnidadeCadastro)}
      >
        {(Object.keys(ROTULOS_UNIDADE_CADASTRO) as EscolhaUnidadeCadastro[]).map((chave) => (
          <MenuItem key={chave} value={chave}>
            {ROTULOS_UNIDADE_CADASTRO[chave]}
          </MenuItem>
        ))}
      </Select>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
