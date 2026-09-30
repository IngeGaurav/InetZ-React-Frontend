// App-wide year picker — a labeled trigger button that opens a 12-year grid (paged, current
// year highlighted, anything after the current year disabled). Ported from the GHG Report
// design handoff (2026-09-30) as a shared component since it's a generic "pick a year" control,
// not report-specific.
//
// Usage:
//   <YearPicker label="Reporting Year" years={['2022','2023','2024','2025']} value={year} onChange={setYear} />
// `years` restricts which years in the grid are selectable (disabled otherwise); omit it to
// allow any year up to the current one.
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import { ChevronRightIcon, CalendarIcon } from '@/components/icons';
import { componentTokens } from '@/theme';
import { FieldTrigger } from '../FieldTrigger/FieldTrigger';

const t = componentTokens;

const YearPicker = ({ label = 'Year', years, value, onChange }) => {
  const [anchor, setAnchor] = useState(null);
  const cur = new Date().getFullYear();
  const [start, setStart] = useState(Math.floor((+value - 2016) / 12) * 12 + 2016);
  const navBtn = {
    width: 24,
    height: 24,
    borderRadius: '7px',
    bgcolor: t.chrome.navBg,
    color: t.chrome.navIcon,
    '&:hover': { bgcolor: t.chrome.navBgHover },
  };
  const selectable = years ? new Set(years) : null;
  return (
    <>
      <FieldTrigger
        label={label}
        width={140}
        open={!!anchor}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Box sx={{ color: t.chrome.iconAccent, display: 'flex' }}>
            <CalendarIcon size={14} />
          </Box>
          {value}
        </Box>
      </FieldTrigger>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: '6px',
              width: 232,
              p: '12px',
              borderRadius: '14px',
              border: `1px solid ${t.border.menu}`,
              boxShadow: '0 10px 30px rgba(40,30,20,0.12)',
            },
          },
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}
        >
          <ButtonBase aria-label="Previous years" sx={navBtn} onClick={() => setStart(start - 12)}>
            <Box sx={{ transform: 'rotate(180deg)', display: 'flex' }}>
              <ChevronRightIcon size={14} />
            </Box>
          </ButtonBase>
          <Typography
            sx={{ fontFamily: t.font.ui, fontSize: 12.5, fontWeight: 800, color: t.text.title }}
          >
            {start} – {start + 11}
          </Typography>
          <ButtonBase aria-label="Next years" sx={navBtn} onClick={() => setStart(start + 12)}>
            <ChevronRightIcon size={14} />
          </ButtonBase>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {Array.from({ length: 12 }, (_, i) => String(start + i)).map((y) => {
            const on = y === value;
            const dis = +y > cur || (selectable ? !selectable.has(y) : false);
            return (
              <ButtonBase
                key={y}
                disabled={dis}
                onClick={() => {
                  onChange(y);
                  setAnchor(null);
                }}
                sx={{
                  height: 30,
                  borderRadius: '8px',
                  fontFamily: t.font.body,
                  fontSize: 11.5,
                  fontWeight: on ? 800 : 600,
                  color: dis ? t.chrome.disabledText : on ? t.surface.card : t.text.body,
                  bgcolor: on ? t.brand.orange : +y === cur ? t.border.row : 'transparent',
                }}
              >
                {y}
              </ButtonBase>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

export { YearPicker };
