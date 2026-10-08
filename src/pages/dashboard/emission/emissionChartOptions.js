// Highcharts option builders for the Emission Dashboard routes — ported from the "Emission
// Overview" design handoff (emission-charts.js / EmissionOverview.jsx), with every colour taken
// from emissionTheme.js (app palette) instead of the handoff's literals. Chart *titles* live in
// the card header, not in the chart.
import Highcharts from 'highcharts';
import { C, alpha, dm, CATEGORICAL } from './emissionTheme';

const fmt = (n) => Math.round(n).toLocaleString('en-US');

const kfmt = function () {
  const v = this.value;
  return v >= 1e6 ? `${v / 1e6}M` : v >= 1000 ? `${v / 1000}k` : v;
};
const axisLab = { style: { color: C.axisLabel, fontSize: '10.5px', fontWeight: '600' } };

const base = (extra) =>
  Highcharts.merge(
    {
      chart: { backgroundColor: 'transparent', style: { fontFamily: dm }, spacing: [10, 6, 6, 4] },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: false },
      accessibility: { enabled: false },
      exporting: { enabled: false, fallbackToExportServer: false },
      tooltip: {
        backgroundColor: C.card,
        borderColor: C.tooltipBorder,
        borderRadius: 10,
        padding: 10,
        useHTML: true,
        style: { color: C.body, fontSize: '11.5px', fontFamily: dm },
        shadow: { color: 'rgba(40,30,20,0.12)', offsetX: 0, offsetY: 6, width: 14 },
      },
      // Never rotate x labels (a narrow card would tilt them 45deg); overlapping ones are skipped.
      xAxis: {
        lineColor: C.n200,
        tickLength: 0,
        labels: {
          ...axisLab,
          autoRotation: false,
        },
      },
      yAxis: {
        title: { text: null },
        gridLineColor: C.grid,
        gridLineDashStyle: 'Dash',
        labels: { ...axisLab, formatter: kfmt },
      },
      plotOptions: { series: { animation: { duration: 700 } } },
    },
    extra
  );

const tipRow = (color, name, val) =>
  `<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;min-width:150px"><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:6px"></span>${name}</span><b>${val}</b></div>`;

const sharedTip = function () {
  let s = `<div style="font-weight:800;margin-bottom:6px">${this.points[0].point.category ?? this.x}</div>`;
  this.points.forEach((p) => {
    s += tipRow(p.color, p.series.name, fmt(p.y));
  });
  return s;
};

const smallLegend = {
  enabled: true,
  itemStyle: { color: C.body, fontSize: '11px', fontWeight: '600' },
  symbolRadius: 3,
};

// ── Daily emission: stacked Scope 2 (bottom) + Scope 1 columns, tooltip with total ──────────
export function dailyOptions({ categories, s1, s2 }) {
  return base({
    chart: { type: 'column' },
    // A date label every 3rd day. Bars and tooltips still cover every day.
    // A date label every 3rd day, slightly smaller so adjacent labels keep a gap in a narrow card.
    xAxis: { categories, labels: { step: 3, style: { fontSize: '9.5px' } } },
    yAxis: { min: 0 },
    tooltip: {
      shared: true,
      formatter() {
        let s = `<div style="font-weight:800;margin-bottom:6px">${this.points[0].point.category ?? this.x}</div>`;
        let total = 0;
        this.points.forEach((p) => {
          total += p.y;
          s += tipRow(p.color, p.series.name, fmt(p.y));
        });
        return `${s}<div style="border-top:1px solid ${C.divider};margin-top:6px;padding-top:6px">${tipRow(C.orange, 'Total', fmt(total))}</div>`;
      },
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        borderWidth: 0,
        borderRadius: 3,
        pointPadding: 0.08,
        groupPadding: 0.12,
      },
    },
    series: [
      { name: 'Scope 2', data: s2, color: C.teal },
      { name: 'Scope 1', data: s1, color: C.tealLight },
    ],
  });
}

