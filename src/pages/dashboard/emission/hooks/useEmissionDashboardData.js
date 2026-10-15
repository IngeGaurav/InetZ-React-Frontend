import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { emissionDashboardService as svc } from '@/services/emissionDashboardService';
import { queryKeys } from '@/constants/queryKeys';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { isWriteAccess } from '@/utils/accessUtils';
import {
  buildGaugeMetric,
  buildPeriod,
  buildPie,
  buildOrgMonthly,
  buildSiteMonthly,
  buildHistorical,
  buildTop5Contributors,
  buildTargetActual,
} from '../emissionAdapters';

const K = queryKeys.emissionDashboard;

/**
 * All data fetching + derived state for /dashboard/emission-dashboard (Organisation and Site
 * layouts — the Plant layout is deliberately not ported, docs/EMISSION_DASHBOARD_ANALYSIS.md Q4).
 * Port of Angular's EmissionDashboardComponent.fetch*() methods; one TanStack query per backend
 * call, keyed so a Location/Market flip or a filter change refetches exactly what Angular does.
 *
 * @param siteId  string|null  `siteId` query param → Site layout when set
 * @param filter  { id, name } | null  Org layout: a site; Site layout: a plant. Re-scopes every
 *                panel except the pie (which always shows all children) and the filter options.
 * @param market  boolean  Scope 2 basis; sent as `marketBased=`
 */
export function useEmissionDashboardData({ siteId, filter, market }) {
  const user = useSelector(selectCurrentUser);
  const hasSite = !!siteId;
  const filterId = filter?.id ?? null;

  // Mirrors Angular's currentDataScope(): which backend scope family + id path to use.
  const scope = useMemo(() => {
    if (hasSite) {
      return { base: 'siteLevel', suffix: `/${siteId}/${filterId ?? 0}` };
    }
    if (filterId !== null) {
      return { base: 'site', suffix: `/${filterId}` };
    }
    return { base: 'organisation', suffix: '' };
  }, [hasSite, siteId, filterId]);
  const scopeKey = `${scope.base}${scope.suffix}`;

  // ── Lookups (name → id for the filter dropdown / pie click) ──
  const sitesQ = useQuery({ queryKey: K.sites(), queryFn: svc.getSites });
  const plantsQ = useQuery({
    queryKey: K.plants(siteId),
    queryFn: () => svc.getPlants(siteId),
    enabled: hasSite,
  });
  // Only sites the user can access are selectable (Angular: siteMeta is isWriteAccess-filtered).
  const siteMeta = useMemo(
    () =>
      (sitesQ.data ?? [])
        .filter((s) => isWriteAccess(user, s.id))
        .map((s) => ({ id: s.id, name: s.name })),
    [sitesQ.data, user]
  );
  const plantMeta = useMemo(
    () => (plantsQ.data ?? []).map((p) => ({ id: p.id, name: p.name })),
    [plantsQ.data]
  );

  // ── Pie (never filtered — always every child of the current layout) ──
  const pieQ = useQuery({
    queryKey: K.pie(siteId, market),
    queryFn: () => svc.getPieChart(siteId, market),
  });
  const pie = useMemo(() => buildPie(pieQ.data), [pieQ.data]);

  // Dropdown options = the pie's slices that resolve to a selectable site/plant, in pie order.
  // Matched by NAME (Angular's org pie matched by array index — B.6, which can pick the wrong site).
  const filterOptions = useMemo(() => {
    const meta = hasSite ? plantMeta : siteMeta;
    return (pie?.labels ?? []).map((name) => meta.find((m) => m.name === name)).filter(Boolean);
  }, [pie, hasSite, plantMeta, siteMeta]);

  // ── Gauges: Overall / Scope 1 / Scope 2 / Intensity ──
  // Request order matches Angular's titles: first, third(scope1), fourth(scope2), second(intensity).
  const g0 = useQuery({
    queryKey: K.gauge('first', scopeKey, market),
    queryFn: () => svc.getTopGraph('first', scope, market),
  });
  const g1 = useQuery({
    queryKey: K.gauge('third', scopeKey, market),
    queryFn: () => svc.getTopGraph('third', scope, market),
  });
  const g2 = useQuery({
    queryKey: K.gauge('fourth', scopeKey, market),
    queryFn: () => svc.getTopGraph('fourth', scope, market),
  });
  const g3 = useQuery({
    queryKey: K.gauge('second', scopeKey, market),
    queryFn: () => svc.getTopGraph('second', scope, market),
  });
  const gauges = useMemo(
    () => [g0.data, g1.data, g2.data, g3.data].map((d, i) => buildGaugeMetric(d, i === 3 ? 2 : 0)),
    [g0.data, g1.data, g2.data, g3.data]
  );

  // ── "This month / Today" ──
  // Angular only chased this once the first gauge had a baseline > 0, because it needed that
  // baseline for its linear gauges. The handoff shows just the two numbers, so it always loads.
  const fifthQ = useQuery({
    queryKey: K.gauge('fifth', scopeKey, market),
    queryFn: () => svc.getTopGraph('fifth', scope, market),
  });
  const period = useMemo(() => buildPeriod(fifthQ.data), [fifthQ.data]);

  // ── Monthly emission (org: column+line combo; site: stacked area) ──
  const monthlyQ = useQuery({
    queryKey: K.monthly(scopeKey, market),
    queryFn: () => svc.getMonthlyEmission(scope, market),
  });
  const monthly = useMemo(
    () => (hasSite ? buildSiteMonthly(monthlyQ.data) : buildOrgMonthly(monthlyQ.data)),
    [hasSite, monthlyQ.data]
  );

  // ── Org-only panels ──
  const contributorsQ = useQuery({
    queryKey: K.topContributors(filterId ?? 0, market),
    queryFn: () => svc.getEquipmentTable(filterId ?? 0, market),
    enabled: !hasSite,
  });
  const contributors = useMemo(
    () => buildTop5Contributors(contributorsQ.data),
    [contributorsQ.data]
  );

  const targetQ = useQuery({
    queryKey: K.targetVsActual(scopeKey, market),
    queryFn: () => svc.getOverallGraph(scope, market),
    enabled: !hasSite,
  });
  const targetVsActual = useMemo(() => buildTargetActual(targetQ.data), [targetQ.data]);

  // ── Scope 1 / Scope 2 breakdown table ──
  // The table is never re-scoped by the filter: the design always shows every site/plant column
  // and highlights the selected one (Angular's site layout didn't re-scope it either — B.10). So
  // the key deliberately ignores `filterId`.
  const tableKey = hasSite ? `siteLevel/${siteId}` : 'org';
  const tableQ = useQuery({
    queryKey: K.overallTable(tableKey, market),
    queryFn: () => svc.getOverallTable({ siteId, filterSiteId: null }, market),
  });

  // ── Site-only: historical progression ──
  const historicalQ = useQuery({
    queryKey: K.historical(scopeKey, market),
    queryFn: () => svc.getYearlyGraph(scope, market),
    enabled: hasSite,
  });
  const historical = useMemo(() => buildHistorical(historicalQ.data), [historicalQ.data]);

  return {
    hasSite,
    pie,
    filterOptions,
    gauges,
    period,
    monthly,
    contributors,
    targetVsActual,
    tableData: tableQ.data,
    historical,
  };
}
