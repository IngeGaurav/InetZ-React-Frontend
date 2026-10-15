// Pure data-shape translation + the client-side business logic ported from Angular's
// EmissionDashboardComponent / EquipmentEmissionComponent (docs/EMISSION_DASHBOARD_ANALYSIS.md A.7),
// reshaped for the "Emission Overview" design handoff. No React, no fetching. Numbers coming off
// the wire are coerced with Number(); anything non-finite (the backend can emit "NaN"/"Infinity"
// on degenerate data — B.16) is treated as "no data" instead of being drawn.
import { SCOPE_COLORS } from './emissionTheme';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ── KPI cards ─────────────────────────────────────────────────────────────────
// Angular's buildGaugeMetric: value / target / baseline come from `value`,
// `scope2TargetPresetYearValues`, `scope2BaseYearValue` for EVERY card (the field names are
// misleading, B.13 — they hold the selected scope's own target/baseline). Dropped when the
// headline value is not a finite number (the backend can emit "NaN", B.16).
export const buildGaugeMetric = (data, decimals = 0) => {
  if (!data) {
    return null;
  }
  const value = Number(data.value);
  if (!Number.isFinite(value)) {
    return null;
  }
  return {
    value,
    target: num(data.scope2TargetPresetYearValues),
    baseline: num(data.scope2BaseYearValue),
    decimals,
  };
};

export const KPI_TITLES = [
  'Total tCO₂e Emission',
  'Scope 1 tCO₂e',
  'Scope 2 tCO₂e',
  'Emission Intensity',
];
export const KPI_UNITS = ['tCO₂e', 'tCO₂e', 'tCO₂e', 'tCO₂e/t'];

// Port of the handoff's kpi(): progress fill = actual (track max = max(baseline, target, actual)),
// tick = target, colour teal when actual ≤ target, error when above, neutral when no target.
export const buildKpi = (metric, label, unit) => {
  if (!metric) {
    return { label, unit, empty: true };
  }
  const { value: actual, target, baseline, decimals } = metric;
  const has = target > 0;
  const max = Math.max(baseline, target, actual) || 1;
  const f = (v) => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US'));
  const under = has && actual <= target;
  return {
    label,
    unit,
    value: f(actual),
    hasTarget: has,
    target: has ? f(target) : 'Not set',
    baseline: baseline > 0 ? f(baseline) : 'Not set',
    fill: has ? Math.min(100, (actual / max) * 100) : 100,
    mark: (target / max) * 100,
    state: !has ? 'none' : under ? 'under' : 'over',
    pill: has ? `${Math.round((actual / target) * 100)}% of target` : 'No target',
  };
};

// "This month / Today" card — `topGraphFifth` { monthCo2e, daillyCo2e }.
export const buildPeriod = (fifth) => ({
  month: num(fifth?.monthCo2e),
  today: num(fifth?.daillyCo2e),
});

// ── Series helpers ────────────────────────────────────────────────────────────
// Scope series come back named 'scope1' / 'Scope1' / 'scope2' / 'Total' depending on endpoint.
// Angular assigned names/colours by array index (and the backend groups through a HashMap, so
// index order is not guaranteed); matching on the name first gives the same result when the order
// happens to line up and the correct one when it doesn't. Falls back to index for unknown names.
const scopeKey = (name, index, fallbackOrder) => {
  const n = String(name ?? '')
    .toLowerCase()
    .replace(/\s+/g, '');
  if (n === 'scope1') {
    return 'scope1';
  }
  if (n === 'scope2') {
    return 'scope2';
  }
  if (n === 'total') {
    return 'total';
  }
  return fallbackOrder[index] ?? 'total';
};
const SCOPE_LABEL = { total: 'Total', scope1: 'Scope 1', scope2: 'Scope 2' };

