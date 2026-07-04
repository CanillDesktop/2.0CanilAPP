import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TablePagination,
  Typography,
} from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import type { FiltrosUsuariosListagem, UsuarioCriadoDto, UsuariosPaginadosDto } from '../types/tiposUsuarios';
import {
  contarFiltrosGestaoUsuariosAtivos,
  PainelFiltrosGestaoUsuarios,
} from './PainelFiltrosGestaoUsuarios';
import { ListagemUsuariosResponsiva } from './ListagemUsuariosResponsiva';

type StatusFiltro = NonNullable<FiltrosUsuariosListagem['status']>;

type PropsBase = {
  titulo: string;
  descricao?: string;
  usuarios: UsuarioCriadoDto[];
  paginacao: Omit<UsuariosPaginadosDto, 'items'>;
  usuarioLogadoId?: number | null;
  carregandoLista: boolean;
  carregandoAcao: boolean;
  erro: string | null;
  buscaInput: string;
  buscaAplicada: string;
  onBuscaInputChange: (valor: string) => void;
  status: StatusFiltro;
  onStatusChange: (valor: StatusFiltro) => void;
  pagina: number;
  onPaginaChange: (pagina: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  filtrosExpandidos: boolean;
  onFiltrosExpandidosChange: (expandido: boolean) => void;
};

type PropsGestao = PropsBase & {
  modo: 'gestao';
  onCadastrar: () => void;
  onEditar: (usuario: UsuarioCriadoDto) => void;
  onInativar: (usuario: UsuarioCriadoDto) => void;
  onReativar: (usuario: UsuarioCriadoDto) => void;
  onRemover: (usuario: UsuarioCriadoDto) => void;
  onRemoverDefinitivo: (usuario: UsuarioCriadoDto) => void;
};

type PropsPermissoes = PropsBase & {
  modo: 'permissoes';
  onAbrirPermissoes: (usuario: UsuarioCriadoDto) => void;
};

export type ListagemUsuariosAdminConteudoProps = PropsGestao | PropsPermissoes;

export function ListagemUsuariosAdminConteudo(props: ListagemUsuariosAdminConteudoProps) {
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();
  const {
    titulo,
    descricao,
    usuarios,
    paginacao,
    usuarioLogadoId,
    carregandoLista,
    carregandoAcao,
    erro,
    buscaInput,
    buscaAplicada,
    onBuscaInputChange,
    status,
    onStatusChange,
    pagina,
    onPaginaChange,
    pageSize,
    onPageSizeChange,
    filtrosExpandidos,
    onFiltrosExpandidosChange,
    modo,
  } = props;

  const listaVaziaSemFiltro =
    !carregandoLista && usuarios.length === 0 && !erro && !buscaAplicada.trim() && status === 'ativos';
  const listaFiltradaVazia = !carregandoLista && usuarios.length === 0 && !erro && !listaVaziaSemFiltro;
  const mostrarLista = !carregandoLista && usuarios.length > 0;
  const mostrarPaginacao = !carregandoLista && paginacao.totalCount > 0;

  const filtrosAtivos = contarFiltrosGestaoUsuariosAtivos(buscaInput, status);
  const paginaMui = Math.max(0, pagina - 1);

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: cores.bgCard,
        border: `1px solid ${cores.border}`,
        boxShadow: cores.sombraCard,
        overflow: 'hidden',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          '&:last-child': { pb: { xs: 1.25, sm: 2.5 } },
        }}
      >
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: cores.textPrimary,
                fontSize: { xs: '1.05rem', sm: '1.25rem' },
                lineHeight: 1.3,
              }}
            >
              {titulo}
            </Typography>
            {descricao ? (
              <Typography
                variant="body2"
                sx={{
                  color: cores.textSecondary,
                  mt: 0.5,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  lineHeight: 1.4,
                }}
              >
                {descricao}
              </Typography>
            ) : null}
          </Box>

          <PainelFiltrosGestaoUsuarios
            expandido={filtrosExpandidos}
            onExpandidoChange={onFiltrosExpandidosChange}
            buscaInput={buscaInput}
            onBuscaInputChange={onBuscaInputChange}
            status={status}
            onStatusChange={onStatusChange}
            filtrosAtivos={filtrosAtivos}
            carregandoLista={carregandoLista}
            carregandoAcao={carregandoAcao}
            tituloAccordion={modo === 'permissoes' ? 'Filtros' : 'Filtros e cadastro'}
            onCadastrar={modo === 'gestao' ? props.onCadastrar : undefined}
          />

          {erro ? <Alert severity="error">{erro}</Alert> : null}

          {carregandoLista ? (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ py: { xs: 2.5, sm: 3 }, justifyContent: 'center', alignItems: 'center' }}
            >
              <CircularProgress size={26} />
              <Typography variant="body2" sx={{ color: cores.textSecondary, fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
                Carregando usuários…
              </Typography>
            </Stack>
          ) : null}

          {listaVaziaSemFiltro ? (
            <Alert severity="info" sx={{ py: { xs: 0.75, sm: 1 } }}>
              Nenhum usuário cadastrado no sistema ainda.
            </Alert>
          ) : null}

          {listaFiltradaVazia ? (
            <Alert severity="warning" sx={{ py: { xs: 0.75, sm: 1 } }}>
              Nenhum usuário corresponde à busca ou ao filtro de status.
            </Alert>
          ) : null}

          {mostrarLista ? (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  color: cores.textMuted,
                  fontWeight: 600,
                  fontSize: { xs: '0.72rem', sm: '0.75rem' },
                }}
              >
                {paginacao.totalCount}{' '}
                {paginacao.totalCount === 1 ? 'usuário' : 'usuários'}
              </Typography>
              {modo === 'gestao' ? (
                <ListagemUsuariosResponsiva
                  usuarios={usuarios}
                  usuarioLogadoId={usuarioLogadoId}
                  carregando={carregandoAcao}
                  onEditar={props.onEditar}
                  onInativar={props.onInativar}
                  onReativar={props.onReativar}
                  onRemover={props.onRemover}
                  onRemoverDefinitivo={props.onRemoverDefinitivo}
                />
              ) : (
                <ListagemUsuariosResponsiva
                  usuarios={usuarios}
                  usuarioLogadoId={usuarioLogadoId}
                  carregando={carregandoAcao}
                  modoPermissoes
                  onAbrirPermissoes={props.onAbrirPermissoes}
                  onEditar={() => undefined}
                  onInativar={() => undefined}
                  onReativar={() => undefined}
                  onRemover={() => undefined}
                  onRemoverDefinitivo={() => undefined}
                />
              )}
            </Box>
          ) : null}

          {mostrarPaginacao ? (
            <Box
              sx={{
                mx: { xs: -1.5, sm: -2.5 },
                mb: { xs: -1.25, sm: -2.5 },
                mt: { xs: 0.25, sm: 0.5 },
              }}
            >
              <TablePagination
                component="div"
                sx={estilos.paginacao}
                rowsPerPageOptions={[5, 10, 25]}
                count={paginacao.totalCount}
                rowsPerPage={pageSize}
                page={paginaMui}
                onPageChange={(_, novaPagina) => onPaginaChange(novaPagina + 1)}
                onRowsPerPageChange={(e) => {
                  onPageSizeChange(Number.parseInt(e.target.value, 10));
                  onPaginaChange(1);
                }}
                labelRowsPerPage="Por página"
                labelDisplayedRows={({ from, to, count }) =>
                  count === 0 ? '0–0 de 0' : `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
