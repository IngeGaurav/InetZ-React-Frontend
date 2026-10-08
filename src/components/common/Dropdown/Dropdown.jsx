// App-wide custom dropdown — a labeled trigger button that opens a Popover list of options with
// a checkmark on the selected one. Not an MUI <Select> under the hood (by design — see the
// GHG Report design handoff this was ported from, 2026-09-30), so it can't be themed via
// MuiSelect's styleOverrides in muiTheme.js; import and use this component directly anywhere a
// dropdown should look like this.
//
// Usage:
//   <Dropdown label="Site" options={['All', 'Site A', 'Site B']} value={site} onChange={setSite} />
import { useState } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import { CheckIcon } from '@/components/icons';
import { componentTokens } from '@/theme';
import { FieldTrigger } from '../FieldTrigger/FieldTrigger';

const t = componentTokens;

const Dropdown = ({ label, options, value, onChange, width = 200, compact = false }) => {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <FieldTrigger
        label={label}
        width={width}
        compact={compact}
        open={!!anchor}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        {value}
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
              width: anchor?.offsetWidth,
              p: '5px',
              borderRadius: '10px',
              border: `1px solid ${t.border.menu}`,
              boxShadow: '0 4px 16px rgba(102,102,102,0.08)',
            },
          },
        }}
      >
        {options.map((opt) => {
          const on = opt === value;
          return (
            <ButtonBase
              key={opt}
              onClick={() => {
                onChange(opt);
                setAnchor(null);
              }}
              sx={{
                width: '100%',
                justifyContent: 'space-between',
                borderRadius: '7px',
                px: '11px',
                py: '8px',
                fontFamily: t.font.body,
                fontSize: 12,
                fontWeight: on ? 700 : 500,
                color: on ? t.brand.orangeText : t.text.muted,
                bgcolor: on ? t.tint.orange : 'transparent',
                '&:hover': { bgcolor: t.tint.orangeHover, color: t.brand.orangeText },
              }}
            >
              {opt}
              {on && <CheckIcon size={13} />}
            </ButtonBase>
          );
        })}
      </Popover>
    </>
  );
};

export { Dropdown };
