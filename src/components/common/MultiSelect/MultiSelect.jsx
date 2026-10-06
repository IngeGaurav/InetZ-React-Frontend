// App-wide checkbox multi-select popover — ported from the Monthly GHG Summary design handoff
// (2026-09-30) as a shared component, same reasoning as Dropdown/YearPicker/AppTabs: this isn't
// built on MUI's <Select multiple>, it's custom Popover+ButtonBase markup, so it can't be themed
// via muiTheme.js — import and use this component directly anywhere this look is wanted.
//
// Usage:
//   <MultiSelect options={['A','B']} selected={selected} onToggle={(opt) => ...} />
import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import { CheckIcon, ChevronDownIcon } from '@/components/icons';
import { componentTokens } from '@/theme';

const t = componentTokens;

const MultiSelect = ({ options, selected, onToggle, width = 190 }) => {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width,
          height: 34,
          justifyContent: 'space-between',
          px: '12px',
          bgcolor: t.surface.card,
          border: `1.5px solid ${anchor ? t.brand.orange : t.neutral[200]}`,
          borderRadius: '8px',
          fontFamily: t.font.body,
          fontSize: 12,
          fontWeight: 600,
          color: t.text.body,
          '&:hover': { borderColor: t.brand.orange },
        }}
      >
        <span>{selected.length} items selected</span>
        <Box sx={{ color: t.chrome.iconAccent, display: 'flex' }}>
          <ChevronDownIcon size={14} />
        </Box>
      </ButtonBase>
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
              width,
              p: '5px',
              borderRadius: '10px',
              border: `1px solid ${t.border.menu}`,
              boxShadow: '0 4px 16px rgba(102,102,102,0.08)',
            },
          },
        }}
      >
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <ButtonBase
              key={o}
              onClick={() => onToggle(o)}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                gap: '9px',
                borderRadius: '7px',
                px: '9px',
                py: '7px',
                fontFamily: t.font.body,
                fontSize: 12,
                color: t.text.body,
                '&:hover': { bgcolor: t.tint.orangeHover },
              }}
            >
              <Box
                sx={{
                  width: 15,
                  height: 15,
                  flex: 'none',
                  borderRadius: '4px',
                  border: `1.5px solid ${on ? t.brand.orange : t.neutral[300]}`,
                  bgcolor: on ? t.brand.orange : t.surface.card,
                  color: t.surface.card,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {on && <CheckIcon size={10} />}
              </Box>
              {o}
            </ButtonBase>
          );
        })}
      </Popover>
    </>
  );
};

export { MultiSelect };
