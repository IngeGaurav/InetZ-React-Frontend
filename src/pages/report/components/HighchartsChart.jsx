// Thin wrapper so every chart on this page shares one Highcharts import instead of each chart
// component wiring up highcharts-react-official separately. Matches the design handoff's own
// `Chart` component exactly (height set via containerProps, not a wrapping Box).
import Highcharts from 'highcharts';
// Named import, not default — highcharts-react-official's CJS build exports both
// `{ HighchartsReact, default }` pointing at the same component, with no `__esModule` marker.
// Under Vite's synthetic-default interop that makes a default import resolve to the whole
// wrapper object instead of the component itself ("Element type is invalid... got: object").
// The named import bypasses that guesswork.
import { HighchartsReact } from 'highcharts-react-official';

const HighchartsChart = ({ options, height }) => (
  <HighchartsReact
    highcharts={Highcharts}
    options={options}
    containerProps={{ style: { width: '100%', height } }}
  />
);

export { HighchartsChart };
