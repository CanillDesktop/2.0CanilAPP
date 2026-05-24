import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
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
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { BotaoAlternarTema } from '../../../shared/components/BotaoAlternarTema';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import type { PapelUsuarioApp } from '../../../shared/types/papelUsuario';

export const larguraSidebar = 252;

type ItemNavegacao = {
  titulo: string;
  rota: string;
  icone: ReactElement;
  papeis?: PapelUsuarioApp[];
};

const itensNavegacao: ItemNavegacao[] = [
  { titulo: 'Dashboard', rota: '/dashboard', icone: <DashboardOutlinedIcon /> },
  { titulo: 'Produtos', rota: '/produtos', icone: <Inventory2OutlinedIcon /> },
  { titulo: 'Medicamentos', rota: '/medicamentos', icone: <MedicationOutlinedIcon /> },
  { titulo: 'Insumos', rota: '/insumos', icone: <ScienceOutlinedIcon /> },
  { titulo: 'Histórico retiradas', rota: '/estoque/historico-retiradas', icone: <HistoryOutlinedIcon /> },
  { titulo: 'Estoque', rota: '/estoque', icone: <WarehouseOutlinedIcon /> },
  { titulo: 'Usuários', rota: '/usuarios', icone: <PeopleOutlinedIcon /> },
];

function itensVisiveisParaPapel(papel: PapelUsuarioApp): ItemNavegacao[] {
  return itensNavegacao.filter((item) => !item.papeis || item.papeis.includes(papel));
}

type SidebarEstoqueProps = {
  abertoMobile: boolean;
  aoFecharMobile: () => void;
  ehMobile: boolean;
  papelUsuario: PapelUsuarioApp;
};

function ConteudoSidebar({
  aoClicarItem,
  papelUsuario,
}: {
  aoClicarItem?: () => void;
  papelUsuario: PapelUsuarioApp;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cores } = useTemaApp();
  const itens = itensVisiveisParaPapel(papelUsuario);

  const itemAtivoMaisEspecifico = [...itens]
    .filter((i) => location.pathname === i.rota || location.pathname.startsWith(`${i.rota}/`))
    .reduce<(typeof itens)[number] | undefined>(
      (melhor, atual) =>
        !melhor || atual.rota.length > melhor.rota.length ? atual : melhor,
      undefined,
    );

  return (
    <Box sx={{ width: larguraSidebar, bgcolor: 'background.paper', height: '100%' }}>
      <Toolbar sx={{ minHeight: 72, px: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Canip Stock
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.2 }}>
        {itens.map((item) => {
          const ativo =
            !!itemAtivoMaisEspecifico && itemAtivoMaisEspecifico.titulo === item.titulo;

          return (
            <ListItemButton
              key={item.titulo}
              onClick={() => {
                navigate(item.rota);
                aoClicarItem?.();
              }}
              selected={ativo}
              sx={{ mb: 0.6, borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icone}</ListItemIcon>
              <ListItemText primary={item.titulo} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ px: 1.2, pb: 2, borderTop: `1px solid ${cores.sidebarBorder}`, pt: 1 }}>
        <BotaoAlternarTema />
      </Box>
    </Box>
  );
}

export function SidebarEstoque({ abertoMobile, aoFecharMobile, ehMobile, papelUsuario }: SidebarEstoqueProps) {
  return ehMobile ? (
    <Drawer open={abertoMobile} onClose={aoFecharMobile} variant="temporary">
      <ConteudoSidebar aoClicarItem={aoFecharMobile} papelUsuario={papelUsuario} />
    </Drawer>
  ) : (
    <Drawer
      open
      variant="permanent"
      sx={{
        width: larguraSidebar,
        flexShrink: 0,
        '& .MuiDrawer-docked': {
          width: larguraSidebar,
        },
        '& .MuiDrawer-paper': {
          width: larguraSidebar,
          boxSizing: 'border-box',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          top: 0,
          height: '100vh',
        },
      }}
    >
      <ConteudoSidebar papelUsuario={papelUsuario} />
    </Drawer>
  );
}
