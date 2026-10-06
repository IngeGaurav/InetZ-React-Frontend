// App-wide accordion — a bordered card with a clickable header (title + optional description +
// rotating chevron badge) that reveals its children with a height transition. Custom-built from
// ButtonBase + MUI Collapse (not MUI's <Accordion>), same reasoning as Dropdown/AppTabs: it's the
// design's own look, so it can't be reached via muiTheme.js styleOverrides.
//
// Usage:
//   <Accordion title="Facilities" description="..." defaultOpen={false}>...</Accordion>
// `forceOpen` pins it open and removes the toggle (used for the hidden PDF/print render).
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import { ChevronRightIcon } from '@/components/icons';
import { componentTokens } from '@/theme';

const t = componentTokens;

const Accordion = ({ title, description, defaultOpen = false, forceOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = forceOpen || open;
  return (
    <Box
      sx={{
        bgcolor: t.surface.card,
        border: `1px solid ${expanded ? t.tint.orangeBorder : t.border.default}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color .2s',
      }}
    >
      <ButtonBase
        component="div"
        disabled={forceOpen}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          textAlign: 'left',
          gap: '12px',
          px: '16px',
          py: '13px',
          bgcolor: expanded ? t.tint.orangeRow : t.surface.card,
          transition: 'background-color .2s',
          '&:hover': { bgcolor: t.tint.orangeRow },
          '&.Mui-disabled': { opacity: 1 },
        }}
      >
        <Box
          sx={{
            width: 22,
            height: 22,
            flex: 'none',
            mt: '1px',
            borderRadius: '7px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: expanded ? t.brand.orange : t.tint.orange,
            border: `1px solid ${expanded ? t.brand.orange : t.tint.orangeBorder}`,
            color: expanded ? t.surface.card : t.brand.orangeText,
            transform: `rotate(${expanded ? 90 : 0}deg)`,
            transition: 'transform .18s, background-color .18s',
          }}
        >
          <ChevronRightIcon size={13} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ fontFamily: t.font.ui, fontSize: 13, fontWeight: 800, color: t.text.heading }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{
                fontFamily: t.font.body,
                fontSize: 11.5,
                lineHeight: 1.5,
                color: t.text.label,
                mt: '2px',
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </ButtonBase>
      <Collapse in={expanded} timeout={220} unmountOnExit={false}>
        <Box sx={{ p: '14px 16px 16px', borderTop: `1px solid ${t.border.row}` }}>{children}</Box>
      </Collapse>
    </Box>
  );
};

export { Accordion };
