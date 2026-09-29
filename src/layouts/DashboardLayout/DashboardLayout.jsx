import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { componentTokens } from '@/theme';

const t = componentTokens;

const DashboardLayout = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: t.surface.canvas,
        fontFamily: t.font.ui,
      }}
    >
      <Header />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            background: t.shell.mainBg,
            '&::-webkit-scrollbar': { width: '9px', height: '9px' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: t.border.default,
              borderRadius: '8px',
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export { DashboardLayout };
