// Small pill-shaped tonal action button (orange tint bg/border/text) — ported from the GHG
// Report design handoff (2026-09-30) as a shared component. Distinct from MUI Button's own
// `variant="tonal"` (see muiTheme.js) in size/shape: this one is a compact 28px pill for
// inline actions like "Expand all" next to a table, not a standard-height form button.
import ButtonBase from '@mui/material/ButtonBase';
import { componentTokens } from '@/theme';

const t = componentTokens;

const TonalButton = ({ children, ...props }) => (
  <ButtonBase
    {...props}
    sx={{
      height: 28,
      px: '12px',
      borderRadius: '14px',
      border: `1px solid ${t.tint.orangeBorder}`,
      bgcolor: t.tint.orange,
      fontFamily: t.font.ui,
      fontSize: 11.5,
      fontWeight: 700,
      color: t.brand.orangeText,
      '&:hover': { bgcolor: t.chrome.tonalHover },
      ...props.sx,
    }}
  >
    {children}
  </ButtonBase>
);

export { TonalButton };
