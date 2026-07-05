import AddIcon from '@mui/icons-material/Add';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import SaveIcon from '@mui/icons-material/Save';

import {

  Box,

  Button,

  Card,

  CardContent,

  Chip,

  FormControl,

  Grid,

  InputLabel,

  MenuItem,

  Select,

  Stack,

  TextField,

  Typography,

  useMediaQuery,

  useTheme,

} from '@mui/material';

import { LoadingButton } from '@mui/lab';

import type { FormEvent } from 'react';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';

import { useTemaApp } from '../../../app/providers/ContextoTemaApp';

import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';

import { PainelErro } from '../../../shared/components/PainelErro';

import { LookupDialog } from '../../../shared/components/lookup/LookupDialog';

import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';

import {

  campoInteiroPositivo,

  inteiroCampoParaEnvio,

} from '../../../shared/utils/campoInteiroFormulario';

import type { ItemEstoqueLookupDto, LoteEstoqueLookupDto } from '../api/estoqueLookupApi';

import { UnidadeEstoqueIds } from '../constants/unidadesEstoque';

import {

  LinhaItemFormularioTransferencia,

  novaLinhaItemTransferencia,

  type LinhaItemTransferencia,

} from './transferencia/LinhaItemFormularioTransferencia';

import { useLookupItensEstoque } from '../hooks/useLookupItensEstoque';

import { obterUnicoLoteDisponivel, useLookupLotesEstoque } from '../hooks/useLookupLotesEstoque';

import { useTransferenciasEstoque } from '../hooks/useTransferencias';

import { ESTOQUE_ORIGEM_POR_NUMERO } from '../types/tiposEstoque';



const SEM_DESTINO = '';

const sxLarguraCardDesktop = {
  width: '100%',
  maxWidth: { xs: '100%', md: 960, lg: 1200, xl: 1320 },
  mx: 'auto',
} as const;



function montarNomeUsuario(primeiroNome?: string, sobrenome?: string) {

  return `${primeiroNome ?? ''} ${sobrenome ?? ''}`.trim();

}



function formatarData(iso?: string | null) {

  if (!iso) return '—';

  const d = new Date(iso);

  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');

}



function rotuloStatusLote(status: string) {

  if (status === 'vencido') return 'Vencido';

  if (status === 'proximo_vencimento') return 'Próx. vencimento';

  return 'OK';

}



function corStatusLote(status: string): 'default' | 'warning' | 'error' {

  if (status === 'vencido') return 'error';

  if (status === 'proximo_vencimento') return 'warning';

  return 'default';

}



