import { useState, type ReactNode } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';

type CampoSenhaProps = Omit<TextFieldProps, 'type'> & {
  /** Quando verdadeiro, o conteúdo inicia visível (texto). Útil para códigos de acesso. */
  visivelInicial?: boolean;
};

/**
 * TextField com alternância de visibilidade (ícones eye / eye-off).
 * Usado em campos de senha e de códigos de acesso. Preserva adornos e estilos
 * informados pelo consumidor, apenas acrescentando o botão de mostrar/ocultar.
 */
export function CampoSenha({ visivelInicial = false, slotProps, ...props }: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(visivelInicial);

  const inputSlot = (slotProps?.input ?? {}) as { endAdornment?: ReactNode; [chave: string]: unknown };

  const slotPropsMesclado = {
    ...slotProps,
    input: {
      ...inputSlot,
      endAdornment: (
        <>
          {inputSlot.endAdornment ?? null}
          <InputAdornment position="end">
            <IconButton
              type="button"
              onClick={() => setVisivel((v) => !v)}
              edge="end"
              tabIndex={-1}
              aria-label={visivel ? 'Ocultar conteúdo do campo' : 'Mostrar conteúdo do campo'}
            >
              {visivel ? (
                <VisibilityOffOutlinedIcon fontSize="small" />
              ) : (
                <VisibilityOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        </>
      ),
    },
  } as TextFieldProps['slotProps'];

  return <TextField {...props} type={visivel ? 'text' : 'password'} slotProps={slotPropsMesclado} />;
}
