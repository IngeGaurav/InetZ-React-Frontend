// Plant-wise tCO₂e emissions — a table (plant, previous month, current month, change) with a thin
// bar under each value, replacing the old line chart. A line chart on one shared axis flattens
// small plants next to a dominant one and gets unreadable with many plants; here every plant keeps
// its exact numbers, the table scrolls, and each row's bars are scaled to that row's own larger
// month so the month-to-month movement is visible even for a 700 tCO₂e plant beside a 12,000 one.
// The expand button opens the original line chart in a modal.
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { ExpandIcon, CloseIcon } from '@/components/icons';
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect';
import { C, CHART_COLORS, dm } from '../monthlySummaryTheme';
import { HighchartsChart } from './HighchartsChart';
import { plantChartOptions } from './monthlyChartOptions';
import {
  Legend,
  Cell,
  ChangeCell,
  iconBtnSx,
  fmt0,
  cardSx,
  titleSx,
  scrollSx,
} from './MonthlySummaryPrimitives';

const COLS = 'minmax(110px,1.3fr) minmax(90px,1fr) minmax(90px,1fr) minmax(80px,0.8fr)';

const ValueCell = ({ value, max, color, bold }) => (
  <Cell
    bold={bold}
    color={bold ? C.ink : undefined}
    sx={{ flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}
  >
    {fmt0(value)}
    <Box sx={{ width: '100%', height: 4, borderRadius: '2px', bgcolor: C.tableHead }}>
      <Box
        sx={{
          width: `${max ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0}%`,
          height: '100%',
          borderRadius: '2px',
          bgcolor: color,
        }}
      />
    </Box>
  </Cell>
);

const PlantSummaryCard = ({ plants, period, allPlantNames, onTogglePlant }) => {
  const [open, setOpen] = useState(false);
  const chartOptions = useMemo(
    () =>
      plantChartOptions({
        plants,
        prevLabel: period.prevLabel,
        currLabel: period.currLabel,
      }),
    [plants, period]
  );
  const legendItems = plants.map((p) => ({ name: p.name, color: p.color }));
  const rowSx = {
    display: 'grid',
    gridTemplateColumns: COLS,
    borderBottom: `1px solid ${C.border}`,
  };

  return (
    <>
      <Box sx={{ ...cardSx, p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            px: '16px',
            py: '10px',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <Typography component="h3" sx={{ ...titleSx, minWidth: 0 }}>
            Plant-wise tCO₂e emissions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <MultiSelect
              width={150}
              options={allPlantNames}
              selected={plants.map((p) => p.name)}
              onToggle={onTogglePlant}
            />
            <ButtonBase
              aria-label="View chart"
              title="View chart"
              sx={{ ...iconBtnSx, width: 26, height: 26, borderRadius: '7px' }}
              onClick={() => setOpen(true)}
            >
              <ExpandIcon size={13} />
            </ButtonBase>
          </Box>
        </Box>

        {plants.length ? (
          // The body fills the row height and scrolls, so many plants never stretch the row.
          <Box sx={{ position: 'relative', flex: 1, minHeight: 240 }}>
            <Box sx={{ position: 'absolute', inset: 0, ...scrollSx }}>
              <Box sx={{ minWidth: 400 }}>
                <Box
                  sx={{
                    ...rowSx,
                    bgcolor: C.tableHead,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {['Plant', period.prevLabel, period.currLabel, 'Change'].map((h, i) => (
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
                {plants.map((p) => {
                  const max = Math.max(p.prev, p.curr);
                  return (
                    <Box key={p.name} sx={{ ...rowSx, '&:hover': { bgcolor: C.tableHead } }}>
                      <Cell align="left" bold color={C.title}>
                        {p.name}
                      </Cell>
                      <ValueCell value={p.prev} max={max} color={CHART_COLORS.prev} />
                      <ValueCell value={p.curr} max={max} color={CHART_COLORS.curr} bold />
                      <ChangeCell prev={p.prev} curr={p.curr} />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 240,
              display: 'grid',
              placeItems: 'center',
              color: C.faint,
              fontSize: 12,
            }}
          >
            No plants selected.
          </Box>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <span style={{ fontFamily: dm }}>Plant-wise tCO₂e emissions</span>
          <ButtonBase aria-label="Close" sx={iconBtnSx} onClick={() => setOpen(false)}>
            <CloseIcon size={14} />
          </ButtonBase>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: '16px' }}>
            {plants.length > 0 && <HighchartsChart options={chartOptions} height={320} />}
            <Box sx={{ mt: '12px' }}>
              <Legend items={legendItems} />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { PlantSummaryCard };