export function FormularioTransferencia() {

  const navegar = useNavigate();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { cores } = useTemaApp();

  const { usuario } = useAutenticacao();

  const { unidadeAtivaId, permissoesAtivas, contexto } = useUnidadeEstoque();

  const campoSx = estilosCampoFormulario(cores);

  const { enviar, salvando, erro, errosValidacao } = useTransferenciasEstoque();



  const refsLote = useRef<(HTMLInputElement | null)[]>([]);

  const refsQuantidade = useRef<(HTMLInputElement | null)[]>([]);



  const ehSecretaria = unidadeAtivaId === UnidadeEstoqueIds.Secretaria;

  const ehCanil = unidadeAtivaId === UnidadeEstoqueIds.Canil;

  const nomeUsuarioAtual = useMemo(() => montarNomeUsuario(usuario?.primeiroNome, usuario?.sobrenome), [usuario]);



  const destinos = useMemo(

    () => (contexto?.unidadesDisponiveis ?? []).filter((u) => u.id !== unidadeAtivaId),

    [contexto, unidadeAtivaId],

  );



  const [idDestino, setIdDestino] = useState<string>(

    ehSecretaria ? String(UnidadeEstoqueIds.Canil) : SEM_DESTINO,

  );

  const [responsavelEnvio, setResponsavelEnvio] = useState('');

  const [responsavelRecebimento, setResponsavelRecebimento] = useState('');

  const [observacao, setObservacao] = useState('');

  const [itens, setItens] = useState<LinhaItemTransferencia[]>([novaLinhaItemTransferencia()]);



  const [lookupItemAberto, setLookupItemAberto] = useState(false);

  const [lookupLoteAberto, setLookupLoteAberto] = useState(false);

  const [indiceLookupAtivo, setIndiceLookupAtivo] = useState(0);



  const lookupItens = useLookupItensEstoque(lookupItemAberto);

  const itemIdParaLotes = lookupLoteAberto ? (itens[indiceLookupAtivo]?.idItem ?? 0) : 0;

  const lookupLotes = useLookupLotesEstoque(lookupLoteAberto, itemIdParaLotes);



  useEffect(() => {

    if (nomeUsuarioAtual) {

      setResponsavelEnvio((atual) => (atual.trim().length > 0 ? atual : nomeUsuarioAtual));

    }

  }, [nomeUsuarioAtual]);



  useEffect(() => {

    if (ehSecretaria) {

      setIdDestino(String(UnidadeEstoqueIds.Canil));

    }

  }, [ehSecretaria]);



  const semDestino = idDestino === SEM_DESTINO;

  const observacaoObrigatoria = ehCanil && semDestino;



  const destinoValido = ehSecretaria

    ? idDestino === String(UnidadeEstoqueIds.Canil)

    : !semDestino || observacao.trim().length > 0;



  const semPermissao = !permissoesAtivas?.podeTransferirEnviar;



  function linhaItemValida(i: LinhaItemTransferencia) {

    if (i.idItem <= 0) return false;

    if (i.loteObrigatorio && i.lote.trim().length === 0) return false;

    if (!campoInteiroPositivo(i.quantidade)) return false;

    if (i.saldoLote != null && inteiroCampoParaEnvio(i.quantidade) > i.saldoLote) return false;

    return true;

  }



  const formularioValido =

    !semPermissao &&

    responsavelEnvio.trim().length > 0 &&

    destinoValido &&

    (!observacaoObrigatoria || observacao.trim().length > 0) &&

    itens.length > 0 &&

    itens.every(linhaItemValida);



  function atualizarLinha(indice: number, patch: Partial<LinhaItemTransferencia>) {

    setItens((atual) => atual.map((l, i) => (i === indice ? { ...l, ...patch } : l)));

  }



  function focarLote(indice: number) {

    window.setTimeout(() => refsLote.current[indice]?.focus(), 50);

  }



  function focarQuantidade(indice: number) {

    window.setTimeout(() => refsQuantidade.current[indice]?.focus(), 50);

  }



  function abrirLookupItem(indice: number) {

    setIndiceLookupAtivo(indice);

    setLookupItemAberto(true);

  }



  function abrirLookupLote(indice: number) {

    const linha = itens[indice];

    if (!linha || linha.idItem <= 0) return;

    setIndiceLookupAtivo(indice);

    setLookupLoteAberto(true);

  }



  async function aoSelecionarItem(item: ItemEstoqueLookupDto) {
    const origem = ESTOQUE_ORIGEM_POR_NUMERO[item.origem] ?? 'produto';
    let patch: Partial<LinhaItemTransferencia> = {
      idItem: item.id,
      codigo: item.codigo,
      descricaoItem: item.descricao,
      origem,
      lote: '',
      saldoLote: undefined,
      loteObrigatorio: true,
    };

    if (unidadeAtivaId != null) {
      const unicoLote = await obterUnicoLoteDisponivel(item.id, unidadeAtivaId);
      if (unicoLote) {
        patch = { ...patch, lote: unicoLote.lote, saldoLote: unicoLote.saldo };
      }
    }

    atualizarLinha(indiceLookupAtivo, patch);
    if (patch.lote) focarQuantidade(indiceLookupAtivo);
    else focarLote(indiceLookupAtivo);
  }



  function aoSelecionarLote(lote: LoteEstoqueLookupDto) {

    atualizarLinha(indiceLookupAtivo, {

      lote: lote.lote,

      saldoLote: lote.saldo,

    });

    focarQuantidade(indiceLookupAtivo);

  }



  function aoEnterQuantidade(indice: number) {

    const linha = itens[indice];

    if (!linha || !linhaItemValida(linha)) return;



    if (indice === itens.length - 1) {

      setItens((atual) => [...atual, novaLinhaItemTransferencia()]);

      window.setTimeout(() => abrirLookupItem(indice + 1), 80);

      return;

    }



    focarQuantidade(indice + 1);

  }



  async function aoEnviar(e: FormEvent) {

    e.preventDefault();

    if (!formularioValido) return;

    const resultado = await enviar({

      idUnidadeDestino: semDestino ? null : Number(idDestino),

      responsavelEnvio: responsavelEnvio.trim(),

      responsavelRecebimento: responsavelRecebimento.trim() || null,

      observacao: observacao.trim() || null,

      itens: itens.map(({ idItem, lote, quantidade }) => ({

        idItem,

        lote,

        quantidade: inteiroCampoParaEnvio(quantidade),

      })),

    });

    if (resultado.ok) navegar('/estoque/transferencias');

  }



  const colunasItemLookup = useMemo(

    () => [

      {

        id: 'id',

        rotulo: 'ID',

        render: (item: ItemEstoqueLookupDto) => item.id,

      },

      {

        id: 'codigo',

        rotulo: 'Código',

        render: (item: ItemEstoqueLookupDto) => item.codigo,

      },

      {

        id: 'descricao',

        rotulo: 'Descrição',

        render: (item: ItemEstoqueLookupDto) => item.descricao,

      },

      {

        id: 'origem',

        rotulo: 'Tipo',

        render: (item: ItemEstoqueLookupDto) => lookupItens.origemLabel(item.origem),

      },

      {

        id: 'saldo',

        rotulo: 'Saldo',

        alinhamento: 'right' as const,

        render: (item: ItemEstoqueLookupDto) => item.saldo,

      },

    ],

    [lookupItens.origemLabel],

  );



  const colunasLoteLookup = useMemo(

    () => [

      {

        id: 'lote',

        rotulo: 'Lote',

        render: (item: LoteEstoqueLookupDto) => item.lote,

      },

      {

        id: 'saldo',

        rotulo: 'Saldo',

        alinhamento: 'right' as const,

        render: (item: LoteEstoqueLookupDto) => item.saldo,

      },

      {

        id: 'validade',

        rotulo: 'Validade',

        render: (item: LoteEstoqueLookupDto) => formatarData(item.validade),

      },

      {

        id: 'entrada',

        rotulo: 'Entrada',

        render: (item: LoteEstoqueLookupDto) => formatarData(item.dataEntrega),

      },

      {

        id: 'status',

        rotulo: 'Status',

        render: (item: LoteEstoqueLookupDto) => (

          <Chip

            size="small"

            label={rotuloStatusLote(item.status)}

            color={corStatusLote(item.status)}

            sx={{ fontWeight: 700 }}

          />

        ),

      },

    ],

    [],

  );



  return (

    <Box sx={{ py: { xs: 1.5, sm: 3 }, px: { xs: 1, sm: 0 }, flex: { xs: 1, sm: 'none' }, minHeight: { xs: 0, sm: 'auto' } }}>

      <Box sx={{ ...sxLarguraCardDesktop, mb: 1.5 }}>

        <Button

          size={isMobile ? 'medium' : 'small'}

          startIcon={<ArrowBackIcon fontSize="small" />}

          onClick={() => navegar('/estoque/transferencias')}

          sx={{

            textTransform: 'none',

            color: cores.textMuted,

            minWidth: 0,

            minHeight: { xs: 44, sm: 'auto' },

            px: { xs: 1, sm: 0.5 },

          }}

        >

          Transferências

        </Button>

      </Box>

      <Card sx={{ ...sxLarguraCardDesktop, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, borderRadius: 3 }}>

        <CardContent sx={{ p: { xs: 1.5, sm: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 3 } } }}>

          <Box component="form" onSubmit={aoEnviar}>

            <Stack spacing={2}>

              {!isMobile ? (
                <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary }}>
                  Nova transferência
                </Typography>
              ) : null}

              <PainelErro

                mensagem={semPermissao ? 'Você não tem permissão para enviar transferências nesta unidade.' : erro}

                errosValidacao={errosValidacao}

              />

              <Grid container spacing={2}>

                <Grid size={{ xs: 12, md: 6 }}>

                  <FormControl fullWidth sx={campoSx} disabled={ehSecretaria}>

                    <InputLabel id="destino-label">Unidade destino</InputLabel>

                    <Select

                      labelId="destino-label"

                      label="Unidade destino"

                      value={idDestino}

                      onChange={(e) => setIdDestino(String(e.target.value))}

                    >

                      {ehCanil ? (

                        <MenuItem value={SEM_DESTINO}>

                          <em>Sem unidade de destino</em>

                        </MenuItem>

                      ) : null}

                      {destinos.map((d) => (

                        <MenuItem key={d.id} value={String(d.id)}>

                          {d.nome}

                        </MenuItem>

                      ))}

                    </Select>

                  </FormControl>

                  {ehSecretaria ? (

                    <Typography variant="caption" sx={{ color: cores.textSecondary, display: 'block', mt: 0.5 }}>

                      Transferências da Secretaria são enviadas ao Canil.

                    </Typography>

                  ) : null}

                  {observacaoObrigatoria ? (

                    <Typography variant="caption" sx={{ color: cores.textSecondary, display: 'block', mt: 0.5 }}>

                      Sem destino, a observação é obrigatória.

                    </Typography>

                  ) : null}

                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>

                  <TextField

                    fullWidth

                    required

                    label="Quem está realizando"

                    value={responsavelEnvio}

                    onChange={(e) => setResponsavelEnvio(e.target.value)}

                    sx={campoSx}

                  />

                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>

                  <TextField

                    fullWidth

                    label="Quem está recebendo (opcional)"

                    value={responsavelRecebimento}

                    onChange={(e) => setResponsavelRecebimento(e.target.value)}

                    sx={campoSx}

                  />

                </Grid>

                <Grid size={12}>

                  <TextField

                    fullWidth

                    required={observacaoObrigatoria}

                    label="Observação"

                    value={observacao}

                    onChange={(e) => setObservacao(e.target.value)}

                    multiline

                    minRows={2}

                    helperText={

                      observacaoObrigatoria

                        ? 'Obrigatória quando não há unidade de destino.'

                        : ' '

                    }

                    sx={campoSx}

                  />

                </Grid>

              </Grid>



              <Box>

                <Typography variant="subtitle2" sx={{ color: cores.textPrimary, fontWeight: 700, mb: 1 }}>

                  Itens

                </Typography>

                <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block', mb: 1.5 }}>

                  {isMobile
                    ? 'Toque no item ou no lote para selecionar'
                    : 'Clique no item ou F2 para pesquisar · Enter na quantidade adiciona nova linha'}

                </Typography>

                <Stack spacing={1.5}>

                  {itens.map((item, idx) => (

                    <LinhaItemFormularioTransferencia

                      key={item.chave}

                      item={item}

                      indice={idx}

                      isMobile={isMobile}

                      podeRemover={itens.length > 1}

                      refsLote={refsLote}

                      refsQuantidade={refsQuantidade}

                      onChange={atualizarLinha}

                      onRemover={(i) => setItens((atual) => atual.filter((_, j) => j !== i))}

                      onAbrirLookupItem={abrirLookupItem}

                      onAbrirLookupLote={abrirLookupLote}

                      onEnterQuantidade={aoEnterQuantidade}

                    />

                  ))}

                </Stack>

              </Box>



              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>

                <Button

                  fullWidth={isMobile}

                  startIcon={<AddIcon />}

                  onClick={() => setItens((atual) => [...atual, novaLinhaItemTransferencia()])}

                  sx={{ minHeight: { xs: 44, sm: 'auto' }, textTransform: 'none', fontWeight: 600 }}

                >

                  Adicionar item

                </Button>

                <LoadingButton

                  type="submit"

                  fullWidth={isMobile}

                  loading={salvando}

                  loadingPosition="start"

                  startIcon={<SaveIcon />}

                  variant="contained"

                  disabled={!formularioValido || salvando}

                  sx={{

                    minHeight: { xs: 44, sm: 'auto' },

                    backgroundColor: cores.accent,

                    color: cores.textOnAccent,

                    fontWeight: 700,

                  }}

                >

                  Enviar transferência

                </LoadingButton>

              </Stack>

            </Stack>

          </Box>

        </CardContent>

      </Card>



      <LookupDialog

        aberto={lookupItemAberto}

        titulo="Selecionar item"

        placeholderBusca="ID, código ou descrição…"

        colunas={colunasItemLookup}

        itens={lookupItens.itens}

        totalCount={lookupItens.totalCount}

        page={lookupItens.page}

        pageSize={lookupItens.pageSize}

        onPageChange={lookupItens.setPage}

        carregando={lookupItens.carregando}

        busca={lookupItens.busca}

        onBuscaChange={lookupItens.setBusca}

        getChave={(item) => `${item.origem}-${item.id}`}

        onSelecionar={(item) => void aoSelecionarItem(item)}

        onFechar={() => setLookupItemAberto(false)}

      />



      <LookupDialog

        aberto={lookupLoteAberto}

        titulo={`Selecionar lote${itens[indiceLookupAtivo]?.descricaoItem ? ` — ${itens[indiceLookupAtivo].descricaoItem}` : ''}`}

        placeholderBusca="Filtrar por número do lote…"

        buscaMinCaracteres={0}
        permiteBuscaVazia

        colunas={colunasLoteLookup}

        itens={lookupLotes.itens}

        totalCount={lookupLotes.totalCount}

        page={lookupLotes.page}

        pageSize={lookupLotes.pageSize}

        onPageChange={lookupLotes.setPage}

        carregando={lookupLotes.carregando}

        busca={lookupLotes.busca}

        onBuscaChange={lookupLotes.setBusca}

        getChave={(item) => item.lote}

        onSelecionar={aoSelecionarLote}

        onFechar={() => setLookupLoteAberto(false)}

      />

    </Box>

  );

}

