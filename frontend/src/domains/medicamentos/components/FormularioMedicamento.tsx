import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarraAcoesFormulario } from '../../../shared/components/cadastro/BarraAcoesFormulario';
import { PainelSucessoCadastro } from '../../../shared/components/cadastro/PainelSucessoCadastro';
import { LayoutFormularioCadastro, SecaoFormularioCadastro } from '../../../shared/components/LayoutFormularioCadastro';
import { PainelErro } from '../../../shared/components/PainelErro';
import type { EstadoNavegacaoListagem } from '../../../shared/types/navegacaoListagem';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { useMutacaoMedicamento } from '../hooks/useMedicamentos';
import type { MedicamentoCadastroDto } from '../types/tiposMedicamentos';

const PASSOS = ['Identificação', 'Configurações'] as const;

const OPCOES_PRIORIDADE = [
  { valor: 0, rotulo: 'Baixa' },
  { valor: 1, rotulo: 'Média' },
  { valor: 2, rotulo: 'Alta' },
];

const OPCOES_PUBLICO_ALVO = [
  { valor: 0, rotulo: 'Animal' },
  { valor: 1, rotulo: 'Humano e animal' },
];

const estadoInicialFormulario = () => ({
  prioridade: 0,
  descricaoMedicamento: '',
  formula: '',
  nomeComercial: '',
  publicoAlvo: 0,
  nivelMinimoEstoque: 0,
});

export function FormularioMedicamento() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoMedicamento();
  const estilos = useEstilosListagem();
  const sxCampo = estilosCampoFormulario(estilos.cores);

  const [passoAtual, setPassoAtual] = useState(0);
  const [form, setForm] = useState(estadoInicialFormulario);
  const [sucesso, setSucesso] = useState<{ nome: string } | null>(null);

  const passoIdentificacaoValido = useMemo(
    () =>
      form.nomeComercial.trim().length > 0 &&
      form.formula.trim().length > 0 &&
      form.descricaoMedicamento.trim().length > 0,
    [form.nomeComercial, form.formula, form.descricaoMedicamento],
  );

  const passoConfigValido = useMemo(() => {
    return Number.isFinite(form.nivelMinimoEstoque) && form.nivelMinimoEstoque >= 0;
  }, [form.nivelMinimoEstoque]);

  function montarDto(): MedicamentoCadastroDto {
    return {
      prioridade: form.prioridade,
      descricao: form.descricaoMedicamento,
      quantidade: 0,
      dataEntrega: new Date().toISOString(),
      nfe: '',
      formula: form.formula,
      nomeComercial: form.nomeComercial,
      publicoAlvo: form.publicoAlvo,
      dataValidade: null,
      nivelMinimoEstoque: form.nivelMinimoEstoque,
    };
  }

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!passoConfigValido || carregando) return;

    const resultado = await criar(montarDto());
    if (!resultado.ok) return;

    setSucesso({ nome: form.nomeComercial.trim() });
  }

  function reiniciarCadastro() {
    setForm(estadoInicialFormulario());
    setPassoAtual(0);
    setSucesso(null);
  }

  function irParaLista() {
    const state: EstadoNavegacaoListagem = {
      mensagemSucesso: `"${sucesso?.nome ?? 'Medicamento'}" adicionado à listagem.`,
    };
    navegar('/medicamentos', { state });
  }

  return (
    <LayoutFormularioCadastro
      titulo="Novo medicamento"
      subtitulo="Passo a passo: identifique o medicamento e configure estoque inicial, se necessário."
      rotaLista="/medicamentos"
      rotuloLista="Medicamentos"
      icone={<MedicationOutlinedIcon />}
      passos={[...PASSOS]}
      passoAtual={sucesso ? PASSOS.length : passoAtual}
    >
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />

      {sucesso ? (
        <PainelSucessoCadastro
          tituloItem="Medicamento cadastrado!"
          nomeItem={sucesso.nome}
          rotuloTipo="medicamento"
          rotaLista="/medicamentos"
          onCadastrarOutro={reiniciarCadastro}
          onIrParaLista={irParaLista}
        />
      ) : (
        <Box component="form" onSubmit={aoEnviar} noValidate>
          {passoAtual === 0 ? (
            <SecaoFormularioCadastro
              titulo="Dados do medicamento"
              descricao="Informações principais para identificar o item no estoque."
              variante="identidade"
              icone={<BadgeOutlinedIcon />}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Nome comercial"
                    placeholder="Ex.: Antipulgas Plus"
                    value={form.nomeComercial}
                    onChange={(e) => setForm((p) => ({ ...p, nomeComercial: e.target.value }))}
                    sx={sxCampo}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Fórmula"
                    placeholder="Ex.: Fipronil 10 mg"
                    value={form.formula}
                    onChange={(e) => setForm((p) => ({ ...p, formula: e.target.value }))}
                    sx={sxCampo}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    required
                    label="Descrição"
                    placeholder="Indicação, apresentação, observações..."
                    value={form.descricaoMedicamento}
                    onChange={(e) => setForm((p) => ({ ...p, descricaoMedicamento: e.target.value }))}
                    multiline
                    minRows={2}
                    sx={sxCampo}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth sx={sxCampo}>
                    <InputLabel id="prioridade-label">Prioridade</InputLabel>
                    <Select
                      labelId="prioridade-label"
                      label="Prioridade"
                      value={form.prioridade}
                      onChange={(e) => setForm((p) => ({ ...p, prioridade: Number(e.target.value) }))}
                    >
                      {OPCOES_PRIORIDADE.map((opcao) => (
                        <MenuItem key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth sx={sxCampo}>
                    <InputLabel id="publico-label">Público-alvo</InputLabel>
                    <Select
                      labelId="publico-label"
                      label="Público-alvo"
                      value={form.publicoAlvo}
                      onChange={(e) => setForm((p) => ({ ...p, publicoAlvo: Number(e.target.value) }))}
                    >
                      {OPCOES_PUBLICO_ALVO.map((opcao) => (
                        <MenuItem key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </SecaoFormularioCadastro>
          ) : (
            <SecaoFormularioCadastro
              titulo="Configurações"
              descricao="Alertas de estoque baixo usam este mínimo como referência na unidade ativa."
              variante="config"
              icone={<SettingsOutlinedIcon />}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Nível mínimo de estoque"
                    value={form.nivelMinimoEstoque}
                    onChange={(e) => setForm((p) => ({ ...p, nivelMinimoEstoque: Number(e.target.value) }))}
                    slotProps={{ htmlInput: { min: 0 } }}
                    sx={sxCampo}
                  />
                </Grid>
              </Grid>
            </SecaoFormularioCadastro>
          )}

          <BarraAcoesFormulario
            passoAtual={passoAtual}
            totalPassos={PASSOS.length}
            carregando={carregando}
            podeAvancar={passoIdentificacaoValido}
            podeSalvar={passoConfigValido}
            rotuloSalvar="Criar medicamento"
            onCancelar={() => navegar('/medicamentos')}
            onPassoAnterior={() => setPassoAtual((p) => Math.max(0, p - 1))}
            onProximoPasso={() => setPassoAtual((p) => Math.min(PASSOS.length - 1, p + 1))}
          />
        </Box>
      )}
    </LayoutFormularioCadastro>
  );
}
