import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect';
import { C, CHART_COLORS, noto, dm } from './monthlySummaryTheme';
import { HighchartsChart } from './components/HighchartsChart';
import {
  Bullets,
  Legend,
  ChartHeader,
  Empty,
  cardSx,
  titleSx,
} from './components/MonthlySummaryPrimitives';
import {
  overallChartOptions,
  siteChartOptions,
  plantChartOptions,
  donutChartOptions,
} from './components/monthlyChartOptions';
import { useMonthlySummaryData } from './hooks/useMonthlySummaryData';

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

  const overallOpts = useMemo(
    () =>
      overall
        ? overallChartOptions({
            prevLabel: period.prevLabel,
            currLabel: period.currLabel,
            overall,
            colors: CHART_COLORS,
          })
        : null,
    [overall, period]
  );
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
  const plantOpts = useMemo(
    () =>
      period
        ? plantChartOptions({
            plants: plantsWithColor,
            prevLabel: period.prevLabel,
            currLabel: period.currLabel,
          })
        : null,
    [plantsWithColor, period]
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
          <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h3" sx={{ ...titleSx, textAlign: 'center' }}>
              Overall tCO₂e emissions and intensity
            </Typography>
            <HighchartsChart options={overallOpts} height={200} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <Legend items={[{ name: 'tCO₂e', color: CHART_COLORS.prev }]} />
              <Legend items={[{ name: 'Intensity', color: CHART_COLORS.curr }]} square={false} />
            </Box>
          </Box>

          <Box sx={{ ...cardSx, p: '4px 18px', display: 'flex', flexDirection: 'column' }}>
            {scopes.map((s, i) => (
              <Box
                key={s.title}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '10px',
                  py: '8px',
                  borderBottom: i < scopes.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <Typography component="h3" sx={{ ...titleSx, textAlign: 'center' }}>
                  {s.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      fontFamily: noto,
                      fontSize: 13,
                      color: C.muted,
                    }}
                  >
                    <span>
                      {period.currLabel}:{' '}
                      <strong style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
                        {Math.round(s.curr).toLocaleString('en-US')}
                      </strong>
                    </span>
                    <span>
                      {period.prevLabel}:{' '}
                      <strong style={{ fontWeight: 700, color: C.body }}>
                        {Math.round(s.prev).toLocaleString('en-US')}
                      </strong>
                    </span>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '10px',
                      bgcolor: C.errorHalo,
                      color: C.error,
                      fontSize: 20,
                      lineHeight: 1,
                    }}
                  >
                    {s.isDecrease ? '\u25bc' : '\u25b2'}
                  </Box>
                </Box>
                <Typography
                  sx={{ fontFamily: noto, fontSize: 13, color: C.body }}
                  dangerouslySetInnerHTML={{ __html: s.labelHtml }}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ ...cardSx, p: '16px 20px' }}>
            <Bullets items={insights.overall} maxHeight={232} />
          </Box>
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
          <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
            <ChartHeader title="Plant-wise tCO₂e emissions">
              <MultiSelect
                options={allPlantNames}
                selected={filteredPlants.map((p) => p.name)}
                onToggle={togglePlant}
              />
            </ChartHeader>
            {filteredPlants.length ? (
              <HighchartsChart options={plantOpts} height={210} />
            ) : (
              <Empty text="No plants selected." />
            )}
            <Legend items={plantsWithColor.map((p) => ({ name: p.name, color: p.color }))} />
          </Box>
          <Box sx={{ ...cardSx, maxHeight: 300, overflowY: 'auto' }}>
            <Bullets items={insights.plant} />
          </Box>
        </Box>

        {/* Row 3 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Box
            sx={{
              ...cardSx,
              flex: '1.6 1 520px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                [period.prevLabel, donutPrev],
                [period.currLabel, donutCurr],
              ].map(([label, opts]) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Typography component="h3" sx={titleSx}>
                    Equipment-Wise tCO₂e Contribution
                  </Typography>
                  {opts && <HighchartsChart options={opts} height={170} />}
                  <Typography
                    sx={{ fontFamily: noto, fontSize: 13, fontWeight: 700, color: C.muted }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Legend
              items={equipment.map((e, i) => ({
                name: e.name,
                color: CHART_COLORS.categorical[i % CHART_COLORS.categorical.length],
              }))}
            />
          </Box>
          <Box sx={{ ...cardSx, flex: '1 1 300px', maxHeight: 300, overflowY: 'auto' }}>
            <Bullets items={insights.equipment} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MonthlySummaryPage;
