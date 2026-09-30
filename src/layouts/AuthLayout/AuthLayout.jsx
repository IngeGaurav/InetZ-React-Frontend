import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { componentTokens } from '@/theme';
import inetzLogo from '@/assets/brand/inetz-logo.png';

const t = componentTokens;

/**
 * Wraps public auth pages (Login, Forgot Password, Reset Password).
 * Split-panel design: brand gradient on the left, form on the right.
 */
const AuthLayout = () => (
  <Box
    sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, minHeight: '100vh' }}
  >
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        background: t.gradient.header,
      }}
    >
      <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
        <Box
          component="img"
          src={inetzLogo}
          alt="iNetZ"
          sx={{ height: 56, width: 'auto', mb: 3 }}
        />
        <Typography sx={{ fontSize: 18, color: '#FFF', opacity: 0.9, lineHeight: 1.6 }}>
          Enterprise-grade energy & emissions management, simplified.
        </Typography>
      </Box>
    </Box>

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        background: t.surface.canvas,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 380 }}>
        <Outlet />
      </Box>
    </Box>
  </Box>
);

export { AuthLayout };
