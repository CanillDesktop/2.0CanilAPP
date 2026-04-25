import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
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

export const larguraSidebar = 252;

type ItemNavegacao = {
  titulo: string;
  rota: string;
  icone: ReactElement;
};

const itensNavegacao: ItemNavegacao[] = [
  { titulo: 'Dashboard', rota: '/estoque', icone: <DashboardOutlinedIcon /> },
  { titulo: 'Produtos', rota: '/produtos', icone: <Inventory2OutlinedIcon /> },
  { titulo: 'Medicamentos', rota: '/medicamentos', icone: <MedicationOutlinedIcon /> },
  { titulo: 'Insumos', rota: '/insumos', icone: <ScienceOutlinedIcon /> },
  { titulo: 'Estoque', rota: '/estoque', icone: <WarehouseOutlinedIcon /> },
  { titulo: 'Sincronizacao', rota: '/sincronizacao', icone: <SyncOutlinedIcon /> },
  { titulo: 'Usuarios', rota: '/usuarios', icone: <GroupOutlinedIcon /> },
];

type SidebarEstoqueProps = {
  abertoMobile: boolean;
  aoFecharMobile: () => void;
  ehMobile: boolean;
};

function ConteudoSidebar({ aoClicarItem }: { aoClicarItem?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ width: larguraSidebar, bgcolor: 'background.paper', height: '100%' }}>
      <Toolbar sx={{ minHeight: 72, px: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Canip Stock
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.2 }}>
        {itensNavegacao.map((item) => {
          const ativo = location.pathname === item.rota || location.pathname.startsWith(`${item.rota}/`);

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
    </Box>
  );
}

export function SidebarEstoque({ abertoMobile, aoFecharMobile, ehMobile }: SidebarEstoqueProps) {
  return ehMobile ? (
    <Drawer open={abertoMobile} onClose={aoFecharMobile} variant="temporary">
      <ConteudoSidebar aoClicarItem={aoFecharMobile} />
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
          borderRight: '1px solid rgba(255,255,255,0.08)',
          top: 0,
          height: '100vh',
        },
      }}
    >
      <ConteudoSidebar />
    </Drawer>
  );
}