// ── Donut with the total in the centre and a two-column legend ───────────────────────────────
// `items`: [{ name, y, color }]. `onSliceClick(name)` / `selectedName` are optional (filtering).
export function donutOptions({ items, onSliceClick, selectedName }) {
  const total = items.reduce((a, i) => a + i.y, 0);
  return base({
    chart: {
      type: 'pie',
      spacing: [4, 0, 2, 0],
      events: {
        render() {
          const ch = this;
          const sr = ch.series[0];
          // Two-column legend sized to the card (re-renders once after the update).
          const iw = Math.floor((ch.chartWidth - 12) / 2);
          if (ch.legend && ch.legend.options.itemWidth !== iw) {
            ch.legend.update({ itemWidth: iw, itemStyle: { width: `${iw - 22}px` } });
            return;
          }
          if (!sr || !sr.center) {
            return;
          }
          // z-index: draw the highlighted (pulled-out) slice above its neighbours.
          sr.points.forEach((pt) => {
            if (pt.sliced && pt.graphic) {
              pt.graphic.toFront();
            }
          });
          const html = `<div style="text-align:center;font-family:${dm}"><div style="font-size:19px;font-weight:800;color:${C.ink};line-height:1.1">${fmt(total)}</div><div style="font-size:10.5px;font-weight:600;color:${C.axisLabel};margin-top:3px">tCO₂e total</div></div>`;
          if (!ch._ctr) {
            ch._ctr = ch.renderer
              .label(html, 0, 0, null, null, null, true)
              .attr({ zIndex: 5 })
              .add();
          } else {
            ch._ctr.attr({ text: html });
          }
          const b = ch._ctr.getBBox();
          ch._ctr.attr({
            x: ch.plotLeft + sr.center[0] - b.width / 2,
            y: ch.plotTop + sr.center[1] - b.height / 2,
          });
        },
      },
    },
    tooltip: {
      headerFormat: '<div style="font-weight:800;margin-bottom:3px">{point.key}</div>',
      pointFormatter() {
        return `<b>${fmt(this.y)}</b> tCO₂e · ${this.percentage.toFixed(1)}%`;
      },
    },
    legend: {
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      maxHeight: 92,
      margin: 8,
      padding: 2,
      itemDistance: 8,
      itemMarginBottom: 6,
      symbolRadius: 3,
      symbolHeight: 10,
      symbolWidth: 10,
      symbolPadding: 6,
      useHTML: true,
      itemStyle: { color: C.body, fontSize: '11.5px', fontWeight: '600', textOverflow: 'ellipsis' },
      itemHoverStyle: { color: C.ink },
      itemHiddenStyle: { color: C.dash },
      labelFormatter() {
        return `<span title="${this.name} · ${fmt(this.y)} tCO₂e">${this.name}</span>`;
      },
      navigation: {
        activeColor: C.copper,
        inactiveColor: C.n300,
        arrowSize: 9,
        style: { color: C.muted, fontSize: '10.5px', fontWeight: '700' },
      },
    },
    plotOptions: {
      pie: {
        size: '100%',
        innerSize: '70%',
        borderWidth: 3,
        borderColor: C.card,
        borderRadius: 4,
        slicedOffset: 8,
        showInLegend: true,
        dataLabels: { enabled: false },
        cursor: onSliceClick ? 'pointer' : 'default',
        states: { hover: { halo: { size: 6 } } },
        point: {
          events: {
            click() {
              if (onSliceClick) {
                onSliceClick(this.name);
              }
            },
          },
        },
      },
    },
    // With a selection: that slice is pulled out and the others fade, so it reads at a glance.
    series: [
      {
        name: 'tCO₂e',
        data: items.map((i) => {
          const on = i.name === selectedName;
          return { ...i, sliced: on, color: selectedName && !on ? alpha(i.color, 0.35) : i.color };
        }),
      },
    ],
  });
}

// ── Top contributors: ranked horizontal bars with value + % labels ──────────────────────────
// Always laid out for 5 rows: with fewer items the remaining slots are left empty (blank category,
// no data), so every bar keeps the same thickness whether 1 or 5 equipment are shown.
const CONTRIBUTOR_SLOTS = 5;

