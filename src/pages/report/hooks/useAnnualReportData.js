import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { queryKeys } from '@/constants/queryKeys';

// Hardcoded, matching Angular's report.component.ts yearList exactly — not derived from any
// config or backend value. See D:\InetZ\DECARB_REPORT_ANALYSIS.md B.7 (documented, not fixed).
export const YEAR_LIST = ['2022', '2023', '2024', '2025'];
const DEFAULT_YEAR = '2025';

// ── Boundary/equity table (Tab B) ───────────────────────────────────────────
// Verbatim port of ReportComponent.getOrganizationChart()'s per-site/per-plant loop, including
// its stale-value-carryover bug when a plant's site has a non-Equity, non-empty boundary type
// (the missing `else` branch — see DECARB_REPORT_ANALYSIS.md B.4). `bountyOrg`/`boundary` are
// intentionally declared once outside both loops so a non-matching iteration keeps the previous
// iteration's value, exactly as the Angular closure variable does.
function buildOrgData(orgChart, sites, orgDetails) {
  if (!orgChart?.children || !sites || !orgDetails) {
    return [];
  }
  const rows = [];
  // No initial value: the site loop's if/else-if/else always assigns both on its first
  // iteration before either is read (same as Angular's — its `= orgDetails?.share` initializer
  // is equally dead there), so nothing is lost by declaring these bare.
  let bountyOrg;
  let boundary;

  for (const site of orgChart.children) {
    const item = sites.find((s) => s.name === site.label);
    boundary = item?.boundary;
    if (item && item.equity && item.boundary === 'Equity') {
      bountyOrg = item.equity;
      boundary = item.boundary;
    } else if (!item?.boundary || item.boundary === '-1') {
      bountyOrg = orgDetails?.boundy === 'Equity' ? orgDetails.share : '-';
      boundary = orgDetails?.boundy;
    } else {
      bountyOrg = '-';
    }
    rows.push({
      siteId: site.id,
      label: site.label,
      plant: false,
      siteName: site.label,
      boundy: bountyOrg,
      boundary,
    });

    for (const plant of site.children ?? []) {
      const siteItem = sites.find((s) => s.name === site.label);
      if (siteItem && siteItem.equity && siteItem.boundary === 'Equity') {
        bountyOrg = siteItem.equity;
        boundary = siteItem.boundary;
      } else if (!siteItem?.boundary || siteItem.boundary === '-1') {
        bountyOrg = orgDetails?.boundy === 'Equity' ? orgDetails.share : '-';
        boundary = orgDetails?.boundary; // preserved as-is — see DECARB_REPORT_ANALYSIS.md B.4
      }
      // No `else` here — bountyOrg/boundary deliberately carry over from the previous
      // iteration when neither condition matches. Matches report.component.ts:550-559.
      rows.push({
        siteId: site.id,
        plant: true,
        plantId: plant.id,
        label: plant.label,
        siteName: site.label,
        boundy: bountyOrg,
        boundary,
      });
    }
  }
  return rows;
}

// ── Base-year / selected-year scope tables (Tab D, Table 1 & 2) ────────────
// Backend returns one flat list: [Scope1 total, ...per-site Scope1 rows, Scope2 total,
// ...per-site Scope2 rows]. Angular has two near-identical copies of this same site-filter
// logic (changeReportBaseYearScopeValues / changeReportEmisisoYearScopeValues) — unified here
// into one function since they were genuinely duplicate code, not distinct business rules.
function splitScopeRows(rawRows) {
  if (!rawRows?.length) {
    return { scope1: null, scope1Sites: [], scope2: null, scope2Sites: [] };
  }
  const scope1Idx = rawRows.findIndex((r) => r.scope === 'parent' && r.label === 'Scope1');
  const scope2Idx = rawRows.findIndex((r) => r.scope === 'parent' && r.label === 'Scope2');
  return {
    scope1: rawRows[scope1Idx],
    scope1Sites: rawRows.slice(scope1Idx + 1, scope2Idx === -1 ? undefined : scope2Idx),
    scope2: scope2Idx === -1 ? null : rawRows[scope2Idx],
    scope2Sites: scope2Idx === -1 ? [] : rawRows.slice(scope2Idx + 1),
  };
}

function filterScopeRowsBySite(rawRows, selectedSite) {
  const { scope1, scope1Sites, scope2, scope2Sites } = splitScopeRows(rawRows);
  if (!scope1 || !scope2) {
    return [];
  }
  if (selectedSite === 'All') {
    return [scope1, ...scope1Sites, scope2, ...scope2Sites];
  }
  const siteScope1 = scope1Sites.find((r) => r.label?.toLowerCase() === selectedSite.toLowerCase());
  const siteScope2 = scope2Sites.find((r) => r.label?.toLowerCase() === selectedSite.toLowerCase());
  const scope1Total = {
    ...scope1,
    co2e: siteScope1?.co2e,
    co2: siteScope1?.co2,
    ch4: siteScope1?.ch4,
    n2o: siteScope1?.n2o,
  };
  const scope2Total = {
    ...scope2,
    co2e: siteScope2?.co2e,
    co2: siteScope2?.co2,
    ch4: siteScope2?.ch4,
    n2o: siteScope2?.n2o,
  };
  return [scope1Total, siteScope1, scope2Total, siteScope2].filter(Boolean);
}

