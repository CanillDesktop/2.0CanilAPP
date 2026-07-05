import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import InputOutlinedIcon from '@mui/icons-material/InputOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import type { ReactElement } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { PERMISSAO } from '../../../shared/constants/permissoesCodigos';
import { possuiPermissao } from '../../../shared/utils/possuiPermissao';
import { podeGerenciarCatalogoUnidadesMedida } from '../../usuarios/utils/exibirPerfilUsuario';
import type { UsuarioSessao } from '../../../shared/types/usuarioSessao';

export const larguraSidebar = 252;

type ItemNavegacao = {
  titulo: string;
  rota: string;
  icone: ReactElement;
  /** Exige ao menos uma das permissões (OR). */
  permissoes?: string[];
  exigeCatalogoMedidas?: boolean;
};

const itensNavegacao: ItemNavegacao[] = [
  { titulo: 'Dashboard', rota: '/dashboard', icone: <DashboardOutlinedIcon /> },
  { titulo: 'Produtos', rota: '/produtos', icone: <Inventory2OutlinedIcon /> },
  { titulo: 'Medicamentos', rota: '/medicamentos', icone: <MedicationOutlinedIcon /> },
  { titulo: 'Insumos', rota: '/insumos', icone: <ScienceOutlinedIcon /> },
  { titulo: 'Histórico retiradas', rota: '/estoque/historico-retiradas', icone: <HistoryOutlinedIcon /> },
  { titulo: 'Transferências', rota: '/estoque/transferencias', icone: <SwapHorizOutlinedIcon /> },
  { titulo: 'Estoque', rota: '/estoque', icone: <WarehouseOutlinedIcon /> },
  {
    titulo: 'Usuários',
    rota: '/usuarios',
    icone: <PeopleOutlinedIcon />,
    permissoes: [PERMISSAO.usuariosListar],
  },
  {
    titulo: 'Permissões unidade',
    rota: '/usuarios/permissoes',
    icone: <InputOutlinedIcon />,
    permissoes: [PERMISSAO.usuariosPermissoesGerenciar, PERMISSAO.usuariosGerenciarVinculosUnidade],
  },
  {
    titulo: 'Cargos',
    rota: '/cargos',
    icone: <BadgeOutlinedIcon />,
    permissoes: [PERMISSAO.cargosGerenciar, PERMISSAO.usuariosListar],
  },
  {
    titulo: 'Catálogo permissões',
    rota: '/permissoes/catalogo',
    icone: <InputOutlinedIcon />,
    permissoes: [PERMISSAO.permissoesCatalogoVisualizar, PERMISSAO.permissoesCatalogoGerenciar],
  },
  {
    titulo: 'Medidas dos itens',
    rota: '/unidades-medida',
    icone: <StraightenOutlinedIcon />,
    exigeCatalogoMedidas: true,
  },
];

function itensVisiveisParaUsuario(usuario: UsuarioSessao | null): ItemNavegacao[] {
  return itensNavegacao.filter((item) => {
    if (item.permissoes && !item.permissoes.some((codigo) => possuiPermissao(usuario, codigo))) return false;
    if (item.exigeCatalogoMedidas && !podeGerenciarCatalogoUnidadesMedida(usuario)) return false;
    return true;
  });
}

type SidebarEstoqueProps = {
  aberto: boolean;
  aoFechar: () => void;
};

function ConteudoSidebar({ aoClicarItem }: { aoClicarItem?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cores } = useTemaApp();
  const { usuario } = useAutenticacao();
  const itens = itensVisiveisParaUsuario(usuario);

  const itemAtivoMaisEspecifico = [...itens]
    .filter((i) => location.pathname === i.rota || location.pathname.startsWith(`${i.rota}/`))
    .reduce<(typeof itens)[number] | undefined>(
      (melhor, atual) => (!melhor || atual.rota.length > melhor.rota.length ? atual : melhor),
      undefined,
    );

  return (
    <Box
      sx={{
        width: larguraSidebar,
        bgcolor: cores.bgCard,
        height: '100%',
        borderRight: `1px solid ${cores.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 88,
          px: 2.5,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          component={Link}
          to="/dashboard"
          onClick={() => aoClicarItem?.()}
          aria-label="Ir para o dashboard"
          sx={{
            display: 'inline-flex',
            borderRadius: 1,
            lineHeight: 0,
            transition: 'opacity 0.15s ease',
            '&:hover': { opacity: 0.85 },
          }}
        >
          <Box
            component="img"
            src="/branding/canil_sidebar_logo.png"
            alt="CanilApp"
            sx={{ height: 73, width: 'auto', display: 'block' }}
          />
        </Box>
      </Toolbar>
      <List sx={{ px: 1.2, flex: 1, overflow: 'hidden' }}>
        {itens.map((item) => {
          const ativo = !!itemAtivoMaisEspecifico && itemAtivoMaisEspecifico.titulo === item.titulo;

          return (
            <ListItemButton
              key={item.titulo}
              onClick={() => {
                navigate(item.rota);
                aoClicarItem?.();
              }}
              selected={ativo}
              sx={{
                mb: 0.6,
                borderRadius: 2,
                color: cores.textPrimary,
                borderLeft: '3px solid transparent',
                '&.Mui-selected': {
                  bgcolor: cores.hoverSurface,
                  borderLeftColor: cores.accent,
                  '&:hover': { bgcolor: cores.hoverSurfaceStrong },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: ativo ? cores.accent : cores.textMuted }}>
                {item.icone}
              </ListItemIcon>
              <ListItemText primary={item.titulo} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export function SidebarEstoque({ aberto, aoFechar }: SidebarEstoqueProps) {
  return (
    <Drawer
      open={aberto}
      onClose={aoFechar}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: larguraSidebar,
          boxSizing: 'border-box',
          overflow: 'hidden',
        },
      }}
    >
      <ConteudoSidebar aoClicarItem={aoFechar} />
    </Drawer>
  );
}
