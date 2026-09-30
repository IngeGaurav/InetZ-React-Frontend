// Ported from the approved design handoff (GHGReport.jsx) — one component powers the
// Facilities table and every Emissions table. Pixel-accurate; the only addition is `forceOpen`,
// needed to reproduce Angular's generatePdf()/generatePdfPrint() forcing every row fully
// expanded before rendering the PDF/print snapshot (see DECARB_REPORT_ANALYSIS.md A.5) — the
// design handoff's version has no such prop since its screens didn't need PDF export.
//
// rows: [{ name, values: string[], children: [[childName, ...values]] }]
// columns: [{ label, sub?, align? }]
// groups?: [{ label, span }]  -> optional banded group header row
// dividers?: indexes of value columns that get a left border
import { useState, Fragment } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ChevronRightIcon } from '@/components/icons';
import { TonalButton } from '@/components/common/TonalButton/TonalButton';
import { C, noto, thSx } from '../ghgReportTheme';

function ExpandableTable({
  firstCol,
  columns,
  rows,
  childLabel,
  groups,
  dividers,
  colTemplate,
  minWidth = 760,
  defaultOpen = false,
  valueAlign = 'center',
  forceOpen = false,
}) {
  const [open, setOpen] = useState(() =>
    Object.fromEntries(rows.map((r) => [r.name, defaultOpen]))
  );
  const isOpen = (name) => forceOpen || !!open[name];
  const allOpen = rows.every((r) => isOpen(r.name));
  const grid = { display: 'grid', gridTemplateColumns: colTemplate };
  const div = (i) =>
    (dividers ? dividers.includes(i) : true) ? `1.5px solid ${C.divider}` : 'none';
  const cellVal = (v, strong, i) => {
    const empty = v === '' || v === '-';
    return (
      <Box
        key={i}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: valueAlign,
          px: '12px',
          borderLeft: div(i),
          fontFamily: noto,
          fontSize: 12,
          fontWeight: strong ? 700 : 500,
          color: empty ? C.empty : strong ? C.text : C.body,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {v === '' ? '—' : v}
      </Box>
    );
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {!forceOpen && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TonalButton
            onClick={() => setOpen(Object.fromEntries(rows.map((r) => [r.name, !allOpen])))}
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </TonalButton>
        </Box>
      )}
      <Box
        sx={{
          bgcolor: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '14px',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ minWidth }}>
          <Box sx={{ ...grid, bgcolor: C.headBg, borderBottom: `1px solid ${C.border}` }}>
            <Box
              sx={{
                ...thSx,
                gridRow: groups ? 'span 2' : 'auto',
                display: 'flex',
                alignItems: 'flex-end',
                px: '18px',
                py: '12px',
              }}
            >
              {firstCol}
            </Box>
            {groups?.map((g) => (
              <Box
                key={g.label}
                sx={{
                  ...thSx,
                  gridColumn: `span ${g.span}`,
                  display: 'flex',
                  justifyContent: 'center',
                  py: '9px',
                  px: '12px',
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: `1.5px solid ${C.divider}`,
                }}
              >
                {g.label}
              </Box>
            ))}
            {columns.map((c, i) => (
              <Box
                key={c.label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  px: '12px',
                  py: '10px',
                  textAlign: 'center',
                  borderLeft: div(i),
                }}
              >
                <Typography sx={{ ...thSx, color: C.headDark, textWrap: 'balance' }}>
                  {c.label}
                </Typography>
                {c.sub && (
                  <Typography
                    sx={{ fontFamily: noto, fontSize: 10, fontWeight: 500, color: C.head }}
                  >
                    {c.sub}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          {rows.map((r) => {
            const rowOpen = isOpen(r.name);
            const canOpen = r.children?.length > 0;
            return (
              <Fragment key={r.name}>
                <Box
                  onClick={() =>
                    !forceOpen && canOpen && setOpen((o) => ({ ...o, [r.name]: !rowOpen }))
                  }
                  sx={{
                    ...grid,
                    bgcolor: rowOpen ? C.openRow : C.card,
                    borderBottom: `1px solid ${C.borderSoft}`,
                    cursor: !forceOpen && canOpen ? 'pointer' : 'default',
                    '&:hover': { bgcolor: C.hover },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: 0,
                      px: '18px',
                      py: '11px',
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        flex: 'none',
                        borderRadius: '6px',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: rowOpen ? C.orange : C.tint,
                        border: `1px solid ${rowOpen ? C.orange : C.tintBorder}`,
                        color: rowOpen ? C.white : C.tintText,
                        transform: `rotate(${rowOpen ? 90 : 0}deg)`,
                        transition: 'transform .15s',
                        opacity: canOpen ? 1 : 0.4,
                      }}
                    >
                      <ChevronRightIcon size={12} />
                    </Box>
                    <Typography
                      noWrap
                      sx={{ fontFamily: noto, fontSize: 12.5, fontWeight: 700, color: C.text }}
                    >
                      {r.name}
                    </Typography>
                    {canOpen && (
                      <Typography
                        sx={{
                          fontFamily: noto,
                          fontSize: 10.5,
                          color: C.head,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {r.children.length} {childLabel}
                      </Typography>
                    )}
                  </Box>
                  {r.values.map((v, i) => cellVal(v, true, i))}
                </Box>
                {rowOpen &&
                  r.children.map(([name, ...vals]) => (
                    <Box
                      key={name}
                      sx={{
                        ...grid,
                        bgcolor: C.card,
                        borderBottom: `1px solid ${C.borderSoft}`,
                        '&:hover': { bgcolor: C.hover },
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          pl: '46px',
                          pr: '18px',
                          py: '9px',
                          fontFamily: noto,
                          fontSize: 12,
                          fontWeight: 500,
                          color: C.body,
                        }}
                      >
                        {name}
                      </Typography>
                      {vals.map((v, i) => cellVal(v, false, i))}
                    </Box>
                  ))}
              </Fragment>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export { ExpandableTable };
