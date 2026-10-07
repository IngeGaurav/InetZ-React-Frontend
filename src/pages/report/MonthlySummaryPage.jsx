import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect';
import { C, CHART_COLORS, noto, dm } from './monthlySummaryTheme';
import { HighchartsChart } from './components/HighchartsChart';
import { EquipmentSummaryCard } from './components/EquipmentSummaryCard';
import { PlantSummaryCard } from './components/PlantSummaryCard';
import {
  SummaryCard,
  Legend,
  ChartHeader,
  Empty,
  StatTile,
  cardSx,
  titleSx,
} from './components/MonthlySummaryPrimitives';
import { siteChartOptions, donutChartOptions } from './components/monthlyChartOptions';
import { useMonthlySummaryData } from './hooks/useMonthlySummaryData';

// Small increase/decrease badge. Styling follows the design handoff (error red on error halo for
// both directions; only the arrow changes). `html` is backend-composed or built from backend values.
const ChangeBadge = ({ html, isDecrease }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      alignSelf: 'flex-start',
      px: '8px',
      py: '3px',
      borderRadius: '6px',
      bgcolor: C.errorHalo,
      color: C.error,
      fontFamily: noto,
      fontSize: 11.5,
    }}
  >
    <span>{isDecrease ? '▼' : '▲'}</span>
    <span dangerouslySetInnerHTML={{ __html: html }} />
  </Box>
);

/**
 * Monthly GHG Summary (/report/monthly-summary) — visual layer ported pixel-accurately from the
 * approved design handoff (C:\Users\gpetkar\Desktop\report page code\MonthlyGHGSummary.jsx),
 * wired to real API data via useMonthlySummaryData(). No sidebar/top bar of its own — this page
 * renders as a child of the app's real DashboardLayout (Sidebar + Header) via routing, unlike the
 * handoff's own EmptySidebar/EmptyTopBar placeholders, which aren't used at all. See
 * docs/MONTHLY_SUMMARY_ANALYSIS.md for the full Angular→backend trace and every deviation from
 * the handoff, documented with reasoning.
 */
