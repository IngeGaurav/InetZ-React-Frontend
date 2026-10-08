import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { C, dm, noto } from '../emissionTheme';

/**
 * Sticky page title row (same pattern as the Monthly Summary page): icon tile + title + subtitle
 * on the left, `children` (the Site/Plant filter dropdown) on the right. The filter lives here —
 * instead of being hidden behind a pie-slice click as in Angular — so users can find it
 * (docs/EMISSION_DASHBOARD_ANALYSIS.md Q5).
 */
export const PageHeader = ({ icon, title, subtitle, children }) => (
  <Box
    sx={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
      bgcolor: C.page,
      p: '10px 4px 8px',
      boxShadow: '0 8px 8px -8px rgba(47,47,47,0.10)',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          display: 'grid',
          placeItems: 'center',
          bgcolor: C.tintBg,
          border: `1px solid ${C.tintBorder}`,
          borderRadius: '10px',
          color: C.orangeDeep,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
        <Typography
          component="h1"
          noWrap
          sx={{
            m: 0,
            fontFamily: dm,
            fontSize: 20,
            fontWeight: 800,
            color: C.ink,
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: noto, fontSize: 12, color: C.subtle }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {children}
  </Box>
);
