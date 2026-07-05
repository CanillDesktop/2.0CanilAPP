import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useCadastroUsuario } from '../hooks/useCadastroUsuario';
import type { UsuarioCadastroComConfirmacaoDto } from '../types/tiposUsuarios';
import type { EscolhaUnidadeCadastro } from '../../estoque/constants/unidadesEstoque';
import { montarUnidadesEstoqueCadastro } from '../../estoque/constants/unidadesEstoque';
import { CampoEscolhaUnidadeCadastro } from './CampoEscolhaUnidadeCadastro';

export function FormularioCadastroUsuario() {
  const { cores } = useTemaApp();
  const campoSx = estilosCampoFormulario(cores, { semAnelFoco: true });
  const { cadastrar, carregando, erro, errosValidacao, criado } = useCadastroUsuario();
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [unidadeCadastro, setUnidadeCadastro] = useState<EscolhaUnidadeCadastro>('secretaria');

  const senhasDivergem = useMemo(
    () => senhaConfirmacao.length > 0 && senha !== senhaConfirmacao,
    [senha, senhaConfirmacao],
  );

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (senhasDivergem) return;
    const dto: UsuarioCadastroComConfirmacaoDto = {
      primeiroNome,
      sobrenome,
      email,
      senha,
      senhaConfirmacao,
      idCargo: 2,
      unidadesEstoque: montarUnidadesEstoqueCadastro(unidadeCadastro),
    };
    await cadastrar(dto);
  }

  return (
    <Paper
      component="form"
      onSubmit={aoEnviar}
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 480,
        p: { xs: 3, sm: 4.5 },
        borderRadius: 4,
        border: `1px solid ${cores.borderForte}`,
        backgroundColor: cores.bgCard,
        boxShadow: cores.sombraCard,
        backdropFilter: 'blur(18px)',
      }}
    >
      <Stack sx={{ gap: 3 }}>
        <Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              display: 'grid',
              placeItems: 'center',
              mb: 2,
              borderRadius: 3,
              backgroundColor: `${cores.accent}2e`,
              color: cores.chipIcon,
            }}
          >
            <PersonAddAlt1OutlinedIcon />
          </Box>
          <Typography variant="h4" sx={{ color: cores.textPrimary, fontWeight: 800, letterSpacing: -0.5 }}>
            Criar conta
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: cores.textSecondary }}>
            Preencha seus dados para acessar o painel.
          </Typography>
        </Box>

        {(erro || errosValidacao?.length) && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {erro}
            {errosValidacao?.length ? (
              <Box component="ul" sx={{ pl: 2.2, my: erro ? 1 : 0 }}>
                {errosValidacao.map((mensagem) => (
                  <li key={mensagem}>{mensagem}</li>
                ))}
              </Box>
            ) : null}
          </Alert>
        )}

        {criado ? (
          <Alert severity="success" sx={{ borderRadius: 2 }} role="status">
            Conta criada com sucesso para <strong>{criado.email}</strong>. Já é possível{' '}
            <Box component={Link} to="/login" sx={{ color: cores.focus, fontWeight: 700 }}>
              entrar
            </Box>
            .
          </Alert>
        ) : null}

        <Stack sx={{ gap: 2 }}>
          <TextField
            label="Nome"
            value={primeiroNome}
            onChange={(e) => setPrimeiroNome(e.target.value)}
            autoComplete="given-name"
            required
            fullWidth
            sx={campoSx}
            slotProps={{ htmlInput: { minLength: 2, maxLength: 60 } }}
          />
          <TextField
            label="Sobrenome"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            autoComplete="family-name"
            fullWidth
            sx={campoSx}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
            sx={campoSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <CampoEscolhaUnidadeCadastro
            valor={unidadeCadastro}
            onChange={setUnidadeCadastro}
            helperText="Indique se você atuará na Secretaria ou no Canil."
          />
          <CampoSenha
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
            sx={campoSx}
            helperText="Mínimo 6 caracteres."
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
          />
          <CampoSenha
            label="Confirmar senha"
            value={senhaConfirmacao}
            onChange={(e) => setSenhaConfirmacao(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
            sx={campoSx}
            error={senhasDivergem}
            helperText={senhasDivergem ? 'As senhas não coincidem.' : ' '}
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
          />
        </Stack>

        <Typography variant="caption" sx={{ color: cores.textMuted, lineHeight: 1.5 }}>
          Enquanto o sistema tiver menos de <strong>dois</strong> usuários cadastrados, novas contas recebem
          permissão de <strong>Administrador</strong> automaticamente. Depois disso, o cargo padrão é{' '}
          <strong>Grupo Padrão</strong>; um administrador pode alterá-lo em Usuários.
        </Typography>

        <Button
          type="submit"
          disabled={carregando || senhasDivergem}
          variant="contained"
          size="large"
          startIcon={carregando ? <CircularProgress size={18} color="inherit" /> : <PersonAddAlt1OutlinedIcon />}
          sx={{
            minHeight: 48,
            borderRadius: 2,
            fontWeight: 800,
            textTransform: 'none',
            backgroundColor: cores.accent,
            color: cores.textOnAccent,
            '&:hover': { backgroundColor: cores.accentHover },
            '&:disabled': {
              backgroundColor: `${cores.accent}6b`,
              color: `${cores.textOnAccent}b8`,
            },
          }}
        >
          {carregando ? 'Salvando...' : 'Criar conta'}
        </Button>

        <Typography variant="body2" sx={{ color: cores.textSecondary, textAlign: 'center' }}>
          Já tem conta?{' '}
          <Box
            component={Link}
            to="/login"
            sx={{
              color: cores.focus,
              fontWeight: 700,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Entrar
          </Box>
        </Typography>
      </Stack>
    </Paper>
  );
}
