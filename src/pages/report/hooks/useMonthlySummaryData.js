import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { queryKeys } from '@/constants/queryKeys';
import {
  getPeriod,
  getOverall,
  getScopes,
  getSites,
  getPlants,
  getEquipment,
} from '../monthlySummaryAdapters';

/**
 * All data-fetching + derived state for the Monthly Summary page (/report/monthly-summary).
 * See docs/MONTHLY_SUMMARY_ANALYSIS.md for the full Angular→backend trace this mirrors.
 */
export function useMonthlySummaryData() {
  const query = useQuery({
    queryKey: queryKeys.monthlySummary.report(),
    queryFn: reportService.getMonthlyReport,
  });
  const data = query.data;

  const period = useMemo(() => (data ? getPeriod(data) : null), [data]);
  const overall = useMemo(() => (data ? getOverall(data) : null), [data]);
  const scopes = useMemo(() => (data ? getScopes(data) : []), [data]);
  const sites = useMemo(() => (data ? getSites(data) : []), [data]);
  const plants = useMemo(() => (data ? getPlants(data) : []), [data]);
  const equipment = useMemo(() => (data ? getEquipment(data) : []), [data]);

  const allSiteKeys = useMemo(() => sites.map((s) => s.key), [sites]);
  const allPlantNames = useMemo(() => plants.map((p) => p.name), [plants]);

  // null = "not yet customized by the user" → falls back to "everything selected", matching
  // Angular's `loadInitial=true` behavior (every site/plant starts selected) — same pattern as
  // the Annual Report's site filter, avoids needing an effect to seed initial selection.
  const [siteSelOverride, setSiteSelOverride] = useState(null);
  const [plantOffOverride, setPlantOffOverride] = useState({});
  const siteSel = siteSelOverride ?? allSiteKeys;

  const toggleSite = (key) =>
    setSiteSelOverride((cur) => {
      const base = cur ?? allSiteKeys;
      return base.includes(key) ? base.filter((k) => k !== key) : [...base, key];
    });
  const togglePlant = (name) => setPlantOffOverride((o) => ({ ...o, [name]: !o[name] }));

  const filteredSites = useMemo(
    () => sites.filter((s) => siteSel.includes(s.key)),
    [sites, siteSel]
  );
  const filteredPlants = useMemo(
    () => plants.filter((p) => !plantOffOverride[p.name]),
    [plants, plantOffOverride]
  );

  return {
    isLoading: query.isLoading,
    isError: query.isError,
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
    insights: data
      ? {
          overall: data.calculateSiteWise,
          plant: data.calculatePlantWise,
          equipment: data.calculateEquipmentWise,
        }
      : { overall: [], plant: [], equipment: [] },
  };
}
