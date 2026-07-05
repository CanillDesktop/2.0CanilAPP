import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { CARGO_PADRAO, type CargoLeituraDto } from '../../cargos/types/tiposCargos';
import { servicoCargos } from '../../cargos/services/servicoCargos';
import type { EscolhaUnidadeCadastro } from '../../estoque/constants/unidadesEstoque';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';
import { CampoEscolhaUnidadeCadastro } from './CampoEscolhaUnidadeCadastro';
import { descreverCargo } from '../utils/exibirPerfilUsuario';
import { SecaoSenhaOutroUsuario } from './ModalRedefinirSenhaOutroUsuario';
import type { UsuarioSenhaResumoDto } from '../types/tiposUsuarios';

type Props = {
  usuario?: UsuarioCriadoDto | null;
  incluirEmailSenha?: boolean;
  incluirEmailEdicao?: boolean;
  incluirCargo?: boolean;
  incluirUnidade?: boolean;
  cargoEdicao?: 'oculto' | 'somenteLeitura' | 'editavel';
  resumoSenhaOutro?: UsuarioSenhaResumoDto | null;
  carregandoResumoSenhaOutro?: boolean;
  podeVisualizarSenhaOutro?: boolean;
  podeAlterarSenhaOutro?: boolean;
  onAbrirRedefinirSenha?: () => void;
  carregando?: boolean;
  onSubmit: (dados: {
    primeiroNome: string;
    sobrenome?: string | null;
    email?: string;
    senha?: string;
    idCargo?: number;
    unidadeCadastro?: EscolhaUnidadeCadastro;
  }) => void;
};

export function FormularioUsuario({
  usuario,
  incluirEmailSenha = false,
  incluirEmailEdicao = false,
  incluirCargo = false,
  incluirUnidade = false,
  cargoEdicao = 'oculto',
  resumoSenhaOutro = null,
  carregandoResumoSenhaOutro = false,
  podeVisualizarSenhaOutro = false,
  podeAlterarSenhaOutro = false,
  onAbrirRedefinirSenha,
  carregando = false,
  onSubmit,
}: Props) {
  const [primeiroNome, setPrimeiroNome] = useState(usuario?.primeiroNome ?? '');
  const [sobrenome, setSobrenome] = useState(usuario?.sobrenome ?? '');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [idCargo, setIdCargo] = useState<number>(usuario?.idCargo ?? CARGO_PADRAO.grupoPadrao);
  const [unidadeCadastro, setUnidadeCadastro] = useState<EscolhaUnidadeCadastro>('secretaria');
  const [cargos, setCargos] = useState<CargoLeituraDto[]>([]);

  const precisaListaCargos = incluirCargo || cargoEdicao === 'editavel';

  useEffect(() => {
    if (!precisaListaCargos) return;
    void servicoCargos.listar().then(setCargos).catch(() => setCargos([]));
  }, [precisaListaCargos]);

  useEffect(() => {
    setPrimeiroNome(usuario?.primeiroNome ?? '');
    setSobrenome(usuario?.sobrenome ?? '');
    setEmail(usuario?.email ?? '');
    setIdCargo(usuario?.idCargo ?? CARGO_PADRAO.grupoPadrao);
  }, [usuario?.id, usuario?.primeiroNome, usuario?.sobrenome, usuario?.idCargo, usuario?.email]);

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
      idCargo: incluirCargo || cargoEdicao === 'editavel' ? idCargo : undefined,
      unidadeCadastro: incluirUnidade ? unidadeCadastro : undefined,
    });
  }

  const cargoAtual = cargos.find((c) => c.id === idCargo) ?? usuario;

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
        {cargoEdicao === 'somenteLeitura' ? (
          <Typography variant="body2" color="text.secondary">
            <strong>Cargo:</strong> {descreverCargo(usuario)} (somente quem pode gerenciar permissões altera o cargo de outros
            usuários)
          </Typography>
        ) : null}
        {cargoEdicao === 'editavel' ? (
          <TextField
            label="Cargo"
            value={idCargo}
            onChange={(e) => setIdCargo(Number(e.target.value))}
            select
            fullWidth
          >
            {cargos.map((cargo) => (
              <MenuItem key={cargo.id} value={cargo.id}>
                {cargo.nome}
                {cargo.ehAdministradorSistema ? ' (acesso total)' : ''}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
        {podeVisualizarSenhaOutro ? (
          <>
            <SecaoSenhaOutroUsuario
              resumoSenha={resumoSenhaOutro}
              carregandoResumo={carregandoResumoSenhaOutro}
              podeAlterar={false}
              novaSenha=""
              confirmacaoNovaSenha=""
              onNovaSenhaChange={() => undefined}
              onConfirmacaoChange={() => undefined}
            />
            {podeAlterarSenhaOutro && onAbrirRedefinirSenha ? (
              <Button type="button" variant="outlined" onClick={onAbrirRedefinirSenha} disabled={carregando}>
                Redefinir senha deste usuário
              </Button>
            ) : null}
          </>
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
            <CampoSenha
              label="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
            />
            {incluirCargo ? (
              <TextField
                label="Cargo"
                value={idCargo}
                onChange={(e) => setIdCargo(Number(e.target.value))}
                select
                fullWidth
                helperText={
                  cargoAtual && 'descricao' in cargoAtual && cargoAtual.descricao
                    ? String(cargoAtual.descricao)
                    : 'Define o conjunto de permissões do usuário.'
                }
              >
                {cargos.map((cargo) => (
                  <MenuItem key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
            {incluirUnidade ? (
              <CampoEscolhaUnidadeCadastro valor={unidadeCadastro} onChange={setUnidadeCadastro} />
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
