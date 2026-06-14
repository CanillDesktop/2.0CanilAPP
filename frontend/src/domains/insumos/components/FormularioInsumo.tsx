import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import {
  Box,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
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

const PASSOS = ['Identificação', 'Estoque e configurações'] as const;

const estadoInicialFormulario = () => ({
  descricaoSimplificada: '',
  descricaoDetalhada: '',
  lote: '',
  quantidade: 0,
  dataEntrega: new Date().toISOString().slice(0, 10),
  nfe: '',
  unidade: 1,
  dataValidade: '',
  nivelMinimoEstoque: 0,
  cadastrarEstoqueInicial: false,
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

  const passoEstoqueValido = useMemo(() => {
    if (!Number.isFinite(form.nivelMinimoEstoque) || form.nivelMinimoEstoque < 0) return false;
    if (!form.cadastrarEstoqueInicial) return true;
    return (
      form.lote.trim().length > 0 &&
      form.dataEntrega.trim().length > 0 &&
      Number.isFinite(form.quantidade) &&
      form.quantidade >= 0
    );
  }, [form]);

  function montarDto(): InsumoCadastroDto {
    return {
      descricaoSimplificada: form.descricaoSimplificada,
      descricaoDetalhada: form.descricaoDetalhada,
      lote: form.cadastrarEstoqueInicial ? form.lote : null,
      quantidade: form.cadastrarEstoqueInicial ? form.quantidade : 0,
      dataEntrega: new Date(form.dataEntrega).toISOString(),
      nfe: form.nfe,
      unidade: form.unidade,
      dataValidade: form.dataValidade ? new Date(form.dataValidade).toISOString() : null,
      nivelMinimoEstoque: form.nivelMinimoEstoque,
    };
  }

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!passoEstoqueValido || carregando) return;

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
            <>
              <SecaoFormularioCadastro
                titulo="Estoque inicial"
                descricao="Opcional — você pode registrar o primeiro lote agora ou depois na ficha do item."
                variante="estoque"
                icone={<WarehouseOutlinedIcon />}
                acaoCabecalho={
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.cadastrarEstoqueInicial}
                        onChange={(e) => setForm((p) => ({ ...p, cadastrarEstoqueInicial: e.target.checked }))}
                      />
                    }
                    label="Cadastrar estoque inicial"
                    sx={{ color: estilos.cores.textPrimary, m: 0 }}
                  />
                }
              >
                <Collapse in={form.cadastrarEstoqueInicial}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required={form.cadastrarEstoqueInicial}
                        label="Lote inicial"
                        value={form.lote}
                        onChange={(e) => setForm((p) => ({ ...p, lote: e.target.value }))}
                        sx={sxCampo}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantidade inicial"
                        value={form.quantidade}
                        onChange={(e) => setForm((p) => ({ ...p, quantidade: Number(e.target.value) }))}
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={sxCampo}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required={form.cadastrarEstoqueInicial}
                        type="date"
                        label="Data de entrega"
                        value={form.dataEntrega}
                        onChange={(e) => setForm((p) => ({ ...p, dataEntrega: e.target.value }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={sxCampo}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Data de validade"
                        value={form.dataValidade}
                        onChange={(e) => setForm((p) => ({ ...p, dataValidade: e.target.value }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={sxCampo}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="NF-e / documento"
                        value={form.nfe}
                        onChange={(e) => setForm((p) => ({ ...p, nfe: e.target.value }))}
                        sx={sxCampo}
                      />
                    </Grid>
                  </Grid>
                </Collapse>
                {!form.cadastrarEstoqueInicial ? (
                  <Typography variant="body2" sx={{ color: estilos.cores.textMuted }}>
                    O insumo será criado sem lote. Registre estoque depois na ficha do item.
                  </Typography>
                ) : null}
              </SecaoFormularioCadastro>

              <SecaoFormularioCadastro
                titulo="Configurações"
                descricao="Alertas de estoque baixo usam este mínimo como referência."
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
            </>
          )}

          <BarraAcoesFormulario
            passoAtual={passoAtual}
            totalPassos={PASSOS.length}
            carregando={carregando}
            podeAvancar={passoIdentificacaoValido}
            podeSalvar={passoEstoqueValido}
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
