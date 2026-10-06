// Report-specific building blocks for the GHG Report page — ported from the approved design
// handoff (C:\Users\gpetkar\Desktop\report page code\GHGReport.jsx). The genuinely reusable
// pieces the handoff also introduced (Dropdown, YearPicker, AppTabs, TonalButton, FieldTrigger)
// were promoted to src/components/common/ (2026-09-30) so other pages can use the same
// dropdown/tabs/year-picker look — import those from there, not from here. What's left here is
// specific to this report's own layout (fields, the lettered-badge card, PDF sub-headings).
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LockIcon, EditIcon } from '@/components/icons';
import { componentTokens } from '@/theme';
import { C, noto, dm, labelSx } from '../ghgReportTheme';

/* ---------- icons ---------- */
// Kept local (not the shared icon library) for this page's header icons (file/download/print),
// which don't have exact-match equivalents there — see docs/decisions.md's 2026-09-30 entry.
export const Svg = ({ children, size = 16, sw = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

/* ---------- primitives ---------- */
// Read-only vs editable fields are deliberately distinct: read-only (auto-filled from the
// backend) stays on the tinted surface with a lock icon and no hover/focus affordance; editable
// fields sit on a white surface with a stronger border, a pencil icon, a placeholder, and
// orange hover/focus states — so users can tell at a glance where they can type.
const fieldIconSx = { position: 'absolute', right: 12, display: 'flex', pointerEvents: 'none' };

export function ReadField({ label, value, maxWidth = 620 }) {
  const empty = value === '' || value === null || value === undefined;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth }}>
      <Typography component="label" sx={labelSx}>
        {label}
      </Typography>
      <Box
        title="Auto-filled — read only"
        sx={{
          position: 'relative',
          minHeight: 38,
          pl: '12px',
          pr: '36px',
          py: '8px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '8px',
          border: `1.5px solid ${C.fieldBorder}`,
          bgcolor: C.fieldBg,
          fontFamily: noto,
          fontSize: 12.5,
          fontWeight: 600,
          color: empty ? C.empty : C.body,
          cursor: 'default',
          userSelect: 'text',
        }}
      >
        {empty ? '—' : value}
        <Box sx={{ ...fieldIconSx, color: C.empty }}>
          <LockIcon size={14} />
        </Box>
      </Box>
    </Box>
  );
}

// A real editable control — for the handful of fields that are genuinely editable, unsaved
// component state in Angular too (facilitiesText, clarificationOfCompany,
// contextForAnySignificant — see DECARB_REPORT_ANALYSIS.md).
export function EditableField({
  label,
  value,
  onChange,
  maxWidth = 620,
  multiline = false,
  placeholder = 'Click to add…',
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth }}>
      {label && (
        <Typography component="label" sx={labelSx}>
          {label}
        </Typography>
      )}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Box
          component={multiline ? 'textarea' : 'input'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={multiline ? 2 : undefined}
          sx={{
            minHeight: 38,
            pl: '12px',
            pr: '36px',
            py: '8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            border: `1.5px solid ${C.divider}`,
            bgcolor: C.white,
            fontFamily: noto,
            fontSize: 12.5,
            fontWeight: 600,
            color: C.ink,
            outline: 'none',
            resize: multiline ? 'vertical' : 'none',
            width: '100%',
            cursor: 'text',
            transition: 'border-color .15s, box-shadow .15s',
            '&::placeholder': { color: C.faint, fontWeight: 500 },
            '&:hover': { borderColor: C.orange },
            '&:focus': { borderColor: C.orange, boxShadow: componentTokens.shadow.focusInput },
          }}
        />
        <Box sx={{ ...fieldIconSx, color: C.orangeDeep }}>
          <EditIcon size={14} />
        </Box>
      </Box>
    </Box>
  );
}

// Numbered sub-section heading (badge + title + trailing hairline). Used on screen for stacked
// sub-sections (Boundary: Organizational / Operational) and in the hidden PDF/print clone for
// panels that still use sub-tabs on screen (Emissions) — see AnnualReportPage.jsx.
export function PrintSubHeading({ index, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '7px',
          display: 'grid',
          placeItems: 'center',
          fontSize: 11.5,
          fontWeight: 800,
          bgcolor: C.tint,
          border: `1px solid ${C.tintBorder}`,
          color: C.tintText,
          flex: 'none',
        }}
      >
        {index}
      </Box>
      <Typography sx={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: C.ink }}>
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: C.borderSoft }} />
    </Box>
  );
}

export function Card({ letter, title, hideHeader = false, children }) {
  return (
    <Box
      sx={{
        bgcolor: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 6px 16px rgba(60,40,20,0.04)',
      }}
    >
      {!hideHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            px: '18px',
            py: '14px',
            borderBottom: `1px solid ${C.cardHeaderBorder}`,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              bgcolor: C.iconTileBg,
              border: `1px solid ${C.tintBorder}`,
              color: C.orangeDeep,
              display: 'grid',
              placeItems: 'center',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {letter}
          </Box>
          <Typography sx={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: C.ink }}>
            {title}
          </Typography>
        </Box>
      )}
      {children}
    </Box>
  );
}

export const tintIconBtn = {
  width: 36,
  height: 36,
  borderRadius: '8px',
  border: `1px solid ${C.tintBorder}`,
  bgcolor: C.tint,
  color: C.tintText,
  '&:hover': { bgcolor: C.tonalHover, borderColor: C.tintIconBorderHover },
};