export function contributorsOptions({ items }) {
  const pad = Math.max(0, CONTRIBUTOR_SLOTS - items.length);
  return base({
    chart: { type: 'bar', spacing: [6, 10, 4, 4] },
    xAxis: {
      categories: [...items.map((i) => i.name), ...Array(pad).fill('')],
      lineWidth: 0,
      labels: { style: { color: C.body, fontSize: '11.5px', fontWeight: '700' } },
    },
    // Headroom so the value label of the longest bar sits outside it instead of over the fill.
    yAxis: { visible: false, max: Math.max(...items.map((i) => i.value), 1) * 1.5 },
    colors: CATEGORICAL,
    // Compact tooltip: name + value only.
    tooltip: {
      padding: 6,
      borderRadius: 8,
      style: { fontSize: '11px' },
      headerFormat: `<div style="font-weight:700;margin-bottom:2px">{point.key}</div>`,
      pointFormatter() {
        return `<b>${fmt(this.y)}</b> tCO₂e`;
      },
    },
    plotOptions: {
      bar: {
        borderWidth: 0,
        borderRadius: 5,
        // Bar thickness ≈ 25% slimmer than before (0.14 → 0.23 padding).
        pointPadding: 0.23,
        groupPadding: 0.06,
        colorByPoint: true,
        dataLabels: {
          enabled: true,
          style: { color: C.ink, fontSize: '11.5px', fontWeight: '800', textOutline: 'none' },
          formatter() {
            return fmt(this.y);
          },
        },
      },
    },
    series: [{ name: 'tCO₂e', data: [...items.map((i) => i.value), ...Array(pad).fill(null)] }],
  });
}

// ── Target vs Actual: actual (solid) + target (dashed) columns, baseline line, target band ──
export function targetActualOptions({ years, actual, target, baseline }) {
  const splitIdx = years.findIndex((_, i) => target[i] !== null && target[i] !== undefined);
  return base({
    chart: { type: 'column' },
    xAxis: {
      categories: years,
      plotBands:
        splitIdx < 0
          ? []
          : [
              {
                from: splitIdx - 0.5,
                to: years.length - 0.5,
                color: alpha(C.orange, 0.06),
                label: {
                  text: 'Target years',
                  y: 14,
                  style: { color: C.copper, fontSize: '10px', fontWeight: '700' },
                },
              },
            ],
    },
    yAxis: {
      min: 0,
      plotLines:
        baseline > 0
          ? [
              {
                value: baseline,
                color: C.copper,
                dashStyle: 'ShortDash',
                width: 1.5,
                zIndex: 4,
                label: {
                  text: `Baseline ${fmt(baseline)}`,
                  align: 'left',
                  x: 2,
                  y: -6,
                  style: { color: C.copper, fontSize: '10px', fontWeight: '700' },
                },
              },
            ]
          : [],
    },
    tooltip: {
      formatter() {
        return `<div style="font-weight:800;margin-bottom:4px">${this.point.category ?? this.x}</div>${tipRow(this.color, this.series.name, fmt(this.y))}`;
      },
    },
    plotOptions: {
      // Column width ≈ 25% slimmer than before (pointPadding 0.1 → 0.2).
      column: { borderRadius: 4, pointPadding: 0.2, groupPadding: 0.18, grouping: false },
    },
    series: [
      { name: 'Actual', data: actual, color: C.teal, borderWidth: 0 },
      {
        name: 'Target',
        data: target,
        color: alpha(C.orange, 0.28),
        borderColor: C.orange,
        borderWidth: 1.5,
        dashStyle: 'Dash',
      },
    ],
  });
}

// ── Site layout: stacked area (monthly) + lines (historical / equipment progression) ────────
export function stackedAreaOptions({ categories, series }) {
  return base({
    chart: { type: 'areaspline' },
    legend: smallLegend,
    xAxis: { categories, crosshair: true },
    tooltip: { shared: true, formatter: sharedTip },
    plotOptions: {
      areaspline: {
        stacking: 'normal',
        fillOpacity: 0.35,
        lineWidth: 1.5,
        marker: { radius: 2.5, symbol: 'circle' },
      },
    },
    series,
  });
}

export function lineOptions({ categories, series, legend = true }) {
  return base({
    chart: { type: 'spline' },
    legend: { ...smallLegend, enabled: legend },
    xAxis: {
      categories,
      crosshair: true,
      tickInterval: Math.max(1, Math.ceil(categories.length / 10)),
    },
    tooltip: { shared: true, formatter: sharedTip },
    plotOptions: { spline: { marker: { radius: 3, symbol: 'circle' }, lineWidth: 2 } },
    series: series.map((s) => ({ ...s, type: 'spline' })),
  });
}
