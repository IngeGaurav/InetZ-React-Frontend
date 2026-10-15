import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { C, dm, noto } from '../emissionTheme';
import { cardSx } from './ChartCard';
import { compact } from './Layout';

const fmt = (n) => Math.round(n).toLocaleString('en-US');

const STATE = {
  none: { bar: C.n300, pillBg: C.neutralTint, pill: C.subtle },
  under: { bar: C.teal, pillBg: C.tealTint, pill: C.tealText },
  over: { bar: C.error, pillBg: C.errorTint, pill: C.errorText },
};

const cardInner = {
  ...cardSx,
  p: '12px 15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  [compact]: { p: '10px 11px', gap: '6px' },
};

// KPI card (handoff `KpiCard`): label + "% of target" pill, big value + unit, progress bar
// (fill = actual, copper tick = target, track max = baseline), Target / Baseline footer.
// `k` comes from buildKpi(); `k.empty` when the backend returned no usable value.
export const KpiCard = ({ k }) => {
  if (k.empty) {
    return (
      <Box sx={cardInner}>
        <Typography sx={{ fontFamily: noto, fontSize: 11.5, fontWeight: 700, color: C.subtle }}>
          {k.label}
        </Typography>
        <Typography sx={{ fontFamily: noto, fontSize: 12, color: C.subtle, py: '14px' }}>
          Data not available
        </Typography>
      </Box>
    );
  }
  const s = STATE[k.state];
  return (
    <Box sx={cardInner}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          [compact]: { flexDirection: 'column', alignItems: 'flex-start', gap: '4px' },
        }}
      >
        <Typography sx={{ fontFamily: noto, fontSize: 11.5, fontWeight: 700, color: C.subtle }}>
          {k.label}
        </Typography>
        <Box
          component="span"
          sx={{
            px: '8px',
            py: '3px',
            borderRadius: '999px',
            bgcolor: s.pillBg,
            color: s.pill,
            fontFamily: dm,
            fontSize: 10.5,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            [compact]: { fontSize: 9.5, px: '6px' },
          }}
        >
          {k.pill}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <Box
          component="span"
          sx={{
            fontFamily: dm,
            fontSize: 18,
            [compact]: { fontSize: 15 },
            fontWeight: 800,
            color: C.ink,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {k.value}
        </Box>
        <Box
          component="span"
          sx={{ fontFamily: noto, fontSize: 11.5, fontWeight: 600, color: C.faint }}
        >
          {k.unit}
        </Box>
      </Box>
      <Box sx={{ position: 'relative', height: 8, borderRadius: '4px', bgcolor: C.track }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${k.fill}%`,
            borderRadius: '4px',
            bgcolor: s.bar,
          }}
        />
        {k.hasTarget && (
          <Box
            title="Target"
            sx={{
              position: 'absolute',
              top: -3,
              bottom: -3,
              left: `${k.mark}%`,
              width: 2,
              borderRadius: '1px',
              bgcolor: C.copper,
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2px 8px',
          fontFamily: noto,
          fontSize: 11,
          color: C.subtle,
          [compact]: { fontSize: 10, gap: '2px 6px' },
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Box sx={{ width: 2, height: 10, borderRadius: '1px', bgcolor: C.copper }} />
          Target <b style={{ color: C.body }}>{k.target}</b>
        </Box>
        <span>
          Baseline <b style={{ color: C.body }}>{k.baseline}</b>
        </span>
      </Box>
    </Box>
  );
};

// "This month | Today" card — two columns with a divider (handoff `PeriodCard`).
export const PeriodCard = ({ month, today }) => {
  const cell = (label, v, divider) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        ...(divider && {
          pl: '12px',
          borderLeft: `1px solid ${C.divider}`,
          [compact]: { pl: '8px' },
        }),
      }}
    >
      <Typography sx={{ fontFamily: noto, fontSize: 11.5, fontWeight: 700, color: C.subtle }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: '6px' }}>
        <Box
          component="span"
          sx={{
            fontFamily: dm,
            fontSize: 16,
            [compact]: { fontSize: 14 },
            fontWeight: 800,
            color: C.ink,
            letterSpacing: '-0.02em',
          }}
        >
          {fmt(v)}
        </Box>
        <Box
          component="span"
          sx={{
            fontFamily: noto,
            fontSize: 11,
            fontWeight: 600,
            color: C.faint,
            [compact]: { fontSize: 10 },
          }}
        >
          tCO₂e
        </Box>
      </Box>
    </Box>
  );
  return (
    <Box
      sx={{
        ...cardSx,
        p: '12px 15px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: '12px',
        [compact]: { p: '10px 11px', gap: '8px' },
      }}
    >
      {cell('This month', month)}
      {cell('Today', today, true)}
    </Box>
  );
};
