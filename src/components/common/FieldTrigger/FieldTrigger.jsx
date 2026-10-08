// Labeled trigger button for a popover-driven field (used by Dropdown and YearPicker) — a
// bordered box with a label above it and a chevron on the right, matching this app's
// TextField/InputLabel visual language without actually being a TextField (the value it shows
// is often richer than plain text — an icon + text, a checkmark, etc).
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { ChevronDownIcon } from '@/components/icons';
import { componentTokens } from '@/theme';

const t = componentTokens;

const labelSx = { fontFamily: t.font.body, fontSize: 11, fontWeight: 600, color: t.text.label };

const FieldTrigger = ({ label, width, open, onClick, children, compact = false }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', width }}>
    <Typography component="label" sx={labelSx}>
      {label}
    </Typography>
    <ButtonBase
      onClick={onClick}
      sx={{
        height: compact ? 30 : 36,
        px: compact ? '10px' : '12px',
        justifyContent: 'space-between',
        gap: '8px',
        bgcolor: t.surface.card,
        border: `1.5px solid ${open ? t.brand.orange : t.border.tableDivider}`,
        borderRadius: '8px',
        fontFamily: t.font.body,
        fontSize: compact ? 12 : 12.5,
        fontWeight: 600,
        color: t.text.body,
        '&:hover': { borderColor: t.brand.orange },
      }}
    >
      {children}
      <Box sx={{ color: t.chrome.iconAccent, display: 'flex' }}>
        <ChevronDownIcon size={14} />
      </Box>
    </ButtonBase>
  </Box>
);

export { FieldTrigger };
