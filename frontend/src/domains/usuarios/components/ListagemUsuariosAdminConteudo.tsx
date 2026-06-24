import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
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
    filtrosExpandidos,
    onFiltrosExpandidosChange,
    modo,
  } = props;

  const listaVaziaSemFiltro =
    !carregandoLista && usuarios.length === 0 && !erro && !buscaAplicada.trim() && status === 'ativos';
  const listaFiltradaVazia = !carregandoLista && usuarios.length === 0 && !erro && !listaVaziaSemFiltro;

  const filtrosAtivos = contarFiltrosGestaoUsuariosAtivos(buscaInput, status);

  return (
    <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: cores.textPrimary }}>
            {titulo}
          </Typography>
          {descricao ? (
            <Typography variant="body2" sx={{ color: cores.textSecondary }}>
              {descricao}
            </Typography>
          ) : null}

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
            <Stack direction="row" spacing={1.5} sx={{ py: 3, justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} />
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Carregando usuários…
              </Typography>
            </Stack>
          ) : null}

          {listaVaziaSemFiltro ? (
            <Alert severity="info">Nenhum usuário cadastrado no sistema ainda.</Alert>
          ) : null}

          {listaFiltradaVazia ? (
            <Alert severity="warning">Nenhum usuário corresponde à busca ou ao filtro de status.</Alert>
          ) : null}

          {!carregandoLista && usuarios.length > 0 ? (
            <>
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
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  disabled={!paginacao.hasPrevious || usuarios.length === 0}
                  onClick={() => onPaginaChange(Math.max(1, pagina - 1))}
                >
                  Anterior
                </Button>
                <Button variant="outlined" disabled>
                  {paginacao.totalCount === 0
                    ? '0 / 0'
                    : `${paginacao.pageNumber} / ${paginacao.totalPages}`}
                </Button>
                <Button
                  variant="outlined"
                  disabled={!paginacao.hasNext || usuarios.length === 0}
                  onClick={() => onPaginaChange(pagina + 1)}
                >
                  Próxima
                </Button>
              </Stack>
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
