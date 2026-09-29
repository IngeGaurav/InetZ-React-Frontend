import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MenuIcon, HelpIcon, MailIcon, LogoutIcon } from '@/components/icons';
import { toggleSidebar } from '@/redux/slices/sidebarSlice';
import { useAuth } from '@/hooks/useAuth';
import { componentTokens } from '@/theme';
import inetzLogo from '@/assets/brand/inetz-logo.png';

const t = componentTokens;

const formatUpdatedAt = (date) => {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${month} ${date.getDate()}, ${date.getFullYear()} ${hh}:${mm}`;
};

const iconBtnSx = {
  border: 'none',
  background: 'transparent',
  borderRadius: '8px',
  color: '#666666',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  transition: 'background .15s',
  '&:hover': { background: 'rgba(255,255,255,0.28)' },
};

const Header = () => {
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const [updatedAt] = useState(() => formatUpdatedAt(new Date()));

  return (
    <Box
      component="header"
      sx={{
        height: `${t.shell.headerHeight}px`,
        flex: 'none',
        position: 'relative',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '0 18px 0 14px',
        background: t.gradient.header,
        boxShadow: '0 2px 10px rgba(90,66,30,0.16), 0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Box
          component="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle navigation"
          sx={{ ...iconBtnSx, width: 32, height: 32 }}
        >
          <MenuIcon size={19} />
        </Box>
        <Box
          component="img"
          src={inetzLogo}
          alt="iNetZ"
          sx={{ height: '30px', width: 'auto', display: 'block' }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#666666' }}>
        <Typography
          sx={{
            fontFamily: t.font.body,
            fontSize: '12.5px',
            fontWeight: 600,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          Last Updated : <Box component="span">{updatedAt}</Box>
        </Typography>

        <Box sx={{ width: '1px', height: '20px', background: 'rgba(102,102,102,0.35)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Box component="button" title="Help" sx={{ ...iconBtnSx, width: 30, height: 30 }}>
            <HelpIcon size={17} />
          </Box>
          <Box component="button" title="Messages" sx={{ ...iconBtnSx, width: 30, height: 30 }}>
            <MailIcon size={17} />
          </Box>
          <Box
            component="button"
            title="Sign out"
            onClick={logout}
            sx={{ ...iconBtnSx, width: 30, height: 30 }}
          >
            <LogoutIcon size={17} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { Header };
