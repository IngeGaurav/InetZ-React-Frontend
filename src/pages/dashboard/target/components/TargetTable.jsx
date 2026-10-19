import Box from '@mui/material/Box';
import { C, dm, noto } from '@/pages/dashboard/emission/emissionTheme';
import { cardSx, CardHeader } from '@/pages/dashboard/emission/components/ChartCard';
import { compact } from '@/pages/dashboard/emission/components/Layout';

const fmt0 = (n) => Math.round(Number(n)).toLocaleString('en-US');
const pct = (v) => (v === null || v === undefined || v === '' ? '—' : `${v}%`);

const th = {
  bgcolor: C.headBg,
  py: '8px',
  px: '12px',
  borderTop: `1px solid ${C.divider}`,
  borderBottom: `1px solid ${C.divider}`,
  fontFamily: noto,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'normal',
  lineHeight: 1.25,
  verticalAlign: 'middle',
  position: 'sticky',
  top: 0,
  zIndex: 3,
};
const td = {
  py: '10px',
  px: '12px',
  borderBottom: `1px solid ${C.rowLine}`,
  fontFamily: dm,
  fontSize: 12,
  fontWeight: 600,
  color: C.body,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

// Fixed layout with set column shares: the table always fits its card (long names / methods are
// cut with an ellipsis, headers wrap) instead of scrolling sideways at 110% / 125% zoom.
const COL_WIDTHS = ['15%', '8%', '16%', '8%', '14%', '13%', '14%', '12%'];

const COLUMNS = [
  { key: 'name', label: 'Site', align: 'left' },
  { key: 'sector', label: 'Sector', align: 'left' },
  { key: 'method', label: 'Target Setting Method', align: 'left' },
  { key: 'targetYear', label: 'Target Year', align: 'center' },
  { key: 'scope1', label: 'Scope 1 Target', align: 'right' },
  { key: 'scope2', label: 'Scope 2 Target', align: 'right' },
  { key: 'total', label: 'Total (Scope 1+2)', align: 'right' },
  { key: 'reduction', label: '% Reduction', align: 'right' },
];

/**
 * Stored-targets table (Angular's `custom-table`): sticky header, a sticky "Organization" summary
 * row, one clickable row per site (click = scope the line chart to that site), numbers `1.0-0`.
 * Plain table rather than MUI X DataGrid — the Community DataGrid cannot pin a summary row under
 * its header (docs/TARGET_SETTING_ANALYSIS.md Q6). `selectedName` = '' means the organisation.
 */
export const TargetTable = ({ rows, orgRow, selectedName, onSelect }) => (
  <Box sx={{ ...cardSx, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ p: '12px 15px 10px' }}>
      <CardHeader
        title="Stored Targets"
        subtitle="Click a site to show its Actual vs Target chart"
      />
    </Box>
    <Box
      sx={{
        flex: 1,
        maxHeight: 420,
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: `${C.n200} transparent`,
      }}
    >
      <Box
        component="table"
        sx={{
          width: '100%',
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: 0,
          [compact]: {
            fontSize: 10.5,
            '& th, & td': { padding: '8px 5px' },
            '& th': { fontSize: 9.5, letterSpacing: '0.02em' },
          },
        }}
      >
        <colgroup>
          {COL_WIDTHS.map((w, i) => (
            <col key={COLUMNS[i].key} style={{ width: w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <Box component="th" key={c.key} sx={{ ...th, textAlign: c.align }}>
                {c.label}
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {orgRow && (
            <Box
              component="tr"
              onClick={() => onSelect('')}
              sx={{
                cursor: 'pointer',
                '& > td': {
                  position: 'sticky',
                  top: 33,
                  zIndex: 2,
                  bgcolor: selectedName === '' ? C.hoverTint : C.card,
                  fontWeight: 800,
                  color: C.ink,
                },
                '&:hover > td': { bgcolor: C.rowHover },
              }}
            >
              <Box
                component="td"
                sx={{
                  ...td,
                  boxShadow: selectedName === '' ? `inset 3px 0 0 ${C.orange}` : 'none',
                }}
              >
                Organization
              </Box>
              <Box component="td" sx={td} />
              <Box component="td" sx={td} />
              <Box component="td" sx={td} />
              <Box component="td" title="tCO₂e" sx={{ ...td, textAlign: 'right' }}>
                {fmt0(orgRow.scope1)}
              </Box>
              <Box component="td" title="tCO₂e" sx={{ ...td, textAlign: 'right' }}>
                {fmt0(orgRow.scope2)}
              </Box>
              <Box component="td" title="tCO₂e" sx={{ ...td, textAlign: 'right' }}>
                {fmt0(orgRow.total)}
              </Box>
              <Box component="td" sx={{ ...td, textAlign: 'right' }}>
                {pct(orgRow.reduction)}
              </Box>
            </Box>
          )}
          {rows.map((r) => {
            const active = selectedName === r.name;
            return (
              <Box
                component="tr"
                key={r.id ?? r.siteId}
                onClick={() => onSelect(r.name)}
                sx={{
                  cursor: 'pointer',
                  '& > td': { bgcolor: active ? C.hoverTint : 'transparent' },
                  '&:hover > td': { bgcolor: active ? C.hoverTint : C.rowHover },
                }}
              >
                <Box
                  component="td"
                  sx={{
                    ...td,
                    fontWeight: 700,
                    color: C.ink,
                    boxShadow: active ? `inset 3px 0 0 ${C.orange}` : 'none',
                  }}
                >
                  {r.name}
                </Box>
                <Box component="td" sx={td}>
                  {r.sector}
                </Box>
                <Box component="td" sx={td}>
                  {r.method}
                </Box>
                <Box component="td" sx={{ ...td, textAlign: 'center' }}>
                  {r.targetYear}
                </Box>
                <Box component="td" title="tCO₂e" sx={{ ...td, textAlign: 'right' }}>
                  {fmt0(r.scope1)}
                </Box>
                <Box component="td" title="tCO₂e" sx={{ ...td, textAlign: 'right' }}>
                  {fmt0(r.scope2)}
                </Box>
                <Box component="td" title="tCO₂e" sx={{ ...td, textAlign: 'right' }}>
                  {fmt0(r.total)}
                </Box>
                <Box component="td" sx={{ ...td, textAlign: 'right' }}>
                  {pct(r.reduction)}
                </Box>
              </Box>
            );
          })}
          {!rows.length && (
            <tr>
              <Box
                component="td"
                colSpan={COLUMNS.length}
                sx={{ ...td, textAlign: 'center', color: C.subtle, py: '22px' }}
              >
                No data available
              </Box>
            </tr>
          )}
        </tbody>
      </Box>
    </Box>
  </Box>
);
