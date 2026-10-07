// Equipment-wise tCO₂e contribution — shown as a table (equipment, previous month, current
// month, change) with an expand button in the top-right corner that opens a modal containing the
// two donut charts + shared legend. Same data as the old always-visible donuts, just tucked
// behind the modal so the row stays compact.
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { ExpandIcon, CloseIcon } from '@/components/icons';
import { C, CHART_COLORS, noto, dm } from '../monthlySummaryTheme';
import { HighchartsChart } from './HighchartsChart';
import {
  Legend,
  Cell,
  ChangeCell,
  iconBtnSx,
  fmt0,
  cardSx,
  titleSx,
} from './MonthlySummaryPrimitives';

const COLS = 'minmax(150px,1.6fr) minmax(80px,1fr) minmax(80px,1fr) minmax(90px,0.9fr)';

const EquipmentSummaryCard = ({ equipment, period, donutPrev, donutCurr }) => {
  const [open, setOpen] = useState(false);
  const prevTotal = equipment.reduce((a, e) => a + e.prev, 0);
  const currTotal = equipment.reduce((a, e) => a + e.curr, 0);
  const legendItems = equipment.map((e, i) => ({
    name: e.name,
    color: CHART_COLORS.categorical[i % CHART_COLORS.categorical.length],
  }));
  const rowSx = {
    display: 'grid',
    gridTemplateColumns: COLS,
    borderBottom: `1px solid ${C.border}`,
  };

  return (
    <>
      <Box
        sx={{
          ...cardSx,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: '16px',
            py: '10px',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <Typography component="h3" sx={titleSx}>
            Equipment-Wise tCO₂e Contribution
          </Typography>
          <ButtonBase
            aria-label="View charts"
            title="View charts"
            sx={iconBtnSx}
            onClick={() => setOpen(true)}
          >
            <ExpandIcon size={15} />
          </ButtonBase>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 440 }}>
            <Box sx={{ ...rowSx, bgcolor: C.tableHead }}>
              {['Equipment', period.prevLabel, period.currLabel, 'Change'].map((h, i) => (
                <Cell
                  key={h}
                  align={i === 0 ? 'left' : 'right'}
                  color={C.faint}
                  bold
                  sx={{
                    fontSize: 10,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    py: '9px',
                  }}
                >
                  {h}
                </Cell>
              ))}
            </Box>
            {equipment.map((e, i) => (
              <Box key={e.name} sx={{ ...rowSx, '&:hover': { bgcolor: C.tableHead } }}>
                <Cell align="left" bold color={C.title}>
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: '3px',
                      mr: '9px',
                      flex: 'none',
                      bgcolor: CHART_COLORS.categorical[i % CHART_COLORS.categorical.length],
                    }}
                  />
                  {e.name}
                </Cell>
                <Cell>{fmt0(e.prev)}</Cell>
                <Cell bold color={C.ink}>
                  {fmt0(e.curr)}
                </Cell>
                <ChangeCell prev={e.prev} curr={e.curr} />
              </Box>
            ))}
            <Box sx={{ ...rowSx, borderBottom: 'none', bgcolor: C.tableHead }}>
              <Cell align="left" bold color={C.ink}>
                Total
              </Cell>
              <Cell bold>{fmt0(prevTotal)}</Cell>
              <Cell bold color={C.ink}>
                {fmt0(currTotal)}
              </Cell>
              <ChangeCell prev={prevTotal} curr={currTotal} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <span style={{ fontFamily: dm }}>Equipment-Wise tCO₂e Contribution</span>
          <ButtonBase aria-label="Close" sx={iconBtnSx} onClick={() => setOpen(false)}>
            <CloseIcon size={14} />
          </ButtonBase>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              pt: '16px',
            }}
          >
            {[
              [period.prevLabel, donutPrev],
              [period.currLabel, donutCurr],
            ].map(([label, opts]) => (
              <Box
                key={label}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                {opts && <HighchartsChart options={opts} height={240} />}
                <Typography
                  sx={{ fontFamily: noto, fontSize: 13, fontWeight: 700, color: C.muted }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: '12px' }}>
            <Legend items={legendItems} />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { EquipmentSummaryCard };
