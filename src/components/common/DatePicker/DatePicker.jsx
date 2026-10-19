// App-wide date picker — a labeled trigger (same look as Dropdown / YearPicker) that opens a themed
// month calendar in a Popover: prev/next month, selected day in the brand orange, today outlined,
// "Clear" / "Today" footer. Built on the same FieldTrigger + Popover pattern as YearPicker, with no
// extra dependency (replaces the browser's native <input type="date"> popup, which can't be themed).
//
// Usage:
//   <DatePicker label="Time stamp" value="2026-10-19" onChange={(ymd) => …} />
// `value` / `onChange` use local 'YYYY-MM-DD' strings ('' = no date). `max` / `min` ('YYYY-MM-DD')
// optionally disable days outside the range. `clearable={false}` hides "Clear".
import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import { ChevronRightIcon, CalendarIcon } from '@/components/icons';
import { componentTokens } from '@/theme';
import { FieldTrigger } from '../FieldTrigger/FieldTrigger';

const t = componentTokens;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (n) => String(n).padStart(2, '0');
const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? '');
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
// dd/mm/yyyy — the format Angular's calendar showed.
const display = (s) => {
  const d = parseYmd(s);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : 'Select date';
};

const DatePicker = ({
  label = 'Date',
  value,
  onChange,
  min,
  max,
  clearable = true,
  width = 170,
  compact = true,
}) => {
  const [anchor, setAnchor] = useState(null);
  const selected = parseYmd(value);
  const today = new Date();
  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  // 'days' → click the title for 'months' → click its title for 'years' (pick a year/month directly).
  const [mode, setMode] = useState('days');
  const [yearStart, setYearStart] = useState(0);

  const openAt = (e) => {
    const base = parseYmd(value) ?? new Date();
    setView({ y: base.getFullYear(), m: base.getMonth() });
    setMode('days');
    setAnchor(e.currentTarget);
  };
  const shift = (delta) => {
    if (mode === 'years') {
      setYearStart((v) => v + delta * 12);
    } else if (mode === 'months') {
      setView(({ y, m }) => ({ y: y + delta, m }));
    } else {
      setView(({ y, m }) => {
        const d = new Date(y, m + delta, 1);
        return { y: d.getFullYear(), m: d.getMonth() };
      });
    }
  };
  const openYears = () => {
    setYearStart(Math.floor(view.y / 12) * 12);
    setMode('years');
  };
  // A month / year is selectable unless it lies entirely outside min..max.
  const monthOut = (y, m) => {
    const a = toYmd(new Date(y, m, 1));
    const b = toYmd(new Date(y, m + 1, 0));
    return (min && b < min) || (max && a > max);
  };
  const yearOut = (y) => (min && `${y}-12-31` < min) || (max && `${y}-01-01` > max);

  const first = new Date(view.y, view.m, 1);
  const startOffset = first.getDay();
  const cells = Array.from({ length: 42 }, (_, i) => new Date(view.y, view.m, 1 - startOffset + i));
  const disabled = (d) => {
    const s = toYmd(d);
    return (min && s < min) || (max && s > max);
  };

  const pick = (d) => {
    onChange(toYmd(d));
    setAnchor(null);
  };

  const navBtn = {
    width: 26,
    height: 26,
    borderRadius: '7px',
    bgcolor: t.chrome.navBg,
    color: t.chrome.navIcon,
    '&:hover': { bgcolor: t.chrome.navBgHover },
  };
  const footBtn = {
    px: '8px',
    py: '3px',
    borderRadius: '6px',
    fontFamily: t.font.body,
    fontSize: 11.5,
    fontWeight: 700,
    color: t.brand.orangeText,
    '&:hover': { bgcolor: t.tint.orangeHover },
  };

  return (
    <>
      <FieldTrigger label={label} width={width} open={!!anchor} onClick={openAt} compact={compact}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Box sx={{ color: t.chrome.iconAccent, display: 'flex' }}>
            <CalendarIcon size={14} />
          </Box>
          {display(value)}
        </Box>
      </FieldTrigger>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: '6px',
              width: 262,
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
          <ButtonBase
            aria-label={
              mode === 'years'
                ? 'Previous years'
                : mode === 'months'
                  ? 'Previous year'
                  : 'Previous month'
            }
            sx={navBtn}
            onClick={() => shift(-1)}
          >
            <Box sx={{ transform: 'rotate(180deg)', display: 'flex' }}>
              <ChevronRightIcon size={14} />
            </Box>
          </ButtonBase>
          {/* Clickable title: days → months → years */}
          <ButtonBase
            disabled={mode === 'years'}
            onClick={() => (mode === 'days' ? setMode('months') : openYears())}
            sx={{
              px: '8px',
              py: '3px',
              gap: '4px',
              borderRadius: '7px',
              fontFamily: t.font.ui,
              fontSize: 12.5,
              fontWeight: 800,
              color: t.text.title,
              '&:hover': { bgcolor: t.tint.orangeHover },
              '&.Mui-disabled': { color: t.text.title },
            }}
          >
            {mode === 'years'
              ? `${yearStart} – ${yearStart + 11}`
              : mode === 'months'
                ? view.y
                : `${MONTHS[view.m]} ${view.y}`}
            {mode !== 'years' && (
              <Box sx={{ display: 'flex', transform: 'rotate(90deg)', color: t.chrome.iconAccent }}>
                <ChevronRightIcon size={12} />
              </Box>
            )}
          </ButtonBase>
          <ButtonBase
            aria-label={
              mode === 'years' ? 'Next years' : mode === 'months' ? 'Next year' : 'Next month'
            }
            sx={navBtn}
            onClick={() => shift(1)}
          >
            <ChevronRightIcon size={14} />
          </ButtonBase>
        </Box>

        {mode === 'months' && (
          <Box
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', py: '4px' }}
          >
            {MONTHS.map((name, m) => {
              const on = selected && selected.getFullYear() === view.y && selected.getMonth() === m;
              const cur = today.getFullYear() === view.y && today.getMonth() === m;
              const dis = !!monthOut(view.y, m);
              return (
                <ButtonBase
                  key={name}
                  disabled={dis}
                  onClick={() => {
                    setView({ y: view.y, m });
                    setMode('days');
                  }}
                  sx={{
                    height: 40,
                    borderRadius: '8px',
                    fontFamily: t.font.body,
                    fontSize: 12,
                    fontWeight: on ? 800 : 600,
                    color: dis ? t.chrome.disabledText : on ? t.surface.card : t.text.body,
                    bgcolor: on ? t.brand.orange : 'transparent',
                    border: `1.5px solid ${cur && !on ? t.brand.orange : 'transparent'}`,
                    '&:hover': { bgcolor: on ? t.brand.orange : t.tint.orangeHover },
                  }}
                >
                  {name.slice(0, 3)}
                </ButtonBase>
              );
            })}
          </Box>
        )}

        {mode === 'years' && (
          <Box
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', py: '4px' }}
          >
            {Array.from({ length: 12 }, (_, i) => yearStart + i).map((y) => {
              const on = selected && selected.getFullYear() === y;
              const cur = today.getFullYear() === y;
              const dis = !!yearOut(y);
              return (
                <ButtonBase
                  key={y}
                  disabled={dis}
                  onClick={() => {
                    setView({ y, m: view.m });
                    setMode('months');
                  }}
                  sx={{
                    height: 40,
                    borderRadius: '8px',
                    fontFamily: t.font.body,
                    fontSize: 12,
                    fontWeight: on ? 800 : 600,
                    color: dis ? t.chrome.disabledText : on ? t.surface.card : t.text.body,
                    bgcolor: on ? t.brand.orange : 'transparent',
                    border: `1.5px solid ${cur && !on ? t.brand.orange : 'transparent'}`,
                    '&:hover': { bgcolor: on ? t.brand.orange : t.tint.orangeHover },
                  }}
                >
                  {y}
                </ButtonBase>
              );
            })}
          </Box>
        )}

        {mode === 'days' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {WEEKDAYS.map((w) => (
              <Box
                key={w}
                sx={{
                  height: 24,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: t.font.body,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: t.text.label,
                }}
              >
                {w}
              </Box>
            ))}
            {cells.map((d) => {
              const inMonth = d.getMonth() === view.m;
              const on = selected && toYmd(d) === toYmd(selected);
              const isToday = toYmd(d) === toYmd(today);
              const dis = !!disabled(d);
              return (
                <ButtonBase
                  key={toYmd(d)}
                  disabled={dis}
                  onClick={() => pick(d)}
                  sx={{
                    height: 32,
                    borderRadius: '8px',
                    fontFamily: t.font.body,
                    fontSize: 12,
                    fontWeight: on ? 800 : 600,
                    color: dis
                      ? t.chrome.disabledText
                      : on
                        ? t.surface.card
                        : inMonth
                          ? t.text.body
                          : t.text.disabled,
                    bgcolor: on ? t.brand.orange : 'transparent',
                    border: `1.5px solid ${isToday && !on ? t.brand.orange : 'transparent'}`,
                    '&:hover': { bgcolor: on ? t.brand.orange : t.tint.orangeHover },
                  }}
                >
                  {d.getDate()}
                </ButtonBase>
              );
            })}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '8px' }}>
          {clearable ? (
            <ButtonBase
              sx={footBtn}
              onClick={() => {
                onChange('');
                setAnchor(null);
              }}
            >
              Clear
            </ButtonBase>
          ) : (
            <span />
          )}
          <ButtonBase sx={footBtn} disabled={!!disabled(today)} onClick={() => pick(today)}>
            Today
          </ButtonBase>
        </Box>
      </Popover>
    </>
  );
};

export { DatePicker };