// The backend multiplies every Scope 2 value in tableMonthlyEmission / overallGraph (and the
// site-level monthly + yearly graphs) by a hidden power-of-ten "ratio" so it is visible next to
// Scope 1 on a shared axis, and returns that ratio in the payload (B.5). The handoff plots
// Scope 2 *stacked on* Scope 1 and as its own single-scope chart, where inflated values would be
// plainly wrong — so the ratio the API already returns is divided back out here. Non-finite or
// non-positive ratios are ignored (values left as returned).
const unscale = (values, ratio) => {
  const r = Number(ratio);
  const k = Number.isFinite(r) && r > 0 ? r : 1;
  return (values ?? []).map((v) => (v === null || v === undefined ? v : num(v) / k));
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "07-09" (DD-MM) → "07 Sep"
const dayLabel = (ddmm) => {
  const [d, m] = String(ddmm).split('-');
  return MONTHS[Number(m) - 1] ? `${d} ${MONTHS[Number(m) - 1]}` : ddmm;
};

// Org "Daily tCO₂e Emission": {labels, scope1, scope2, total, scope2Ration} → stacked columns.
export const buildOrgMonthly = (data, now = new Date()) => {
  if (!data?.labels?.length) {
    return null;
  }
  const s1 = (data.scope1 ?? []).map(num);
  const s2 = unscale(data.scope2, data.scope2Ration).map(num);
  // The window is "last month to date" (B.11) and labels carry no year: assume the current year,
  // or the previous one for the first label if it is a later month than the last label's.
  const firstM = Number(String(data.labels[0]).split('-')[1]);
  const lastM = Number(String(data.labels[data.labels.length - 1]).split('-')[1]);
  const year = now.getFullYear();
  const firstYear = firstM > lastM ? year - 1 : year;
  const first = `${dayLabel(data.labels[0])}${firstYear !== year ? ` ${firstYear}` : ''}`;
  const range =
    data.labels.length > 1
      ? `${first} – ${dayLabel(data.labels[data.labels.length - 1])} ${year}`
      : `${first} ${year}`;
  return {
    categories: data.labels,
    s1,
    s2,
    rangeLabel: `${range} · Scope 1 and Scope 2`,
  };
};

// Site "Monthly tCO2e Emission" stacked area: [{name, label[], value[]}].
export const buildSiteMonthly = (data) => {
  if (!Array.isArray(data) || !data.length) {
    return null;
  }
  const categories = data[0]?.label ?? [];
  if (!categories.length) {
    return null;
  }
  return {
    categories,
    series: data.map((item, i) => {
      const key = scopeKey(item.name, i, ['scope1', 'scope2']);
      const values = key === 'scope2' ? unscale(item.value, item.scope2Ratio) : (item.value ?? []);
      return { name: SCOPE_LABEL[key], data: values, color: SCOPE_COLORS[key] };
    }),
  };
};

// Site "Historical tCO2e Emission Progression": [{name, label[], value[]}] → 3 lines.
export const buildHistorical = (data) => {
  if (!Array.isArray(data) || !data.length) {
    return null;
  }
  const categories = data[0]?.label ?? [];
  if (!categories.length) {
    return null;
  }
  return {
    categories,
    series: data.map((item, i) => {
      const key = scopeKey(item.name, i, ['total', 'scope1', 'scope2']);
      const values = key === 'scope2' ? unscale(item.value, item.scope2Ratio) : (item.value ?? []);
      return {
        name: SCOPE_LABEL[key] ?? `Series ${i + 1}`,
        type: 'line',
        data: values,
        color: SCOPE_COLORS[key],
      };
    }),
  };
};

// Org "Top Contributors": sum co2e per equipment key → top 5 descending.
export const buildTop5Contributors = (equipmentData) => {
  if (!equipmentData) {
    return [];
  }
  return Object.keys(equipmentData)
    .map((key) => ({
      name: key,
      value: (equipmentData[key] ?? []).reduce((sum, item) => sum + num(item.co2e), 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

// Org "Target vs Actual": per scope actual + target by year; every 0 → null (gap), as Angular's
// `toNullable`. Scope 2 arrays are un-scaled with their own ratios (actual: scope2Ratio, target:
// scope2RatioTarget).
export const TARGET_SCOPES = ['Total', 'Scope 1', 'Scope 2'];
export const buildTargetActual = (data) => {
  if (!data?.label?.length) {
    return null;
  }
  const nullable = (arr) =>
    (arr ?? []).map((v) => (v === 0 || v === null || v === undefined ? null : num(v)));
  const byScope = {
    Total: { actual: nullable(data.actualTotal), target: nullable(data.targetTotal) },
    'Scope 1': { actual: nullable(data.actualScope1), target: nullable(data.targetScope1) },
    'Scope 2': {
      actual: nullable(unscale(data.actualScope2, data.scope2Ratio)),
      target: nullable(unscale(data.targetScope2, data.scope2RatioTarget)),
    },
  };
  const years = data.label;
  const range = (arr) => {
    const ys = years.filter((_, i) => arr[i] !== null);
    if (!ys.length) {
      return null;
    }
    return ys.length > 1 ? `${ys[0]}–${ys[ys.length - 1]}` : ys[0];
  };
  const parts = [];
  if (range(byScope.Total.actual)) {
    parts.push(`Actual ${range(byScope.Total.actual)}`);
  }
  if (range(byScope.Total.target)) {
    parts.push(`Target ${range(byScope.Total.target)}`);
  }
  return { years, byScope, subtitle: parts.join(' · ') };
};

// ── Scope 1 / Scope 2 breakdown table ─────────────────────────────────────────
// Angular's MonitorSharedService.getSiteList + buildScopeRows. `data` is
// Record<type, [{siteId, type, plantName, co2e, scope}]>. `excludeName` (site layout) drops the
// site's own name from the columns — its value still counts toward each row's Total.
const uniqueSorted = (data, key) => {
  const items = Object.values(data)
    .flat()
    .filter((item) => item[key] !== null && item[key] !== undefined)
    .sort((a, b) => a.siteId - b.siteId);
  return Array.from(new Set(items.map((item) => item[key])));
};

// Backend `type` strings are raw lower-case SQL literals (stationary, mobile, process_emision
// [sic], fugitive, electricity, steam — see DecarbUtil), so the table maps them to display names.
const TYPE_LABELS = {
  stationary: 'Stationary',
  mobile: 'Mobile',
  process_emision: 'Process Emission',
  process_emission: 'Process Emission',
  fugitive: 'Fugitive',
  electricity: 'Electricity',
  steam: 'Steam',
};
export const formatTypeLabel = (type) =>
  TYPE_LABELS[String(type).toLowerCase()] ??
  String(type)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

// The design always lists every category (zeros shown as "—"), so the canonical set is seeded
// first and any other type the backend returns is appended.
const CANONICAL = {
  scope1: ['stationary', 'mobile', 'process_emision', 'fugitive'],
  scope2: ['electricity', 'steam'],
};

// → { columns, hasData, sections: [{ name, color, total, values[], rows: [{ name, total, values[] }] }] }
export const buildBreakdown = (data, excludeName) => {
  const columns = data
    ? uniqueSorted(data, 'plantName').filter((name) => name !== excludeName)
    : [];
  const grouped = { scope1: {}, scope2: {} };
  if (data) {
    Object.keys(data).forEach((key) => {
      (data[key] ?? []).forEach(({ scope, type, plantName, co2e }) => {
        if (!scope || !type || !plantName || !grouped[scope]) {
          return;
        }
        grouped[scope][type] = grouped[scope][type] ?? {};
        grouped[scope][type][plantName] = (grouped[scope][type][plantName] ?? 0) + num(co2e);
      });
    });
  }
  const section = (key, name, color) => {
    const types = [
      ...CANONICAL[key],
      ...Object.keys(grouped[key]).filter((type) => !CANONICAL[key].includes(type)),
    ];
    const rows = types.map((type) => {
      const byPlant = grouped[key][type] ?? {};
      return {
        name: formatTypeLabel(type),
        total: Object.values(byPlant).reduce((a, b) => a + b, 0),
        values: columns.map((col) => byPlant[col] ?? 0),
      };
    });
    return {
      name,
      color,
      rows,
      total: rows.reduce((a, r) => a + r.total, 0),
      values: columns.map((_, j) => rows.reduce((a, r) => a + r.values[j], 0)),
    };
  };
  return {
    columns,
    hasData: !!data && Object.keys(data).length > 0,
    sections: [
      section('scope1', 'Scope 1', SCOPE_COLORS.scope1),
      section('scope2', 'Scope 2', SCOPE_COLORS.scope2),
    ],
  };
};

// ── Pie ───────────────────────────────────────────────────────────────────────
export const buildPie = (data) =>
  data?.label?.length ? { labels: data.label, values: (data.value ?? []).map(num) } : null;

// ── Equipment overview ────────────────────────────────────────────────────────
export const buildEquipmentRows = (data) => {
  if (!data) {
    return { columns: [], rows: [] };
  }
  const columns = uniqueSorted(data, 'siteName');
  const labels = Object.keys(data);
  if (!columns.length || !labels.length) {
    return { columns: [], rows: [] };
  }
  const rows = labels.map((label, id) => {
    const items = data[label] ?? [];
    return {
      id,
      label,
      total: items.reduce((sum, item) => sum + num(item.co2e), 0),
      bySite: columns.map((col) => {
        const match = items.find((item) => item.siteName === col);
        return match ? num(match.co2e) : null;
      }),
    };
  });
  return { columns, rows };
};

// equipmentGraphBar → { [equipmentName]: { label[], value[] } }
export const buildProgressionByName = (data) => {
  const byName = {};
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item?.name) {
        byName[item.name] = { label: item.label ?? [], value: item.value ?? [] };
      }
    });
  }
  return byName;
};
