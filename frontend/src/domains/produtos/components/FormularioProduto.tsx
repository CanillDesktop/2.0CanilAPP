import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
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
import { OPCOES_CATEGORIA_PRODUTO_FILTRO } from '../constants/opcoesCategoriaProduto';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import type { ProdutoCadastroDto } from '../types/tiposProdutos';

const PASSOS = ['Identificação', 'Estoque e configurações'] as const;

const OPCOES_UNIDADE = [
  { valor: 1, rotulo: 'Unidade' },
  { valor: 2, rotulo: 'Kg' },
  { valor: 3, rotulo: 'Litro' },
];

const estadoInicialFormulario = () => ({
  descricaoSimples: '',
  descricaoDetalhada: '',
  unidade: 1,
  categoria: 1,
  cadastrarEstoqueInicial: true,
  lote: '',
  quantidade: 0,
  dataEntrega: new Date().toISOString().slice(0, 10),
  nfe: '',
  dataValidade: '',
  nivelMinimoEstoque: 0,
});

export function FormularioProduto() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoProduto();
  const estilos = useEstilosListagem();
  const sxCampo = estilosCampoFormulario(estilos.cores);

  const [passoAtual, setPassoAtual] = useState(0);
  const [form, setForm] = useState(estadoInicialFormulario);
  const [sucesso, setSucesso] = useState<{ nome: string } | null>(null);

  const passoIdentificacaoValido = useMemo(
    () =>
      form.descricaoSimples.trim().length > 0 &&
      Number.isFinite(form.unidade) &&
      form.unidade > 0 &&
      Number.isFinite(form.categoria) &&
      form.categoria > 0,
    [form.descricaoSimples, form.unidade, form.categoria],
  );

  const passoEstoqueValido = useMemo(() => {
    if (!Number.isFinite(form.nivelMinimoEstoque) || form.nivelMinimoEstoque < 0) return false;
    if (!form.cadastrarEstoqueInicial) return true;
    return (
      form.lote.trim().length > 0 &&
      Number.isFinite(form.quantidade) &&
      form.quantidade > 0 &&
      form.dataEntrega.trim().length > 0
    );
  }, [form]);

  function montarDto(): ProdutoCadastroDto {
    return {
      descricaoSimples: form.descricaoSimples,
      descricaoDetalhada: form.descricaoDetalhada,
      unidade: form.unidade,
      categoria: form.categoria,
      lote: form.cadastrarEstoqueInicial ? form.lote : null,
      quantidade: form.cadastrarEstoqueInicial ? form.quantidade : 0,
      dataEntrega: new Date(form.dataEntrega).toISOString(),
      nfe: form.nfe,
      dataValidade: form.dataValidade ? new Date(form.dataValidade).toISOString() : null,
      nivelMinimoEstoque: form.nivelMinimoEstoque,
    };
  }

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!passoEstoqueValido || carregando) return;

    const resultado = await criar(montarDto());
    if (!resultado.ok) return;

    setSucesso({ nome: form.descricaoSimples.trim() });
  }

  function reiniciarCadastro() {
    setForm(estadoInicialFormulario());
    setPassoAtual(0);
    setSucesso(null);
  }

  function irParaLista() {
    const state: EstadoNavegacaoListagem = {
      mensagemSucesso: `"${sucesso?.nome ?? 'Produto'}" adicionado à listagem.`,
    };
    navegar('/produtos', { state });
  }

  return (
    <LayoutFormularioCadastro
      titulo="Novo produto"
      subtitulo="Passo a passo: identifique o item e configure estoque inicial, se necessário."
      rotaLista="/produtos"
      rotuloLista="Produtos"
      icone={<Inventory2OutlinedIcon />}
      passos={[...PASSOS]}
      passoAtual={sucesso ? PASSOS.length : passoAtual}
    >
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />

      {sucesso ? (
        <PainelSucessoCadastro
          tituloItem="Produto cadastrado!"
          nomeItem={sucesso.nome}
          rotuloTipo="produto"
          rotaLista="/produtos"
          onCadastrarOutro={reiniciarCadastro}
          onIrParaLista={irParaLista}
        />
      ) : (
        <Box component="form" onSubmit={aoEnviar}>
          {passoAtual === 0 ? (
            <SecaoFormularioCadastro
              titulo="Dados do produto"
              descricao="Informações principais para identificar o item no estoque."
              variante="identidade"
              icone={<BadgeOutlinedIcon />}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Nome / descrição simples"
                    placeholder="Ex.: Ração Premium 15 kg"
                    value={form.descricaoSimples}
                    onChange={(e) => setForm((p) => ({ ...p, descricaoSimples: e.target.value }))}
                    sx={sxCampo}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Descrição detalhada"
                    placeholder="Detalhes adicionais, marca, observações..."
                    value={form.descricaoDetalhada}
                    onChange={(e) => setForm((p) => ({ ...p, descricaoDetalhada: e.target.value }))}
                    multiline
                    minRows={3}
                    sx={sxCampo}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth sx={sxCampo}>
                    <InputLabel id="categoria-label">Categoria</InputLabel>
                    <Select
                      labelId="categoria-label"
                      label="Categoria"
                      value={form.categoria}
                      onChange={(e) => setForm((p) => ({ ...p, categoria: Number(e.target.value) }))}
                    >
                      {OPCOES_CATEGORIA_PRODUTO_FILTRO.map((opcao) => (
                        <MenuItem key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                      {OPCOES_UNIDADE.map((opcao) => (
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
                        required={form.cadastrarEstoqueInicial}
                        type="number"
                        label="Quantidade inicial"
                        value={form.quantidade}
                        onChange={(e) => setForm((p) => ({ ...p, quantidade: Number(e.target.value) }))}
                        slotProps={{ htmlInput: { min: 1 } }}
                        sx={sxCampo}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required={form.cadastrarEstoqueInicial}
                        type="date"
                        label="Data de entrada"
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
                        label="Documento (NF)"
                        value={form.nfe}
                        onChange={(e) => setForm((p) => ({ ...p, nfe: e.target.value }))}
                        sx={sxCampo}
                      />
                    </Grid>
                  </Grid>
                </Collapse>
                {!form.cadastrarEstoqueInicial ? (
                  <Typography variant="body2" sx={{ color: estilos.cores.textMuted }}>
                    O produto será criado sem lote. Registre estoque depois na ficha do item.
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
            rotuloSalvar="Criar produto"
            onCancelar={() => navegar('/produtos')}
            onPassoAnterior={() => setPassoAtual((p) => Math.max(0, p - 1))}
            onProximoPasso={() => setPassoAtual((p) => Math.min(PASSOS.length - 1, p + 1))}
          />
        </Box>
      )}
    </LayoutFormularioCadastro>
  );
}
