import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarraAcoesFormulario } from '../../../shared/components/cadastro/BarraAcoesFormulario';
import { PainelSucessoCadastro } from '../../../shared/components/cadastro/PainelSucessoCadastro';
import { LayoutFormularioCadastro, SecaoFormularioCadastro } from '../../../shared/components/LayoutFormularioCadastro';
import { PainelErro } from '../../../shared/components/PainelErro';
import type { EstadoNavegacaoListagem } from '../../../shared/types/navegacaoListagem';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { SeletorUnidadeMedida } from '../../unidades-medida/components/SeletorUnidadeMedida';
import { useUnidadesMedida } from '../../unidades-medida/hooks/useUnidadesMedida';
import { OPCOES_CATEGORIA_PRODUTO_FILTRO } from '../constants/opcoesCategoriaProduto';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import type { ProdutoCadastroDto } from '../types/tiposProdutos';

const PASSOS = ['Identificação', 'Configurações'] as const;

const estadoInicialFormulario = () => ({
  descricaoSimples: '',
  descricaoDetalhada: '',
  unidade: 0,
  categoria: 1,
  nivelMinimoEstoque: 0,
});

export function FormularioProduto() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoProduto();
  const { itens: unidades } = useUnidadesMedida('produto');
  const estilos = useEstilosListagem();
  const sxCampo = estilosCampoFormulario(estilos.cores);

  const [passoAtual, setPassoAtual] = useState(0);
  const [form, setForm] = useState(estadoInicialFormulario);

  useEffect(() => {
    if (form.unidade <= 0 && unidades[0]) {
      setForm((p) => ({ ...p, unidade: unidades[0].id }));
    }
  }, [unidades, form.unidade]);
  const [sucesso, setSucesso] = useState<{ nome: string } | null>(null);

  const passoIdentificacaoValido = useMemo(
    () =>
      form.descricaoSimples.trim().length > 0 &&
      form.descricaoDetalhada.trim().length > 0 &&
      Number.isFinite(form.unidade) &&
      form.unidade > 0 &&
      Number.isFinite(form.categoria) &&
      form.categoria > 0,
    [form.descricaoSimples, form.descricaoDetalhada, form.unidade, form.categoria],
  );

  const passoConfigValido = useMemo(() => {
    return Number.isFinite(form.nivelMinimoEstoque) && form.nivelMinimoEstoque >= 0;
  }, [form.nivelMinimoEstoque]);

  function montarDto(): ProdutoCadastroDto {
    return {
      descricaoSimples: form.descricaoSimples,
      descricaoDetalhada: form.descricaoDetalhada,
      unidade: form.unidade,
      categoria: form.categoria,
      quantidade: 0,
      dataEntrega: new Date().toISOString(),
      nfe: '',
      dataValidade: null,
      nivelMinimoEstoque: form.nivelMinimoEstoque,
    };
  }

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!passoConfigValido || carregando) return;

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
      subtitulo="Cadastre a ficha do produto. Entradas de estoque são feitas depois, em Estoque → Entrada."
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
        <Box component="form" onSubmit={aoEnviar} noValidate>
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
                  <SeletorUnidadeMedida
                    tipo="produto"
                    value={form.unidade}
                    onChange={(id) => setForm((p) => ({ ...p, unidade: id }))}
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
