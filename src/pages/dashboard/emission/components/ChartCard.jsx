import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import { DownloadIcon, ExpandIcon, CloseIcon, TableIcon, BarChartIcon } from '@/components/icons';
import { HighchartsChart } from '@/pages/report/components/HighchartsChart';
import { C, dm, noto } from '../emissionTheme';
import { compact } from './Layout';

const fmtCell = (v) =>
  v === null || v === undefined || v === ''
    ? '–'
    : typeof v === 'number'
      ? Math.round(v).toLocaleString('en-US')
      : v;

// Chart options → { columns, rows } for the expanded view's "View data" table (Angular's ECharts
// toolbox `dataView`): categories down the side, one column per series; pies list name → value.
const tableFromOptions = (options) => {
  const series = options?.series ?? [];
  const cats = options?.xAxis?.categories;
  const val = (d) => (d && typeof d === 'object' ? d.y : d);
  if (cats) {
    return {
      columns: ['', ...series.map((x) => x.name)],
      rows: cats.map((c, i) => [c, ...series.map((x) => val(x.data?.[i]))]),
    };
  }
  const pts = series[0]?.data ?? [];
  return { columns: ['', series[0]?.name ?? 'Value'], rows: pts.map((p) => [p.name, val(p)]) };
};

const DataTable = ({ options, height }) => {
  const { columns, rows } = tableFromOptions(options);
  const cell = {
    py: '9px',
    px: '18px',
    minWidth: 150,
    fontFamily: noto,
    fontSize: 12.5,
    borderBottom: `1px solid ${C.rowLine}`,
    textAlign: 'right',
    color: C.body,
    whiteSpace: 'nowrap',
  };
  return (
    <Box
      sx={{
        height,
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: `${C.n200} transparent`,
      }}
    >
      {/* Sized to its content and centred (not stretched to the dialog width) so a 2-column table
          keeps its columns next to each other; `clip` (not hidden) keeps the sticky header working. */}
      <Box
        sx={{
          width: 'fit-content',
          maxWidth: '100%',
          mx: 'auto',
          border: `1px solid ${C.cardBorder}`,
          borderRadius: '12px',
          overflow: 'clip',
        }}
      >
        <Box component="table" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              {columns.map((c, j) => (
                <Box
                  component="th"
                  key={c || 'cat'}
                  sx={{
                    ...cell,
                    position: 'sticky',
                    top: 0,
                    bgcolor: C.headBg,
                    color: C.subtle,
                    fontWeight: 700,
                    fontSize: 10.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textAlign: j ? 'right' : 'left',
                  }}
                >
                  {c}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <Box
                component="tr"
                key={`${r[0]}-${ri}`}
                sx={{
                  '&:hover > td': { bgcolor: C.rowHover },
                  '&:last-of-type > td': { borderBottom: 'none' },
                }}
              >
                {r.map((v, j) => (
                  <Box
                    component="td"
                    key={columns[j] || 'cat'}
                    sx={{ ...cell, textAlign: j ? 'right' : 'left', fontWeight: j ? 600 : 700 }}
                  >
                    {fmtCell(v)}
                  </Box>
                ))}
              </Box>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
};

// Card chrome from the Emission Overview handoff: radius 16, soft long shadow.
export const cardSx = {
  bgcolor: C.card,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: '16px',
  boxShadow: '0 12px 30px -22px rgba(60,45,25,0.35)',
  minWidth: 0,
};

const chartCardSx = {
  ...cardSx,
  p: '12px 15px 8px',
  [compact]: { p: '10px 10px 6px' },
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

export const IconBtn = ({ title, onClick, children, active = false }) => (
  <ButtonBase
    aria-label={title}
    title={title}
    onClick={onClick}
    sx={{
      width: 30,
      height: 30,
      [compact]: { width: 26, height: 26 },
      borderRadius: '8px',
      border: `1px solid ${C.cardBorder}`,
      bgcolor: C.card,
      color: active ? C.copper : C.subtle,
      ...(active && { borderColor: C.iconBtnHover, bgcolor: C.hoverTint }),
      '&:hover': { color: C.copper, borderColor: C.iconBtnHover },
    }}
  >
    {children}
  </ButtonBase>
);

// `nowrap` keeps the right-hand controls beside the title (long titles wrap their own text instead
// of pushing the icon buttons onto a second line); with tabs present it wraps instead.
export const CardHeader = ({ title, subtitle, children, nowrap = false, large = false }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: nowrap ? 'nowrap' : 'wrap',
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component="h3"
        sx={{
          m: 0,
          fontFamily: dm,
          fontSize: large ? 16 : 14,
          fontWeight: 800,
          color: C.title,
          ...(!large && { [compact]: { fontSize: 13 } }),
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            mt: '3px',
            fontFamily: noto,
            fontSize: large ? 12 : 11.5,
            color: C.subtle,
            ...(!large && { [compact]: { fontSize: 10.5 } }),
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {children && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {children}
      </Box>
    )}
  </Box>
);

const slugify = (v) =>
  v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'chart';

export const NoData = ({ height, message = 'Data not available' }) => (
  <Box
    sx={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: noto,
      fontSize: 12,
      color: C.subtle,
    }}
  >
    {message}
  </Box>
);

// Chart that fills whatever height its card gets (rows stretch cards to the tallest one), with
// `minHeight` as the floor. The box is measured and the chart is given that exact pixel height —
// Highcharts can't size itself from a percentage/stretched parent reliably (it falls back to a
// 400px default and gets clipped), so it is only mounted once a real height is known.
const FillChart = ({ options, minHeight, chartRef, chartKey }) => {
  const boxRef = useRef(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) {
      return undefined;
    }
    setH(Math.round(el.clientHeight));
    const ro = new ResizeObserver(([entry]) => {
      setH(Math.round(entry.contentRect.height));
      chartRef.current?.chart?.reflow();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [chartRef]);
  useEffect(() => {
    chartRef.current?.chart?.reflow();
  }, [h, chartRef]);
  return (
    <Box ref={boxRef} sx={{ position: 'relative', flex: 1, minHeight }}>
      <Box sx={{ position: 'absolute', inset: 0 }}>
        {h > 0 && (
          <HighchartsChart key={chartKey} options={options} height={h} chartRef={chartRef} />
        )}
      </Box>
    </Box>
  );
};

/**
 * Chart card shared by every chart panel on the Emission Dashboard routes. Title + optional
 * subtitle on the left; `headerExtra` (tabs) then a Download PNG button and — when `expandable` —
 * an Expand button on the right. "Data not available" when `options` is null. `legend` renders
 * under the header (the handoff's inline legends). `headerExtra` is rendered again inside the
 * expand dialog (its state lives in the parent, so card and dialog stay in sync). `chartKey`
 * remounts the chart when it changes — use it when the options change *shape* (tab switches),
 * because an in-place Highcharts update can leave stale plot bands / axis state behind.
 */
export const ChartCard = ({
  title,
  subtitle,
  options,
  height = 206,
  headerExtra,
  legend,
  expandable = true,
  chartKey,
  sx,
}) => {
  const cardRef = useRef(null);
  const dialogRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const download = (ref) => {
    const chart = ref.current?.chart;
    if (!chart) {
      return;
    }
    // PNG, 2x, white background, slugified title as filename.
    chart.exportChartLocal(
      { type: 'image/png', filename: slugify(title), scale: 2 },
      { chart: { backgroundColor: '#FFFFFF' } }
    );
  };

  const header = (inDialog) => (
    <CardHeader
      title={title}
      subtitle={subtitle}
      nowrap={inDialog || !headerExtra}
      large={inDialog}
    >
      {/* The expanded view shows the chart only (Angular's expand dialog has no tabs/toggle). */}
      {!inDialog && headerExtra}
      {inDialog && options && (
        <IconBtn
          title={showTable ? 'View chart' : 'View data'}
          onClick={() => setShowTable((v) => !v)}
          active={showTable}
        >
          {showTable ? <BarChartIcon size={15} /> : <TableIcon size={15} />}
        </IconBtn>
      )}
      {options && !(inDialog && showTable) && (
        <IconBtn title="Download PNG" onClick={() => download(inDialog ? dialogRef : cardRef)}>
          <DownloadIcon size={15} />
        </IconBtn>
      )}
      {inDialog ? (
        <IconBtn title="Close" onClick={() => setExpanded(false)}>
          <CloseIcon size={15} />
        </IconBtn>
      ) : (
        options &&
        expandable && (
          <IconBtn
            title="Full screen"
            onClick={() => {
              setShowTable(false);
              setExpanded(true);
            }}
          >
            <ExpandIcon size={14} />
          </IconBtn>
        )
      )}
    </CardHeader>
  );

  return (
    <Box sx={{ ...chartCardSx, flex: 1, ...sx }}>
      {header(false)}
      {options ? (
        <FillChart options={options} minHeight={height} chartRef={cardRef} chartKey={chartKey} />
      ) : (
        <NoData height={height} />
      )}
      {options && legend}
      {expanded && (
        <Dialog
          open
          onClose={() => setExpanded(false)}
          fullWidth
          maxWidth={false}
          slotProps={{
            paper: {
              sx: {
                width: '80vw',
                maxWidth: 1100,
                height: '78vh',
                p: 0,
                borderRadius: '16px',
                overflow: 'hidden',
              },
            },
          }}
        >
          {/* Title bar — visually separate from the content below */}
          <Box
            sx={{
              flex: 'none',
              px: '22px',
              py: '14px',
              bgcolor: C.headBg,
              borderBottom: `1px solid ${C.cardBorder}`,
            }}
          >
            {header(true)}
          </Box>
          {/* Content section */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              p: '18px 22px 16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0 }}>
              {options && showTable ? (
                <DataTable options={options} height="calc(78vh - 150px)" />
              ) : options ? (
                <HighchartsChart
                  key={chartKey}
                  options={options}
                  height="calc(78vh - 170px)"
                  chartRef={dialogRef}
                />
              ) : (
                <NoData height="calc(78vh - 170px)" />
              )}
            </Box>
            {options && !showTable && legend}
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

// Inline legend row (handoff `LegendInline`): filled square, dashed-outline square, or dashed line.
export const LegendInline = ({ items, trailing }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: noto,
      fontSize: 11,
      fontWeight: 600,
      color: C.muted,
      flexWrap: 'wrap',
    }}
  >
    {items.map((l) => (
      <Box
        key={l.name}
        component="span"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        {l.line ? (
          <Box sx={{ width: 14, borderTop: `2px dashed ${l.color}` }} />
        ) : (
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: '2px',
              bgcolor: l.fill || l.color,
              border: l.dashed ? `1.5px dashed ${l.color}` : 'none',
              boxSizing: 'border-box',
            }}
          />
        )}
        {l.name}
      </Box>
    ))}
    {trailing && <Box sx={{ ml: 'auto' }}>{trailing}</Box>}
  </Box>
);
