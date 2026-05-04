
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Breadcrumbs,
  Link,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useConfig } from '@/contexts/ConfigContext';

const DRAWER_WIDTH = 260;

// Links de navegação
const NAV_ITEMS = [
  { label: 'Dashboard / Projetos', path: '/projetos', icon: <DashboardIcon /> },
];

export default function Layout() {
  const { mode, toggleMode } = useConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Gera breadcrumbs dinâmicos a partir da URL
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, idx) => {
    const path = '/' + pathSegments.slice(0, idx + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = idx === pathSegments.length - 1;

    return isLast ? (
      <Typography key={path} color="text.primary" variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    ) : (
      <Link
        key={path}
        color="text.secondary"
        underline="hover"
        variant="body2"
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate(path)}
      >
        {label}
      </Link>
    );
  });

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header do Drawer */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <TaskAltIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Task Manager
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gerencie seus projetos
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Links de navegação */}
      <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive ? 'rgba(108, 99, 255, 0.12)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  bgcolor: 'rgba(108, 99, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2026 Task Manager
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* AppBar com glassmorphism */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: mode === 'dark'
              ? 'rgba(17, 24, 39, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 1, color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ flex: 1 }}>
              <Link
                color="text.secondary"
                underline="hover"
                variant="body2"
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                onClick={() => navigate('/projetos')}
              >
                <FolderIcon sx={{ fontSize: 16 }} />
                Home
              </Link>
              {breadcrumbs}
            </Breadcrumbs>

            {/* Toggle Dark/Light Mode */}
            <IconButton onClick={toggleMode} sx={{ color: 'text.primary' }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Conteúdo das páginas (Outlet do react-router) */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }} className="page-enter">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
