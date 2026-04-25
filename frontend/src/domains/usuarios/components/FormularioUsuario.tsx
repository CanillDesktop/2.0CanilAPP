import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';

function rotuloPermissao(permissao: number) {
  if (permissao === 1) return 'Administrador';
  if (permissao === 2) return 'Leitura';
  return `Nível ${permissao}`;
}

type Props = {
  usuario?: UsuarioCriadoDto | null;
  incluirEmailSenha?: boolean;
  /** Edição: exibe email (preenchido) para qualquer papel. */
  incluirEmailEdicao?: boolean;
  incluirPermissao?: boolean;
  /** Na edição de perfil: todos veem a permissão; só admin editando outro usuário usa "editavel". */
  permissaoEdicao?: 'oculto' | 'somenteLeitura' | 'editavel';
  carregando?: boolean;
  onSubmit: (dados: {
    primeiroNome: string;
    sobrenome?: string | null;
    email?: string;
    senha?: string;
    permissao?: number;
  }) => void;
};

export function FormularioUsuario({
  usuario,
  incluirEmailSenha = false,
  incluirEmailEdicao = false,
  incluirPermissao = false,
  permissaoEdicao = 'oculto',
  carregando = false,
  onSubmit,
}: Props) {
  const [primeiroNome, setPrimeiroNome] = useState(usuario?.primeiroNome ?? '');
  const [sobrenome, setSobrenome] = useState(usuario?.sobrenome ?? '');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [permissao, setPermissao] = useState<number>(usuario?.permissao ?? 2);

  useEffect(() => {
    setPrimeiroNome(usuario?.primeiroNome ?? '');
    setSobrenome(usuario?.sobrenome ?? '');
    setEmail(usuario?.email ?? '');
    setPermissao(usuario?.permissao ?? 2);
  }, [usuario?.id, usuario?.primeiroNome, usuario?.sobrenome, usuario?.permissao, usuario?.email]);

  const formularioValido = useMemo(() => {
    const nomeValido = primeiroNome.trim().length >= 2 && primeiroNome.trim().length <= 60;
    const sobrenomeNormalizado = sobrenome.trim();
    const sobrenomeValido =
      sobrenomeNormalizado.length === 0 || (sobrenomeNormalizado.length >= 2 && sobrenomeNormalizado.length <= 80);
    const emailCriacaoValido =
      !incluirEmailSenha ||
      (email.trim().length >= 6 && email.includes('@') && senha.trim().length >= 6 && senha.trim().length <= 100);
    const emailEdicaoValido = !incluirEmailEdicao || (email.trim().length >= 6 && email.includes('@'));
    return nomeValido && sobrenomeValido && emailCriacaoValido && emailEdicaoValido;
  }, [primeiroNome, sobrenome, incluirEmailSenha, incluirEmailEdicao, email, senha]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido) return;
    onSubmit({
      primeiroNome: primeiroNome.trim(),
      sobrenome: sobrenome.trim() || null,
      email: incluirEmailSenha || incluirEmailEdicao ? email.trim() : undefined,
      senha: incluirEmailSenha ? senha.trim() : undefined,
      permissao: incluirPermissao ? permissao : permissaoEdicao === 'editavel' ? permissao : undefined,
    });
  }

  return (
    <Box component="form" onSubmit={enviar}>
      <Stack spacing={1.5}>
        <TextField
          label="Nome"
          value={primeiroNome}
          onChange={(e) => setPrimeiroNome(e.target.value)}
          required
          fullWidth
          slotProps={{ htmlInput: { minLength: 2, maxLength: 60 } }}
        />
        <TextField
          label="Sobrenome"
          value={sobrenome}
          onChange={(e) => setSobrenome(e.target.value)}
          fullWidth
          slotProps={{ htmlInput: { maxLength: 80 } }}
          helperText="Opcional. Se informado, use de 2 a 80 caracteres."
        />
        {incluirEmailEdicao && !incluirEmailSenha ? (
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
        ) : null}
        {permissaoEdicao === 'somenteLeitura' ? (
          <Typography variant="body2" color="text.secondary">
            <strong>Permissão:</strong> {rotuloPermissao(permissao)} (somente um administrador pode alterar permissões de
            outros usuários)
          </Typography>
        ) : null}
        {permissaoEdicao === 'editavel' ? (
          <TextField
            label="Permissão"
            value={permissao}
            onChange={(e) => setPermissao(Number(e.target.value))}
            select
            fullWidth
          >
            <MenuItem value={1}>Administrador</MenuItem>
            <MenuItem value={2}>Leitura</MenuItem>
          </TextField>
        ) : null}
        {incluirEmailSenha ? (
          <>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
            />
            {incluirPermissao ? (
              <TextField
                label="Permissão"
                value={permissao}
                onChange={(e) => setPermissao(Number(e.target.value))}
                select
                fullWidth
              >
                <MenuItem value={1}>Administrador</MenuItem>
                <MenuItem value={2}>Leitura</MenuItem>
              </TextField>
            ) : null}
          </>
        ) : null}
        <Button type="submit" variant="contained" disabled={carregando || !formularioValido}>
          Salvar
        </Button>
      </Stack>
    </Box>
  );
}
