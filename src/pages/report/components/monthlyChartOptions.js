// Highcharts option builders — ported from the Monthly GHG Summary design handoff, pixel/color
// accurate. Chrome (tooltip, gridlines, axis lines/labels) is sourced through monthlySummaryTheme
// C's token references rather than the handoff's literal hex, but every value is identical (see
// that file's inline comments) — this is not a color change. Series colors (CHART_COLORS) are
// passed straight through as the design specified, per instruction, and are fed with real API
// data via monthlySummaryAdapters.js instead of monthlyGhgData.js's mocks.
import Highcharts from 'highcharts';
import { C, dm } from '../monthlySummaryTheme';

const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const decPct = (prev, curr) => `${prev ? Math.floor(((prev - curr) / prev) * 100) : 0}%`;

const kfmt = function () {
  return this.value >= 1000 ? `${this.value / 1000}k` : this.value;
};

const yAxis = (extra = {}) =>
  Highcharts.merge(
    {
      title: { text: null },
      gridLineColor: C.grid,
      gridLineDashStyle: 'Dash',
      labels: { formatter: kfmt, style: { color: C.faint, fontSize: '10px' } },
    },
    extra
  );

function tooltipFormatter() {
  let s = `<div style="font-weight:700;margin-bottom:4px">${this.x}</div>`;
  this.points.forEach((p) => {
    s += `<div><span style="color:${p.color}">●</span> ${p.series.name}: <b>${
      p.series.options.isIntensity ? p.y.toFixed(2) : fmt(p.y)
    }</b></div>`;
  });
  return s;
}

const base = (extra) =>
  Highcharts.merge(
    {
      chart: { backgroundColor: 'transparent', style: { fontFamily: dm }, spacing: [8, 4, 4, 4] },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: C.card,
        borderColor: C.border,
        borderRadius: 8,
        style: { color: C.body, fontSize: '11px', fontFamily: dm },
        shared: true,
        useHTML: true,
        formatter: tooltipFormatter,
      },
      xAxis: {
        lineColor: C.n200,
        tickLength: 0,
        labels: { style: { color: C.muted, fontSize: '11px', fontWeight: '600' } },
      },
    },
    extra
  );

export function overallChartOptions({ prevLabel, currLabel, overall, colors }) {
  return base({
    xAxis: { categories: [prevLabel, currLabel] },
    yAxis: [
      yAxis(),
      yAxis({
        opposite: true,
        min: 0,
        max: 0.8,
        gridLineWidth: 0,
        labels: {
          formatter() {
            return this.value.toFixed(1);
          },
          style: { color: colors.intensityAxis, fontSize: '10px' },
        },
      }),
    ],
    series: [
      {
        type: 'column',
        name: 'tCO₂e',
        data: overall.total,
        color: colors.prev,
        borderWidth: 0,
        borderRadius: 4,
        pointPadding: 0.2,
        groupPadding: 0.25,
        maxPointWidth: 56,
      },
      {
        type: 'line',
        name: 'Intensity',
        isIntensity: true,
        yAxis: 1,
        data: overall.intensity,
        color: colors.curr,
        lineWidth: 2.4,
        marker: { radius: 5, fillColor: colors.curr, lineWidth: 2, lineColor: C.card },
      },
    ],
  });
}

export function siteChartOptions({ sites, prevLabel, currLabel, colors }) {
  return base({
    chart: { type: 'column' },
    xAxis: { categories: sites.map((s) => s.short) },
    yAxis: yAxis(),
    plotOptions: {
      column: { borderWidth: 0, borderRadius: 3, pointPadding: 0.04, groupPadding: 0.18 },
    },
    series: [
      { name: prevLabel, data: sites.map((s) => s.prev), color: colors.prev },
      { name: currLabel, data: sites.map((s) => s.curr), color: colors.curr },
    ],
  });
}

export function plantChartOptions({ plants, prevLabel, currLabel }) {
  return base({
    chart: { type: 'line' },
    xAxis: { categories: [prevLabel, currLabel] },
    yAxis: yAxis({ min: 0 }),
    plotOptions: {
      line: {
        lineWidth: 2.4,
        marker: { radius: 4.5, lineWidth: 2, lineColor: C.card, symbol: 'circle' },
      },
    },
    series: plants.map((p) => ({ name: p.name, data: [p.prev, p.curr], color: p.color })),
  });
}

export function donutChartOptions({ items, key, colors }) {
  const total = items.reduce((a, e) => a + e[key], 0);
  return base({
    chart: { type: 'pie', spacing: [0, 0, 0, 0] },
    title: {
      text: `<div style="text-align:center"><div style="font-size:17px;font-weight:800;color:${C.ink}">${fmt(total)}</div><div style="font-size:10px;font-weight:600;color:${C.subtle}">tCO₂e</div></div>`,
      useHTML: true,
      verticalAlign: 'middle',
      floating: true,
      y: 4,
    },
    tooltip: {
      shared: false,
      formatter() {
        return `<span style="color:${this.point.color}">●</span> ${this.point.name}: <b>${fmt(this.y)}</b> (${this.percentage.toFixed(1)}%)`;
      },
    },
    plotOptions: {
      pie: {
        innerSize: '62%',
        borderWidth: 2,
        borderColor: C.card,
        dataLabels: { enabled: false },
      },
    },
    series: [
      {
        name: 'Equipment',
        data: items.map((e, i) => ({
          name: e.name,
          y: e[key],
          color: colors.categorical[i % colors.categorical.length],
        })),
      },
    ],
  });
}
