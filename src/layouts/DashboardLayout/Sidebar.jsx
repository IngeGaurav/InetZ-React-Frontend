import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { selectSidebarCollapsed } from '@/redux/slices/sidebarSlice';
import { useAuth } from '@/hooks/useAuth';
import { initials } from '@/utils/formatUtils';
import { componentTokens } from '@/theme';
import { REPORT_SINGLE_NAV } from './shellNav';
import ingeneroLogo from '@/assets/brand/ingenero-logo.png';

const t = componentTokens;

const Sidebar = () => {
  const isCollapsed = useSelector(selectSidebarCollapsed);
  const { user } = useAuth();

  return (
    <Box
      component="aside"
      sx={{
        flex: 'none',
        overflow: 'hidden',
        width: isCollapsed ? 0 : t.shell.railWidth,
        transition: 'width .28s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <Box
        sx={{
          width: t.shell.railWidth,
          height: '100%',
          flex: 'none',
          bgcolor: t.brand.gray,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Profile */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '12px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              flex: 'none',
              background: `linear-gradient(135deg, ${t.brand.orange}, ${t.brand.orangeHover})`,
              color: '#FFF',
              fontFamily: t.font.ui,
              fontWeight: 800,
              fontSize: '12.5px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
            }}
          >
            {initials(user?.userName ?? '') || 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ fontFamily: t.font.ui, fontWeight: 700, fontSize: '12px', color: '#FFF' }}
            >
              {user?.userName ?? 'User'}
            </Typography>
            <Typography
              noWrap
              sx={{ fontFamily: t.font.body, fontSize: '10px', color: 'rgba(255,255,255,0.72)' }}
            >
              {user?.role ?? ''}
            </Typography>
          </Box>
        </Box>

        {/* Nav */}
        <Box
          component="nav"
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            '&::-webkit-scrollbar': { width: '9px' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: '8px',
            },
          }}
        >
          {REPORT_SINGLE_NAV.map(({ label, to, icon: Icon }) => (
            <Box
              key={to}
              component={NavLink}
              to={to}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 11px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#FFF',
                backgroundColor: 'transparent',
                textDecoration: 'none',
                transition: 'background .15s',
                '&.active': {
                  backgroundColor: t.shell.railActiveBg,
                  boxShadow: '0 2px 7px rgba(0,0,0,0.2)',
                },
                '&.active .sidebar-nav-label': { fontWeight: 700 },
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  flex: 'none',
                  color: '#FFF',
                }}
              >
                <Icon size={18} />
              </Box>
              <Typography
                className="sidebar-nav-label"
                sx={{
                  fontFamily: t.font.ui,
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: 1.2,
                  color: '#FFF',
                }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box sx={{ padding: '12px 14px 16px' }}>
          <Box
            component="img"
            src={ingeneroLogo}
            alt="Ingenero — Excellence Through Insight"
            sx={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export { Sidebar };
