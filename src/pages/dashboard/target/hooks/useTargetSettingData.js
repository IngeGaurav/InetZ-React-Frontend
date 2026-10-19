import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { targetSettingService as svc } from '@/services/targetSettingService';
import { emissionDashboardService } from '@/services/emissionDashboardService';
import { reportService } from '@/services/reportService';
import { queryKeys } from '@/constants/queryKeys';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { isWriteAccess, hasDashboardAccess } from '@/utils/accessUtils';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Data + the calculate mutation for /dashboard/target-setting (docs/TARGET_SETTING_ANALYSIS.md).
 * @param selectedSite  '' = organisation, else the site NAME the line chart is scoped to (the
 *                      backend's barChart endpoint takes a name, not an id).
 */
export function useTargetSettingData(selectedSite) {
  const queryClient = useQueryClient();
  const user = useSelector(selectCurrentUser);

  const targetsQ = useQuery({ queryKey: queryKeys.targetSetting.list(), queryFn: svc.getTargets });
  const pieQ = useQuery({ queryKey: queryKeys.targetSetting.pie(), queryFn: svc.getPieChart });
  const barQ = useQuery({
    queryKey: queryKeys.targetSetting.bar(selectedSite),
    queryFn: () => svc.getBarChart(selectedSite),
  });
  const sitesQ = useQuery({
    queryKey: queryKeys.emissionDashboard.sites(),
    queryFn: emissionDashboardService.getSites,
  });
  const orgQ = useQuery({
    queryKey: queryKeys.report.organisation(),
    queryFn: reportService.getOrganisation,
  });

  // Site dropdown: only sites the user has write access to (Angular: isWriteAccess filter).
  const sites = useMemo(
    () =>
      (sitesQ.data ?? [])
        .filter((s) => isWriteAccess(user, s.id))
        .map((s) => ({ id: s.id, name: s.name })),
    [sitesQ.data, user]
  );

  const rows = useMemo(() => targetsQ.data ?? [], [targetsQ.data]);

  // "Organization" summary row: sums of the site rows; the % reduction is the org-wide figure the
  // backend repeats on every row (Angular takes the last row's value).
  const orgRow = useMemo(() => {
    if (!rows.length) {
      return null;
    }
    return {
      scope1: Math.round(rows.reduce((a, r) => a + num(r.scope1), 0)),
      scope2: Math.round(rows.reduce((a, r) => a + num(r.scope2), 0)),
      total: Math.round(rows.reduce((a, r) => a + num(r.total), 0)),
      reduction: rows[rows.length - 1].totalReduction ?? null,
    };
  }, [rows]);

  const pie = useMemo(() => {
    const d = pieQ.data;
    return d?.label?.length ? { labels: d.label, values: (d.value ?? []).map(num) } : null;
  }, [pieQ.data]);

  // Line chart: Actual + Target by year; target zeros → null (gap), as Angular. Both arrays are
  // plotted against `label` by index (backend limitation — analysis B.11).
  const bar = useMemo(() => {
    const d = barQ.data;
    if (!d?.label?.length) {
      return null;
    }
    return {
      categories: d.label,
      actual: d.actual ?? [],
      target: (d.target ?? []).map((v) => (v === 0 ? null : v)),
    };
  }, [barQ.data]);

  const mutation = useMutation({
    mutationFn: svc.calculate,
    onSuccess: () => {
      toast.success('Record added successfully.');
      // Refetch EVERYTHING that depends on stored targets: this page's table, pie and — unlike
      // Angular, which left the line chart stale (analysis B.6) — the line chart; plus the Emission
      // Dashboard, whose gauges / Target-vs-Actual read the same rows.
      queryClient.invalidateQueries({ queryKey: queryKeys.targetSetting.all() });
      queryClient.invalidateQueries({ queryKey: ['emission-dashboard'] });
    },
    onError: (error) => {
      // The backend's failure body is the literal (misspelled) "failled" — not useful to a user.
      const msg =
        error.serverMessage && error.serverMessage !== 'failled' ? error.serverMessage : '';
      toast.error(
        msg ||
          'The calculation failed on the server. Check that the selected years have emission data for this site (and sector data for Sectoral Decarbonization).'
      );
    },
  });

  return {
    rows,
    orgRow,
    pie,
    bar,
    sites,
    orgName: orgQ.data?.name ?? 'Organization',
    canCalculate: hasDashboardAccess(user),
    mutation,
  };
}
