// Thin wrapper so every chart in the app shares one Highcharts import instead of each chart
// component wiring up highcharts-react-official separately. Matches the design handoff's own
// `Chart` component exactly (height set via containerProps, not a wrapping Box).
import Highcharts from 'highcharts';
// Side-effect module imports (Highcharts 12+ registers them on import):
// exporting + offline-exporting: client-side "Download PNG" (chart.exportChartLocal) on the
// Emission Dashboard chart cards.
import 'highcharts/modules/exporting';
import 'highcharts/modules/offline-exporting';
// Named import, not default — highcharts-react-official's CJS build exports both
// `{ HighchartsReact, default }` pointing at the same component, with no `__esModule` marker.
// Under Vite's synthetic-default interop that makes a default import resolve to the whole
// wrapper object instead of the component itself ("Element type is invalid... got: object").
// The named import bypasses that guesswork.
import { HighchartsReact } from 'highcharts-react-official';

// Loading the exporting module turns on its built-in context-menu button for EVERY chart, and
// its default `fallbackToExportServer: true` would POST the chart's data to Highcharts' public
// export server whenever local export fails. Neither is wanted: the app draws its own download
// control and chart data must never leave the app.
Highcharts.setOptions({ exporting: { enabled: false, fallbackToExportServer: false } });

// `chartRef` (optional) receives the HighchartsReact handle `{ chart, container }` — used by the
// download button (chart.exportChartLocal).
const HighchartsChart = ({ options, height, chartRef }) => (
  <HighchartsReact
    highcharts={Highcharts}
    options={options}
    ref={chartRef}
    containerProps={{ style: { width: '100%', height } }}
  />
);

export { HighchartsChart };
