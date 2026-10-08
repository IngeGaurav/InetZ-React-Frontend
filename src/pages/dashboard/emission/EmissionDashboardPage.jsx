import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { AppSegmentedTabs } from '@/components/common/AppTabs/AppTabs';
import { GridDashboardIcon } from '@/components/icons';
import { C, CATEGORICAL, alpha, dm } from './emissionTheme';
import { KPI_TITLES, KPI_UNITS, TARGET_SCOPES, buildBreakdown, buildKpi } from './emissionAdapters';
import {
  dailyOptions,
  donutOptions,
  contributorsOptions,
  targetActualOptions,
  stackedAreaOptions,
  lineOptions,
} from './emissionChartOptions';
import { useEmissionDashboardData } from './hooks/useEmissionDashboardData';
import { PageHeader } from './components/PageHeader';
import { ChartCard, LegendInline } from './components/ChartCard';
import { KpiCard, PeriodCard } from './components/KpiCards';
import { BreakdownTable } from './components/BreakdownTable';

const OVERALL = 'Overall';
const BASIS = ['Location', 'Market'];

// Flex rows from the handoff: `flex: grow shrink basis`, wrapping.
const FlexRow = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'stretch',
      px: '4px',
      pt: '12px',
    }}
  >
    {children}
  </Box>
);
const Cell = ({ flex, children }) => (
  <Box sx={{ flex, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
);

/**
 * Emission Overview (/dashboard/emission-dashboard) — Organisation layout, or Site layout when a
 * `siteId` query param is present (set by the sidebar's per-site links). Visual layer ported from
 * the approved "Emission Overview" design handoff (organisation level); the Site layout reuses the
 * same cards/table/charts with the Angular site panel set. Data/behaviour port of Angular's
 * EmissionDashboardComponent — see docs/EMISSION_DASHBOARD_ANALYSIS.md. Plant layout not ported.
 */
const EmissionDashboardPage = () => {
  const [params] = useSearchParams();
  const siteId = params.get('siteId');
  const siteName = params.get('siteName') || 'Site';
  const hasSite = !!siteId;

  // false = Location, true = Market (what the backend's `marketBased=` means; Angular's
  // equivalent flag is named inverted — B.4). Persists across filter changes and navigation.
  const [market, setMarket] = useState(false);
  const [taScope, setTaScope] = useState(0);

  // Filter = a site (org layout) or a plant (site layout). Re-scopes every panel except the pie,
  // and the table (which always shows every column, highlighting the selected one). Reset on any
  // real navigation (siteId change), as Angular resets it on every query-param emission.
  const [filterState, setFilterState] = useState({ forSite: null, value: null });
  const filter = filterState.forSite === (siteId ?? null) ? filterState.value : null;
  const setFilter = (value) => setFilterState({ forSite: siteId ?? null, value });

  const data = useEmissionDashboardData({ siteId, filter, market });

  // Clicking a donut slice only HIGHLIGHTS it (pulled out, the rest dimmed) — it does not filter or
  // drill into the data; filtering is done with the title-row dropdown. Click again to clear.
  // Reset on navigation (siteId change), like the filter.
  const [pieState, setPieState] = useState({ forSite: null, name: null });
  const pieSel = pieState.forSite === (siteId ?? null) ? pieState.name : null;
  const togglePieSel = (name) =>
    setPieState({ forSite: siteId ?? null, name: pieSel === name ? null : name });

  const breakdown = useMemo(
    () => buildBreakdown(data.tableData, hasSite ? siteName : undefined),
    [data.tableData, hasSite, siteName]
  );

  const kpis = data.gauges.map((metric, i) => buildKpi(metric, KPI_TITLES[i], KPI_UNITS[i]));

  const selectByName = (name) => {
    const m = data.filterOptions.find((o) => o.name === name);
    setFilter(m ? { id: m.id, name: m.name } : null);
  };

  // ── charts ──
  const dailyOpts = useMemo(
    () => (data.monthly && !hasSite ? dailyOptions(data.monthly) : null),
    [data.monthly, hasSite]
  );

  // Donut: org → site-wise, site → plant-wise. It always shows every child — the dropdown filter
  // does not change it, it only highlights the filtered site/plant's slice.
  const donutItems = useMemo(
    () =>
      (data.pie?.labels ?? []).map((name, i) => ({
        name,
        y: data.pie.values[i] ?? 0,
        color: CATEGORICAL[i % CATEGORICAL.length],
      })),
    [data.pie]
  );
  // Highlighted slice: the dropdown-filtered site/plant, else the one the user clicked. While a
  // filter is active, slice clicks are ignored so the highlight can't disagree with the data shown.
  const highlightName = filter?.name ?? pieSel;
  const donutOpts = useMemo(
    () =>
      donutItems.length
        ? donutOptions({
            items: donutItems,
            selectedName: highlightName,
            onSliceClick: filter ? undefined : togglePieSel,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [donutItems, highlightName, filter, siteId, pieSel]
  );

  const contributorOpts = useMemo(
    () => (data.contributors.length ? contributorsOptions({ items: data.contributors }) : null),
    [data.contributors]
  );

  const taScopeName = TARGET_SCOPES[taScope];
  const taOpts = useMemo(() => {
    if (!data.targetVsActual) {
      return null;
    }
    const s = data.targetVsActual.byScope[taScopeName];
    return targetActualOptions({
      years: data.targetVsActual.years,
      actual: s.actual,
      target: s.target,
      baseline: data.gauges[taScope]?.baseline ?? 0,
    });
  }, [data.targetVsActual, data.gauges, taScope, taScopeName]);

  const siteMonthlyOpts = useMemo(
    () => (data.monthly && hasSite ? stackedAreaOptions(data.monthly) : null),
    [data.monthly, hasSite]
  );
  const historicalOpts = useMemo(
    () => (data.historical ? lineOptions(data.historical) : null),
    [data.historical]
  );

  const siteOrPlantName = filter?.name ?? siteName;
  const basisTabs = (
    <AppSegmentedTabs
      size="sm"
      items={BASIS}
      value={market ? 1 : 0}
      onChange={(i) => setMarket(i === 1)}
    />
  );

  return (
    <>
      <PageTitle title="Emission Overview" />
      <Box
        sx={{
          fontFamily: dm,
          color: C.pageText,
          bgcolor: C.page,
          minHeight: '100%',
          px: '18px',
          pb: '22px',
        }}
      >
        <PageHeader
          icon={<GridDashboardIcon size={19} />}
          title={hasSite ? `${siteName} Emission Overview` : 'Emission Overview'}
          subtitle={
            filter
              ? filter.name
              : hasSite
                ? 'Site-wide, all plants'
                : 'Organisation-wide, all sites'
          }
        >
          {data.filterOptions.length > 0 && (
            <Dropdown
              label={hasSite ? 'Plant' : 'Site'}
              options={[OVERALL, ...data.filterOptions.map((o) => o.name)]}
              value={filter?.name ?? OVERALL}
              width={190}
              compact
              onChange={(name) => (name === OVERALL ? setFilter(null) : selectByName(name))}
            />
          )}
        </PageHeader>

        {/* Row 1 — four KPI cards + This month / Today */}
        <Box
          sx={{
            px: '4px',
            pt: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {kpis.map((k) => (
            <KpiCard key={k.label} k={k} />
          ))}
          <PeriodCard month={data.period.month} today={data.period.today} />
        </Box>

        {hasSite ? (
          <>
            {/* Row 2 — one table per scope, as in Angular; the Location/Market basis tabs sit on
                the Scope 2 table (the only one the basis affects). */}
            <FlexRow>
              <Cell flex="1 1 360px">
                <BreakdownTable
                  flat
                  title="Scope 1 Emission Breakdown"
                  subtitle="tCO₂e by source category and plant"
                  breakdown={{ ...breakdown, sections: [breakdown.sections[0]] }}
                  highlight={filter?.name}
                  sx={{ flex: 1 }}
                />
              </Cell>
              <Cell flex="1 1 360px">
                <BreakdownTable
                  flat
                  title="Scope 2 Emission Breakdown"
                  subtitle="tCO₂e by source category and plant"
                  breakdown={{ ...breakdown, sections: [breakdown.sections[1]] }}
                  highlight={filter?.name}
                  headerExtra={basisTabs}
                  sx={{ flex: 1 }}
                />
              </Cell>
            </FlexRow>
            <FlexRow>
              <Cell flex="1 1 260px">
                <ChartCard
                  title="Plant-Wise Contribution"
                  subtitle="Share of total tCO₂e"
                  options={donutOpts}
                  height={250}
                  expandable={false}
                />
              </Cell>
              <Cell flex="1.3 1 340px">
                <ChartCard
                  title={`Monthly tCO₂e Emission - ${siteOrPlantName}`}
                  options={siteMonthlyOpts}
                  height={220}
                />
              </Cell>
              <Cell flex="1.7 1 400px">
                <ChartCard
                  title={`Historical tCO₂e Emission Progression - ${siteOrPlantName}`}
                  options={historicalOpts}
                  height={220}
                />
              </Cell>
            </FlexRow>
          </>
        ) : (
          <>
            <FlexRow>
              <Cell flex="1 1 260px">
                <ChartCard
                  title="Site-wise Contribution"
                  subtitle="Share of total tCO₂e"
                  options={donutOpts}
                  height={250}
                  expandable={false}
                />
              </Cell>
              <Cell flex="2 1 480px">
                <ChartCard
                  title="Monthly tCO₂e Emission"
                  subtitle={data.monthly?.rangeLabel}
                  options={dailyOpts}
                  height={200}
                  headerExtra={basisTabs}
                  legend={
                    <LegendInline
                      items={[
                        { name: 'Scope 1', color: C.tealLight },
                        { name: 'Scope 2', color: C.teal },
                      ]}
                    />
                  }
                />
              </Cell>
              <Cell flex="1 1 300px">
                <ChartCard
                  title="Top Contributors"
                  subtitle="Equipment ranked by tCO₂e"
                  options={contributorOpts}
                  height={222}
                  expandable={false}
                />
              </Cell>
            </FlexRow>
            <FlexRow>
              <Cell flex="1 1 440px">
                <ChartCard
                  title="Target vs Actual tCO₂e"
                  chartKey={taScope}
                  subtitle={data.targetVsActual?.subtitle}
                  options={taOpts}
                  height={200}
                  expandable={false}
                  headerExtra={
                    <AppSegmentedTabs
                      size="sm"
                      items={TARGET_SCOPES}
                      value={taScope}
                      onChange={setTaScope}
                    />
                  }
                  legend={
                    <LegendInline
                      items={[
                        { name: 'Actual', color: C.teal },
                        {
                          name: 'Target',
                          color: C.orange,
                          fill: alpha(C.orange, 0.28),
                          dashed: true,
                        },
                        { name: 'Baseline', color: C.copper, line: true },
                      ]}
                    />
                  }
                />
              </Cell>
              <Cell flex="1 1 460px">
                <BreakdownTable
                  title="Scope 1 and Scope 2 Emission Breakdown"
                  subtitle="tCO₂e by source category and site"
                  breakdown={breakdown}
                  highlight={filter?.name}
                  sx={{ flex: 1 }}
                />
              </Cell>
            </FlexRow>
          </>
        )}
      </Box>
    </>
  );
};

export default EmissionDashboardPage;