const MonthlySummaryPage = () => {
  const {
    isLoading,
    data,
    period,
    overall,
    scopes,
    allSiteKeys,
    allPlantNames,
    siteSel,
    toggleSite,
    togglePlant,
    filteredSites,
    filteredPlants,
    equipment,
    insights,
  } = useMonthlySummaryData();

  const plantsWithColor = useMemo(
    () =>
      filteredPlants.map((p, i) => ({
        ...p,
        color: CHART_COLORS.categorical[i % CHART_COLORS.categorical.length],
      })),
    [filteredPlants]
  );

  // Four headline tiles: overall tCO₂e, intensity, Scope 1, Scope 2. Scope tiles reuse the
  // backend's own comparison label; total/intensity have no backend label, so their % change is
  // derived here from the two backend values (simple delta, not a recalculated business figure).
  const summaryTiles = useMemo(() => {
    if (!overall || !scopes.length) {
      return [];
    }
    const fmt0 = (n) => Math.round(n).toLocaleString('en-US');
    const deltaHtml = (prev, curr) => {
      const pct = prev ? Math.round(((curr - prev) / prev) * 100) : 0;
      return {
        html: `<b>${Math.abs(pct)}%</b> ${pct < 0 ? 'decrease' : 'increase'} over previous month`,
        isDecrease: pct < 0,
      };
    };
    const [prevTotal, currTotal] = overall.total;
    const [prevInt, currInt] = overall.intensity;
    const total = deltaHtml(prevTotal, currTotal);
    const intensity = deltaHtml(prevInt, currInt);
    const [s1, s2] = scopes;
    return [
      {
        label: 'Overall tCO₂e',
        value: fmt0(currTotal),
        prevValue: fmt0(prevTotal),
        bg: C.gradTeal,
        border: C.tealBorder,
        accent: C.gradTealTone,
        badge: <ChangeBadge {...total} />,
      },
      {
        label: 'Intensity',
        value: currInt.toFixed(2),
        prevValue: prevInt.toFixed(2),
        bg: C.gradSand,
        border: C.n200,
        accent: C.gradSandTone,
        badge: <ChangeBadge {...intensity} />,
      },
      {
        label: 'Scope 1 tCO₂e',
        value: fmt0(s1.curr),
        prevValue: fmt0(s1.prev),
        bg: C.gradSuccess,
        border: C.successBg,
        accent: C.gradSuccessTone,
        badge: <ChangeBadge html={s1.labelHtml} isDecrease={s1.isDecrease} />,
      },
      {
        label: 'Scope 2 tCO₂e',
        value: fmt0(s2.curr),
        prevValue: fmt0(s2.prev),
        bg: C.gradSuccess,
        border: C.successBg,
        accent: C.gradSuccessTone,
        badge: <ChangeBadge html={s2.labelHtml} isDecrease={s2.isDecrease} />,
      },
    ];
  }, [overall, scopes]);
  const siteOpts = useMemo(
    () =>
      period
        ? siteChartOptions({
            sites: filteredSites,
            prevLabel: period.prevLabel,
            currLabel: period.currLabel,
            colors: CHART_COLORS,
          })
        : null,
    [filteredSites, period]
  );
  const donutPrev = useMemo(
    () =>
      equipment.length
        ? donutChartOptions({ items: equipment, key: 'prev', colors: CHART_COLORS })
        : null,
    [equipment]
  );
  const donutCurr = useMemo(
    () =>
      equipment.length
        ? donutChartOptions({ items: equipment, key: 'curr', colors: CHART_COLORS })
        : null,
    [equipment]
  );

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageTitle title="Monthly Summary" />
      <Box
        sx={{
          fontFamily: dm,
          color: C.pageText,
          bgcolor: C.page,
          minHeight: '100%',
          px: '18px',
          pb: '24px',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            bgcolor: C.page,
            p: '12px 4px 14px',
            mb: '14px',
            boxShadow: '0 8px 8px -8px rgba(47,47,47,0.10)',
          }}
        >
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
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19h16" />
              <path d="M7 16V10" />
              <path d="M12 16V5" />
              <path d="M17 16v-4" />
            </svg>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <Typography
              component="h1"
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
              Monthly GHG Summary
            </Typography>
            <Typography sx={{ fontFamily: noto, fontSize: 12, color: C.subtle }}>
              {period.currLabel} compared with {period.prevLabel}
            </Typography>
          </Box>
        </Box>

        {/* Row 1 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
            mb: '12px',
          }}
        >
          {/* Card 1 — the four headline numbers as tiles (replaces the old overall chart + scope card). */}
          <Box sx={{ ...cardSx, p: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: '16px', py: '10px', borderBottom: `1px solid ${C.border}` }}>
              <Typography component="h3" sx={titleSx}>
                Overall Summary · {period.currLabel} vs {period.prevLabel}
              </Typography>
            </Box>
            <Box
              sx={{
                p: '12px',
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
              }}
            >
              {summaryTiles.map((tile) => (
                <StatTile
                  key={tile.label}
                  currLabel={period.currLabel}
                  prevLabel={period.prevLabel}
                  {...tile}
                />
              ))}
            </Box>
          </Box>

          {/* Card 2 — narrative summary. */}
          <SummaryCard items={insights.overall} />
        </Box>

        {/* Row 2 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
            mb: '12px',
          }}
        >
          <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
            <ChartHeader title="Site-wise tCO₂e emissions">
              <MultiSelect options={allSiteKeys} selected={siteSel} onToggle={toggleSite} />
            </ChartHeader>
            {filteredSites.length ? (
              <HighchartsChart options={siteOpts} height={210} />
            ) : (
              <Empty text="No sites selected." />
            )}
            <Legend
              items={[
                { name: period.prevLabel, color: CHART_COLORS.prev },
                { name: period.currLabel, color: CHART_COLORS.curr },
              ]}
            />
          </Box>
          <PlantSummaryCard
            plants={plantsWithColor}
            period={period}
            allPlantNames={allPlantNames}
            onTogglePlant={togglePlant}
          />
          <SummaryCard items={insights.plant} />
        </Box>

        {/* Row 3 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
          }}
        >
          <EquipmentSummaryCard
            equipment={equipment}
            period={period}
            donutPrev={donutPrev}
            donutCurr={donutCurr}
          />
          <SummaryCard items={insights.equipment} />
        </Box>
      </Box>
    </>
  );
};

export default MonthlySummaryPage;
