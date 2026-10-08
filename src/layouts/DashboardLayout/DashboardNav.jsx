import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ChevronDownIcon, ChevronRightIcon } from '@/components/icons';
import { useAuth } from '@/hooks/useAuth';
import { emissionDashboardService } from '@/services/emissionDashboardService';
import { queryKeys } from '@/constants/queryKeys';
import { ROUTES } from '@/constants/routes';
import { isWriteAccess } from '@/utils/accessUtils';
import { componentTokens } from '@/theme';
import { DASHBOARD_NAV } from './shellNav';

const t = componentTokens;

const rowSx = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 11px',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#FFF',
  backgroundColor: active ? t.shell.railActiveBg : 'transparent',
  boxShadow: active ? '0 2px 7px rgba(0,0,0,0.2)' : 'none',
  textDecoration: 'none',
  transition: 'background .15s',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  font: 'inherit',
});

const labelSx = (active) => ({
  fontFamily: t.font.ui,
  fontWeight: active ? 700 : 500,
  fontSize: '12px',
  lineHeight: 1.2,
  color: '#FFF',
});

// Selected child (a site / Equipment): bold text in the brand orange (dot included), no fill —
// unselected children are plain white text, slightly dimmed.
const childSx = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 11px 7px 14px',
  marginLeft: '12px',
  width: 'calc(100% - 12px)',
  borderRadius: '8px',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  textAlign: 'left',
  backgroundColor: 'transparent',
  color: active ? t.brand.orange : '#FFF',
  opacity: active ? 1 : 0.8,
  fontFamily: t.font.body,
  fontSize: '11.5px',
  fontWeight: active ? 800 : 500,
  transition: 'background .15s, opacity .15s, color .15s',
  '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  '&:focus-visible': { boxShadow: '0 0 0 2px rgba(255,255,255,0.55)' },
});

/**
 * Sidebar tree for the dashboard group. Port of Angular's side-bar (report.json menu):
 * "Monitor" → click goes to the organisation view and expands; the chevron only toggles; children
 * are one entry per site (from `general/site`) + "Equipment". Clicking a site you have no access
 * to shows "You don't have access to this site." and does not navigate. (Angular's own guard for
 * this never fires for site links because of a route comparison slip — here it works as
 * intended, per instruction; see docs/EMISSION_DASHBOARD_ANALYSIS.md B.3 / Q3.)
 */
export const DashboardNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [expanded, setExpanded] = useState(true);

  const sitesQ = useQuery({
    queryKey: queryKeys.emissionDashboard.sites(),
    queryFn: emissionDashboardService.getSites,
  });
  const sites = sitesQ.data ?? [];

  const activeSiteId = params.get('siteId');
  const onEmission = pathname === ROUTES.DASHBOARD_EMISSION;
  const onEquipment = pathname === ROUTES.DASHBOARD_EMISSION_EQUIPMENT;

  const goSite = (site) => {
    if (!isWriteAccess(user, site.id)) {
      toast.error("You don't have access to this site.");
      return;
    }
    const q = new URLSearchParams({ siteId: String(site.id), siteName: site.name ?? '' });
    navigate(`${ROUTES.DASHBOARD_EMISSION}?${q.toString()}`);
  };

  return DASHBOARD_NAV.filter((item) => !item.hideForRoles?.includes(user?.role)).map(
    ({ key, label, to, icon: Icon, expandable }) => {
      const active = expandable ? onEmission || onEquipment : pathname === to;
      return (
        <Box key={key}>
          <Box
            component="button"
            type="button"
            onClick={() => {
              navigate(to);
              if (expandable) {
                setExpanded(true);
              }
            }}
            sx={rowSx(active)}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                flex: 'none',
              }}
            >
              <Icon size={18} />
            </Box>
            <Typography sx={{ ...labelSx(active), flex: 1 }}>{label}</Typography>
            {expandable && (
              <Box
                component="span"
                role="button"
                aria-label={expanded ? 'Collapse' : 'Expand'}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                sx={{ display: 'inline-flex', opacity: 0.85 }}
              >
                {expanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
              </Box>
            )}
          </Box>
          {expandable && expanded && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', mt: '3px' }}>
              {sites.map((site) => (
                <Box
                  key={site.id}
                  component="button"
                  type="button"
                  onClick={() => goSite(site)}
                  sx={childSx(onEmission && activeSiteId === String(site.id))}
                >
                  <span className="child-dot">•</span>
                  <span>{site.name}</span>
                </Box>
              ))}
              <Box
                component="button"
                type="button"
                onClick={() => navigate(ROUTES.DASHBOARD_EMISSION_EQUIPMENT)}
                sx={childSx(onEquipment)}
              >
                <span className="child-dot">•</span>
                <span>Equipment</span>
              </Box>
            </Box>
          )}
        </Box>
      );
    }
  );
};
