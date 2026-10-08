import { Fragment } from 'react';
import Box from '@mui/material/Box';
import { C, dm, noto } from '../emissionTheme';
import { cardSx, CardHeader } from './ChartCard';

const fmt = (n) => Math.round(n).toLocaleString('en-US');

const th = {
  bgcolor: C.headBg,
  py: '7px',
  borderTop: `1px solid ${C.divider}`,
  borderBottom: `1px solid ${C.divider}`,
  fontFamily: noto,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};
const stickyCol = { position: 'sticky', left: 0, zIndex: 1 };

/**
 * Scope 1 / Scope 2 Emission Breakdown (handoff `BreakdownTable`): one table, a header row per
 * scope with its subtotals (coloured square), indented category rows, zeros as "—", sticky first
 * column, and the selected site's column tinted teal (`highlight` = that column's name).
 * `breakdown` comes from buildBreakdown(). Plain HTML table by design — see the note in
 * docs/EMISSION_DASHBOARD_ANALYSIS.md Q8 (no column pinning / grouped header rows in the free
 * DataGrid).
 */
export const BreakdownTable = ({
  title,
  subtitle,
  breakdown,
  highlight,
  headerExtra,
  flat = false,
  sx,
}) => {
  const { columns, sections } = breakdown;
  const hi = (j) => columns[j] === highlight;
  const cell = (v, j, bold) => ({
    v: v ? fmt(v) : '—',
    sx: {
      color: v ? (hi(j) ? C.tealText : C.body) : C.dash,
      bgcolor: hi(j) ? C.cellTint : 'transparent',
      fontWeight: bold ? 800 : 600,
    },
  });
  return (
    <Box sx={{ ...cardSx, overflow: 'hidden', ...sx }}>
      <Box sx={{ p: '12px 15px 10px' }}>
        <CardHeader title={title} subtitle={subtitle}>
          {headerExtra}
        </CardHeader>
      </Box>
      <Box
        sx={{
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${C.n200} transparent`,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: C.n200, borderRadius: 8 },
        }}
      >
        <Box
          component="table"
          sx={{
            width: '100%',
            minWidth: 520,
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontFamily: dm,
            fontSize: 12,
          }}
        >
          <thead>
            <tr>
              <Box component="th" sx={{ ...th, ...stickyCol, textAlign: 'left', px: '15px' }}>
                {flat ? sections[0].name : 'Source category'}
              </Box>
              <Box component="th" sx={{ ...th, textAlign: 'right', px: '10px' }}>
                Total
              </Box>
              {columns.map((name, j) => (
                <Box
                  component="th"
                  key={name}
                  sx={{
                    ...th,
                    textAlign: 'right',
                    pl: '10px',
                    pr: '15px',
                    bgcolor: hi(j) ? C.colTint : C.headBg,
                    color: hi(j) ? C.tealText : C.subtle,
                  }}
                >
                  {name}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {!breakdown.hasData && (
              <tr>
                <Box
                  component="td"
                  colSpan={columns.length + 2}
                  sx={{ py: '22px', textAlign: 'center', fontFamily: noto, color: C.subtle }}
                >
                  Data not available
                </Box>
              </tr>
            )}
            {breakdown.hasData &&
              sections.map((sec) => (
                <Fragment key={sec.name}>
                  {!flat && (
                    <tr>
                      <Box
                        component="td"
                        sx={{
                          ...stickyCol,
                          bgcolor: C.card,
                          p: '8px 15px 5px',
                          borderBottom: `1px solid ${C.divider}`,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 800,
                            color: C.ink,
                            fontSize: 12.5,
                          }}
                        >
                          <Box
                            sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: sec.color }}
                          />
                          {sec.name}
                        </Box>
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          p: '8px 10px 5px',
                          borderBottom: `1px solid ${C.divider}`,
                          textAlign: 'right',
                          fontWeight: 800,
                          color: C.ink,
                        }}
                      >
                        {fmt(sec.total)}
                      </Box>
                      {sec.values.map((v, j) => {
                        const c = cell(v, j, true);
                        return (
                          <Box
                            component="td"
                            key={columns[j]}
                            sx={{
                              p: '8px 15px 5px 10px',
                              borderBottom: `1px solid ${C.divider}`,
                              textAlign: 'right',
                              ...c.sx,
                            }}
                          >
                            {c.v}
                          </Box>
                        );
                      })}
                    </tr>
                  )}
                  {sec.rows.map((row) => (
                    <Box
                      component="tr"
                      key={row.name}
                      sx={{ '&:hover > td': { bgcolor: C.rowHover } }}
                    >
                      <Box
                        component="td"
                        sx={{
                          ...stickyCol,
                          bgcolor: C.card,
                          p: flat ? '6px 15px' : '6px 15px 6px 29px',
                          borderBottom: `1px solid ${C.rowLine}`,
                          fontWeight: 600,
                          color: C.body,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.name}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          p: '6px 10px',
                          borderBottom: `1px solid ${C.rowLine}`,
                          textAlign: 'right',
                          fontWeight: 700,
                          color: row.total ? C.ink : C.dash,
                        }}
                      >
                        {row.total ? fmt(row.total) : '—'}
                      </Box>
                      {row.values.map((v, j) => {
                        const c = cell(v, j);
                        return (
                          <Box
                            component="td"
                            key={columns[j]}
                            sx={{
                              p: '6px 15px 6px 10px',
                              borderBottom: `1px solid ${C.rowLine}`,
                              textAlign: 'right',
                              ...c.sx,
                            }}
                          >
                            {c.v}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Fragment>
              ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
};
