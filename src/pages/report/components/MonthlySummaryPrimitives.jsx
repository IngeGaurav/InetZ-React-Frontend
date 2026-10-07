// Presentational primitives for the Monthly GHG Summary page — ported from the design handoff.
// One real adaptation: the handoff's `Bullets`/`RichText` parse a custom `**bold**`/`++green++`
// markdown-like syntax, because its mock insight strings (monthlyGhgData.js) were written in
// that format. The real backend (`calculateSiteWise`/`calculatePlantWise`/`calculateEquipmentWise`
// — see docs/MONTHLY_SUMMARY_ANALYSIS.md) sends real HTML (`<b>...</b>`) directly, matching the
// same pattern already used for the Annual Report's backend-composed text. `Bullets` here renders
// that HTML directly instead of re-parsing a markdown syntax the real data doesn't use.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { C, noto, dm } from '../monthlySummaryTheme';

const scrollSx = {
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: `${C.orange} transparent`,
};

export const cardSx = {
  bgcolor: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: '12px',
  p: '14px 16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 6px 16px rgba(120,110,95,0.06)',
  minWidth: 0,
};
export const titleSx = { fontFamily: dm, fontSize: 14, fontWeight: 700, color: C.title, m: 0 };
export { scrollSx };

export function Bullets({ items, maxHeight }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        maxHeight,
        pr: '6px',
        ...scrollSx,
      }}
    >
      {items.map((html, i) => (
        <Box key={i} sx={{ display: 'flex', gap: '10px' }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: C.orange,
              mt: '9px',
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              m: 0,
              flex: 1,
              fontFamily: noto,
              fontSize: 13.5,
              lineHeight: 1.65,
              color: C.body,
              textWrap: 'pretty',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Box>
      ))}
    </Box>
  );
}

// Card for the narrative bullets. It stretches to the height of the tallest card in its grid row
// (never taller): the content is absolutely positioned inside, so it scrolls instead of
// stretching the row — which a fixed maxHeight can't do (it left these cards shorter than their
// neighbours).
export function SummaryCard({ items }) {
  return (
    <Box sx={{ ...cardSx, position: 'relative', minHeight: 180, p: 0 }}>
      <Box sx={{ position: 'absolute', inset: 0, p: '16px 20px', ...scrollSx }}>
        <Bullets items={items} />
      </Box>
    </Box>
  );
}

export function Legend({ items, square = true }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px 16px',
        pt: '4px',
      }}
    >
      {items.map((l) => (
        <Box
          key={l.name}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontFamily: noto,
            fontSize: 12,
            color: C.body,
          }}
        >
          {square ? (
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: l.color }} />
          ) : (
            <Box sx={{ width: 14, height: 2.5, borderRadius: '2px', bgcolor: l.color }} />
          )}
          {l.name}
        </Box>
      ))}
    </Box>
  );
}

export function ChartHeader({ title, children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      <Typography component="h3" sx={titleSx}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// Colored summary tile: uppercase label, large current value, previous-month line, and a
// change badge. Used for the four headline numbers in the first card.
export function StatTile({
  label,
  value,
  currLabel,
  prevLabel,
  prevValue,
  bg,
  border,
  accent,
  badge,
}) {
  return (
    <Box
      sx={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        p: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '5px',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          fontFamily: noto,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: accent,
        }}
      >
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: accent, flex: 'none' }} />
        {label}
      </Box>
      {/* Current and previous month side by side to keep the tile short. */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
          <Typography sx={{ fontFamily: noto, fontSize: 11, fontWeight: 600, color: C.subtle }}>
            {currLabel}
          </Typography>
          <Typography
            sx={{ fontFamily: dm, fontSize: 24, fontWeight: 800, lineHeight: 1.1, color: C.ink }}
          >
            {value}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'flex-end' }}>
          <Typography sx={{ fontFamily: noto, fontSize: 11, color: C.subtle }}>
            {prevLabel}
          </Typography>
          <Typography sx={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: C.body }}>
            {prevValue}
          </Typography>
        </Box>
      </Box>
      {badge}
    </Box>
  );
}

// Shared table pieces for the Equipment and Plant cards.
export const fmt0 = (n) => Math.round(n).toLocaleString('en-US');

export const iconBtnSx = {
  width: 30,
  height: 30,
  borderRadius: '8px',
  border: `1px solid ${C.tintBorder}`,
  bgcolor: C.tintBg,
  color: C.orangeDeep,
  '&:hover': { bgcolor: C.hoverTint },
};

export const Cell = ({ children, align = 'right', bold, color, sx }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      px: '14px',
      py: '10px',
      fontFamily: noto,
      fontSize: 12.5,
      fontWeight: bold ? 700 : 500,
      color: color ?? C.body,
      fontVariantNumeric: 'tabular-nums',
      ...sx,
    }}
  >
    {children}
  </Box>
);

export function ChangeCell({ prev, curr }) {
  if (!prev) {
    return <Cell color={C.faint}>—</Cell>;
  }
  const pct = Math.round(((curr - prev) / prev) * 100);
  return (
    <Cell bold color={C.error}>
      {pct === 0 ? '0%' : `${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}%`}
    </Cell>
  );
}

export const Empty = ({ text }) => (
  <Box
    sx={{
      height: 210,
      display: 'grid',
      placeItems: 'center',
      fontFamily: noto,
      fontSize: 12,
      color: C.faint,
    }}
  >
    {text}
  </Box>
);
