import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { api, unwrapResponseModel } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import { componentTokens } from '@/theme';
import inetzLogo from '@/assets/brand/inetz-logo.png';
import background from '@/assets/landing/background.png';
import logoutUser from '@/assets/landing/logout-user.png';
import homeIcon from '@/assets/landing/home.png';
import reportIcon from '@/assets/landing/report.png';
import ghgIcon from '@/assets/landing/ghg.png';
import userIcon from '@/assets/landing/user.png';

const t = componentTokens;
// Angular's `$indigo` card colour — no equivalent in the app theme (the landing page is a brand
// page over a photo); kept as the one local literal.
const INDIGO = '#13346C';
const NAV_HEIGHT = 48;

// Angular's `dashboardLink`, with its role rules (`show`) evaluated from the logged-in user instead
// of sessionStorage('rl'). Routes follow the React naming (/report/emission-dashboard →
// /dashboard/emission-dashboard; GHG Setup → /setup; User Setup → /user-management — the last two
// pages are not built yet, so those tiles land on the 404 route for now).
const TILES = [
  { name: 'Dashboard', route: ROUTES.DASHBOARD_EMISSION, icon: homeIcon, show: () => true },
  {
    name: 'Report',
    route: ROUTES.REPORT_REPORT,
    icon: reportIcon,
    show: (role) => role !== 'USER',
  },
  { name: 'GHG Setup', route: ROUTES.SETUP, icon: ghgIcon, show: (role) => role !== 'USER' },
  {
    name: 'User Setup',
    route: ROUTES.USER_MANAGEMENT,
    icon: userIcon,
    show: (role) => role !== 'USER' && role !== 'ADMIN',
  },
];

// Angular's per-tile icon sizing tweaks (index 1 = Report, 2 = GHG Setup).
const iconSx = (i, isHome) => ({
  height: i === 1 ? 40 : 45,
  width: i === 1 ? 40 : 45,
  ml: i === 1 ? '4px' : 0,
  mt: i === 1 || i === 2 ? '2px' : 0,
  objectFit: isHome ? 'inherit' : 'contain',
});

// 'Sun Jan 05 2026 14:03:09' — Angular's getFormattedDate().
const formatNow = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const p = (n) => String(n).padStart(2, '0');
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${p(date.getDate())} ${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};

/**
 * Landing page (Angular `/landing-page`) — the app's home after login. Port of
 * LandingPageComponent with the same logic: a top bar (logo, "GHG calculations … in progress"
 * ticker while a recalculation runs, date, logout, username) and a background with role-filtered
 * navigation tiles. The recalculation status (`GET general/progress`) is checked once on load and
 * polled every 4 s only while a run is in progress (< 98 %), exactly as Angular.
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useSelector(selectCurrentUser);
  const role = user?.role;

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const progressQ = useQuery({
    queryKey: ['landing', 'progress'],
    queryFn: () => api.get(endpoints.general.progress).then(unwrapResponseModel),
    // Poll only while a calculation is running.
    refetchInterval: (query) => (Number(query.state.data) < 98 ? 4000 : false),
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });
  const progressValue = progressQ.data;
  const showProgress = progressValue !== undefined && Number(progressValue) < 98;

  return (
    <>
      <PageTitle title="Home" />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <Box
          component="header"
          sx={{
            height: NAV_HEIGHT,
            flex: 'none',
            background: t.gradient.header,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: '24px',
            gap: '16px',
          }}
        >
          <Box
            component="img"
            src={inetzLogo}
            alt="iNetZ"
            sx={{ height: 32, width: 'auto', py: '8px', boxSizing: 'content-box', maxHeight: 32 }}
          />

          {showProgress && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', p: '10px' }}>
              <Box sx={{ position: 'relative', width: 25, height: 25, flex: 'none' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'red',
                    borderRadius: '50%',
                    opacity: 0.5,
                    animation: 'lp-pulse 1.8s infinite ease-out',
                    '@keyframes lp-pulse': {
                      '0%': { transform: 'scale(0.8)', opacity: 0.6 },
                      '70%': { transform: 'scale(2)', opacity: 0 },
                      '100%': { transform: 'scale(0.8)', opacity: 0 },
                    },
                  }}
                />
              </Box>
              <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', width: 600 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    pl: '100%',
                    animation: 'lp-scroll 15s linear infinite',
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: 16,
                    '@keyframes lp-scroll': {
                      '0%': { transform: 'translateX(0%)' },
                      '100%': { transform: 'translateX(-100%)' },
                    },
                  }}
                >
                  GHG calculations and Dashboard values updation is in progress ({progressValue} %
                  Complete). Refer Dashboard and Report section after completion.
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Typography sx={{ fontSize: 13, color: '#000' }}>{formatNow(now)}</Typography>
            <Box
              component="img"
              src={logoutUser}
              alt="Logout"
              title="Click to logout"
              onClick={logout}
              sx={{ width: 20, height: 20, mx: '10px', cursor: 'pointer' }}
            />
            <Typography
              title="User"
              sx={{ fontSize: 13, color: t.neutral[700], fontWeight: 700, ml: '8px' }}
            >
              {user?.userName}
            </Typography>
          </Box>
        </Box>

        {/* Background + tiles */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            alignItems: 'flex-start',
            pt: '48px',
            pl: { xs: '16px', lg: '8%' },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', width: 260 }}>
            {TILES.map((tile, i) =>
              tile.show(role) ? (
                <Box
                  key={tile.name}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(tile.route)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(tile.route)}
                  sx={{
                    my: '16px',
                    maxWidth: 225,
                    display: 'flex',
                    alignSelf: 'flex-start',
                    width: '100%',
                    bgcolor: INDIGO,
                    p: '10px 10px 10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    '&:focus-visible': { outline: '2px solid #FFF' },
                  }}
                >
                  <Box sx={{ height: 45, width: 45, flex: 'none' }}>
                    <Box
                      component="img"
                      src={tile.icon}
                      alt=""
                      sx={iconSx(i, tile.icon === homeIcon)}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 24,
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      px: '4px',
                      ml: '5px',
                      lineHeight: 'normal',
                      fontFamily: t.font.ui,
                    }}
                  >
                    {tile.name}
                  </Typography>
                  <Box sx={{ visibility: 'hidden' }}>a</Box>
                </Box>
              ) : null
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LandingPage;
