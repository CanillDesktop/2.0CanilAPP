import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
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
import { useMutacaoInsumo } from '../hooks/useInsumos';
import { OPCOES_UNIDADE_INSUMO } from '../constants/opcoesUnidadeInsumo';
import type { InsumoCadastroDto } from '../types/tiposInsumos';

const PASSOS = ['Identificação', 'Configurações'] as const;

const estadoInicialFormulario = () => ({
  descricaoSimplificada: '',
  descricaoDetalhada: '',
  unidade: 1,
  nivelMinimoEstoque: 0,
});

export function FormularioInsumo() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoInsumo();
  const estilos = useEstilosListagem();
  const sxCampo = estilosCampoFormulario(estilos.cores);

  const [passoAtual, setPassoAtual] = useState(0);
  const [form, setForm] = useState(estadoInicialFormulario);
  const [sucesso, setSucesso] = useState<{ nome: string } | null>(null);

  const passoIdentificacaoValido = useMemo(
    () =>
      form.descricaoSimplificada.trim().length > 0 &&
      form.descricaoDetalhada.trim().length > 0 &&
      Number.isFinite(form.unidade) &&
      form.unidade > 0,
    [form.descricaoSimplificada, form.descricaoDetalhada, form.unidade],
  );

  const passoConfigValido = useMemo(() => {
    return Number.isFinite(form.nivelMinimoEstoque) && form.nivelMinimoEstoque >= 0;
  }, [form.nivelMinimoEstoque]);

  function montarDto(): InsumoCadastroDto {
    return {
      descricaoSimplificada: form.descricaoSimplificada,
      descricaoDetalhada: form.descricaoDetalhada,
      quantidade: 0,
      dataEntrega: new Date().toISOString(),
      nfe: '',
      unidade: form.unidade,
      dataValidade: null,
      nivelMinimoEstoque: form.nivelMinimoEstoque,
    };
  }

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!passoConfigValido || carregando) return;

    const resultado = await criar(montarDto());
    if (!resultado.ok) return;

    setSucesso({ nome: form.descricaoSimplificada.trim() });
  }

  function reiniciarCadastro() {
    setForm(estadoInicialFormulario());
    setPassoAtual(0);
    setSucesso(null);
  }

  function irParaLista() {
    const state: EstadoNavegacaoListagem = {
      mensagemSucesso: `"${sucesso?.nome ?? 'Insumo'}" adicionado à listagem.`,
    };
    navegar('/insumos', { state });
  }

  return (
    <LayoutFormularioCadastro
      titulo="Novo insumo"
      subtitulo="Passo a passo: identifique o insumo e configure estoque inicial, se necessário."
      rotaLista="/insumos"
      rotuloLista="Insumos"
      icone={<ScienceOutlinedIcon />}
      passos={[...PASSOS]}
      passoAtual={sucesso ? PASSOS.length : passoAtual}
    >
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />

      {sucesso ? (
        <PainelSucessoCadastro
          tituloItem="Insumo cadastrado!"
          nomeItem={sucesso.nome}
          rotuloTipo="insumo"
          rotaLista="/insumos"
          onCadastrarOutro={reiniciarCadastro}
          onIrParaLista={irParaLista}
        />
      ) : (
        <Box component="form" onSubmit={aoEnviar}>
          {passoAtual === 0 ? (
            <SecaoFormularioCadastro
              titulo="Dados do insumo"
              descricao="Informações principais para identificar o item no estoque."
              variante="identidade"
              icone={<BadgeOutlinedIcon />}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Descrição simplificada"
                    placeholder="Ex.: Álcool 70%"
                    value={form.descricaoSimplificada}
                    onChange={(e) => setForm((p) => ({ ...p, descricaoSimplificada: e.target.value }))}
                    sx={sxCampo}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth sx={sxCampo}>
                    <InputLabel id="unidade-label">Unidade</InputLabel>
                    <Select
                      labelId="unidade-label"
                      label="Unidade"
                      value={form.unidade}
                      onChange={(e) => setForm((p) => ({ ...p, unidade: Number(e.target.value) }))}
                    >
                      {OPCOES_UNIDADE_INSUMO.map((opcao) => (
                        <MenuItem key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    required
                    label="Descrição detalhada"
                    placeholder="Detalhes adicionais, marca, observações..."
                    value={form.descricaoDetalhada}
                    onChange={(e) => setForm((p) => ({ ...p, descricaoDetalhada: e.target.value }))}
                    multiline
                    minRows={3}
                    sx={sxCampo}
                  />
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
            rotuloSalvar="Criar insumo"
            onCancelar={() => navegar('/insumos')}
            onPassoAnterior={() => setPassoAtual((p) => Math.max(0, p - 1))}
            onProximoPasso={() => setPassoAtual((p) => Math.min(PASSOS.length - 1, p + 1))}
          />
        </Box>
      )}
    </LayoutFormularioCadastro>
  );
}
