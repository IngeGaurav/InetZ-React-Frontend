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
