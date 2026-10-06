// Reshapes useMonthlySummaryData()'s raw API response (real `output/monthlyReport` data) into
// the shapes the Monthly GHG Summary design handoff's components expect (its own
// monthlyGhgData.js mock shapes: PERIOD/OVERALL/SCOPES/SITES/PLANTS/EQUIPMENT). See
// docs/MONTHLY_SUMMARY_ANALYSIS.md for the full Angular→backend field trace.

const num = (v) => Number(v ?? 0);

// [prevLabel, currLabel] — backend's LinkedHashMap insertion order for
// `firstGraphOverallTco2e`/`firstGraphOverallTco2eIntencity` is already [lastMonth, currentMonth].
export function getPeriod(data) {
  return { prevLabel: data.lastMonth, currLabel: data.currentMonth };
}

export function getOverall(data) {
  return {
    total: Object.values(data.firstGraphOverallTco2e).map(num),
    intensity: Object.values(data.firstGraphOverallTco2eIntencity).map(num),
  };
}

// The design's mock computes its own decrease % client-side (`decPct`) because its mock data
// never included a real comparison label. The real backend already computes this exact
// percentage + "increase"/"decrease" wording server-side (`overallScope1tCO2eLabel`/
// `overallScope2tCO2e` — the field naming is inconsistent between the two, a real backend quirk,
// preserved as-is) — reused directly here rather than re-derived client-side, same principle as
// the Annual Report's "don't recalculate what the backend already computed."
export function getScopes(data) {
  return [
    {
      title: 'Overall Scope 1 tCO₂e',
      prev: num(data.overallScope1tCO2eLastMonth),
      curr: num(data.overallScope1tCO2eCurrentMonth),
      labelHtml: data.overallScope1tCO2eLabel,
      isDecrease: (data.overallScope1tCO2eLabel ?? '').toLowerCase().includes('decrease'),
    },
    {
      title: 'Overall Scope 2 tCO₂e',
      prev: num(data.overallScope2tCO2eLastMonth),
      curr: num(data.overallScope2tCO2eCurrentMonth),
      labelHtml: data.overallScope2tCO2e,
      isDecrease: (data.overallScope2tCO2e ?? '').toLowerCase().includes('decrease'),
    },
  ];
}

// Real `siteModel` has no per-site abbreviation the way the design's mock `short` field does —
// derived here as the first word of the site name (good enough for x-axis labels; a site named
// with a single word renders in full).
export function getSites(data) {
  return Object.keys(data.siteModel.curentMonth).map((name) => ({
    key: name,
    short: name.split(' ')[0],
    prev: num(data.siteModel.lastMonth[name]),
    curr: num(data.siteModel.curentMonth[name]),
  }));
}

// Real `plantModel` has no site association per plant (unlike the design's mock `PLANTS`, which
// nests each plant under a `site` so the Plant filter's options can be scoped to the selected
// sites). Angular's own plant filter is independent of the site filter for the same reason — see
// docs/MONTHLY_SUMMARY_ANALYSIS.md. The Plant filter here always offers every plant.
export function getPlants(data) {
  return Object.keys(data.plantModel.curentMonth).map((name) => ({
    name: name.trim(),
    prev: num(data.plantModel.lastMonth[name]),
    curr: num(data.plantModel.curentMonth[name]),
  }));
}

// Real `equipmentWise.curentMonth`/`.lastMonth` are two independent lists (an equipment item
// present one month isn't guaranteed to appear in the other, and list order isn't guaranteed to
// match) — unlike the design's mock `EQUIPMENT`, which is one array with paired prev/curr values
// per item so both donuts share the same category order/colors. Unioned here by name so the two
// donuts stay visually consistent; a name missing from one side defaults to 0 for that month.
export function getEquipment(data) {
  const byName = new Map();
  for (const item of data.equipmentWise.lastMonth ?? []) {
    byName.set(item.equipmentName, { name: item.equipmentName, prev: num(item.co2e), curr: 0 });
  }
  for (const item of data.equipmentWise.curentMonth ?? []) {
    const existing = byName.get(item.equipmentName);
    if (existing) {
      existing.curr = num(item.co2e);
    } else {
      byName.set(item.equipmentName, { name: item.equipmentName, prev: 0, curr: num(item.co2e) });
    }
  }
  return [...byName.values()];
}