// ── Disaggregated-by-source table (Tab D, Table 3) ──────────────────────────
// Backend returns { sites: Record<name, Row[]>, plants: Record<name, Row[]> }, each pre-grouped
// server-side. Flattened into one row per group (one column per `type`), parent (site) rows
// with their matching child (plant) rows spliced in immediately after — the expandable tree.
function transformEmissionEntries(source, scope) {
  if (!source) {
    return [];
  }
  return Object.entries(source)
    .map(([plantName, items]) => {
      const row = { plantName, scope };
      if (items.length > 0) {
        row.siteId = items[0].siteId;
      }
      for (const item of items) {
        row[item.type] = item.co2e;
      }
      return row;
    })
    .sort((a, b) => a.siteId - b.siteId);
}

function buildOverallTableRows(outputEmissions) {
  if (!outputEmissions) {
    return [];
  }
  const parents = transformEmissionEntries(outputEmissions.sites, 'parent');
  const children = transformEmissionEntries(outputEmissions.plants, 'child');
  return parents.flatMap((parent) => [
    parent,
    ...children.filter((child) => child.siteId === parent.siteId),
  ]);
}

/**
 * All data-fetching + derived state for the Annual Report page (/report/report).
 * See D:\InetZ\DECARB_REPORT_ANALYSIS.md for the full Angular→backend trace this mirrors.
 */
export function useAnnualReportData() {
  const [selectedSite, setSelectedSite] = useState('All');
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);

  // dropdown + organisation have no real fetch-order dependency on each other (only their
  // *derived* dbName does) — fetched in parallel rather than replicating Angular's incidental
  // nested-subscribe timing.
  const dropdownQuery = useQuery({
    queryKey: queryKeys.report.dropdown('Database'),
    queryFn: () => reportService.getDropdown('Database'),
  });
  const organisationQuery = useQuery({
    queryKey: queryKeys.report.organisation(),
    queryFn: reportService.getOrganisation,
  });

  const sitesQuery = useQuery({
    queryKey: queryKeys.report.sites(),
    queryFn: reportService.getSites,
  });
  // Real dependency, matching Angular: the org chart's boundary/equity lookup needs the site
  // list already loaded.
  const orgChartQuery = useQuery({
    queryKey: queryKeys.report.orgChart(),
    queryFn: reportService.getOrgChart,
    enabled: !!sitesQuery.data,
  });

  const baseYearQuery = useQuery({
    queryKey: queryKeys.report.baseYearScopeValues(),
    queryFn: reportService.getBaseYearScopeValues,
  });
  const emissionYearQuery = useQuery({
    queryKey: queryKeys.report.emissionYearScopeValues(selectedYear),
    queryFn: () => reportService.getEmissionYearScopeValues(selectedYear),
  });

  const sites = sitesQuery.data;
  const sideList = useMemo(() => {
    if (!sites) {
      return ['All'];
    }
    return ['All', ...[...sites].sort((a, b) => a.id - b.id).map((s) => s.name)];
  }, [sites]);

  const currentSiteId = useMemo(() => {
    if (selectedSite === 'All' || !sites) {
      return 0;
    }
    return sites.find((s) => s.name === selectedSite)?.id ?? 0;
  }, [selectedSite, sites]);

  const outputEmissionsQuery = useQuery({
    queryKey: queryKeys.report.outputEmissions(currentSiteId, selectedYear),
    queryFn: () => reportService.getOutputEmissions(currentSiteId, selectedYear),
  });

  const dbName = useMemo(() => {
    const dropdown = dropdownQuery.data;
    const orgDetails = organisationQuery.data;
    if (!dropdown || !orgDetails) {
      return undefined;
    }
    return dropdown.find((d) => d.id == orgDetails.dbType)?.name; // eslint-disable-line eqeqeq -- backend mixes string/number ids, matches Angular's == here
  }, [dropdownQuery.data, organisationQuery.data]);

  const address = useMemo(() => {
    const raw = organisationQuery.data?.address;
    if (!raw) {
      return '';
    }
    try {
      const parsed = JSON.parse(raw);
      return `${parsed.addressLine1 ?? ''} ${parsed.addressLine2 ?? ''}`.trim();
    } catch {
      return '';
    }
  }, [organisationQuery.data]);

  const orgData = useMemo(
    () => buildOrgData(orgChartQuery.data, sitesQuery.data, organisationQuery.data),
    [orgChartQuery.data, sitesQuery.data, organisationQuery.data]
  );

  const baseYearRows = useMemo(
    () => filterScopeRowsBySite(baseYearQuery.data, selectedSite),
    [baseYearQuery.data, selectedSite]
  );
  const emissionYearRows = useMemo(
    () => filterScopeRowsBySite(emissionYearQuery.data, selectedSite),
    [emissionYearQuery.data, selectedSite]
  );

  const overallTableRows = useMemo(
    () => buildOverallTableRows(outputEmissionsQuery.data),
    [outputEmissionsQuery.data]
  );

  return {
    // filters
    selectedSite,
    setSelectedSite,
    selectedYear,
    setSelectedYear,
    sideList,
    yearList: YEAR_LIST,

    // Tab A/B/C/D static fields
    orgDetails: organisationQuery.data,
    dbName,
    address,
    orgData,

    // Tab D tables
    baseYearRows,
    emissionYearRows,
    overallTableRows,

    // loading — Angular has no per-section loading UI on this page (only the global
    // LoaderInterceptor spinner), reproduced by simply not gating render on these.
    isLoading:
      dropdownQuery.isLoading ||
      organisationQuery.isLoading ||
      sitesQuery.isLoading ||
      baseYearQuery.isLoading ||
      emissionYearQuery.isLoading ||
      outputEmissionsQuery.isLoading,
  };
}
