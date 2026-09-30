// Report-specific building blocks for the GHG Report page — ported from the approved design
// handoff (C:\Users\gpetkar\Desktop\report page code\GHGReport.jsx). The genuinely reusable
// pieces the handoff also introduced (Dropdown, YearPicker, AppTabs, TonalButton, FieldTrigger)
// were promoted to src/components/common/ (2026-09-30) so other pages can use the same
// dropdown/tabs/year-picker look — import those from there, not from here. What's left here is
// specific to this report's own layout (fields, the lettered-badge card, PDF sub-headings).
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
export function ReadField({ label, value, maxWidth = 620 }) {
  const empty = value === '' || value === null || value === undefined;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth }}>
      <Typography component="label" sx={labelSx}>
        {label}
      </Typography>
      <Box
        sx={{
          minHeight: 38,
          px: '12px',
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
        }}
      >
        {empty ? '—' : value}
      </Box>
    </Box>
  );
}

// Same visual shell as ReadField, but a real editable control — for the handful of fields that
// are genuinely editable, unsaved component state in Angular too (facilitiesText,
// clarificationOfCompany, contextForAnySignificant — see DECARB_REPORT_ANALYSIS.md). The design
// handoff's ReadField has no editable variant since none of its screens needed one.
export function EditableField({ label, value, onChange, maxWidth = 620, multiline = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth }}>
      <Typography component="label" sx={labelSx}>
        {label}
      </Typography>
      <Box
        component={multiline ? 'textarea' : 'input'}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={multiline ? 2 : undefined}
        sx={{
          minHeight: 38,
          px: '12px',
          py: '8px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '8px',
          border: `1.5px solid ${C.fieldBorder}`,
          bgcolor: C.fieldBg,
          fontFamily: noto,
          fontSize: 12.5,
          fontWeight: 600,
          color: C.body,
          outline: 'none',
          resize: multiline ? 'vertical' : 'none',
          width: '100%',
          '&:focus': { borderColor: C.orange },
        }}
      />
    </Box>
  );
}

// Heading used only inside the hidden PDF/print clone, where sub-tabbed panels (Boundary,
// Emissions) render every sub-section stacked instead of just the active one — see
// AnnualReportPage.jsx's `forcePdf` branches. Not part of the design handoff (its screens are
// interactive-only), styled to sit quietly above an ExpandableTable/field group.
export function PrintSubHeading({ index, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '5px',
          display: 'grid',
          placeItems: 'center',
          fontSize: 10,
          fontWeight: 800,
          bgcolor: C.tint,
          color: C.tintText,
          flex: 'none',
        }}
      >
        {index}
      </Box>
      <Typography sx={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: C.ink }}>
        {children}
      </Typography>
    </Box>
  );
}

export function Card({ letter, title, children }) {
  return (
    <Box
      sx={{
        bgcolor: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 6px 16px rgba(60,40,20,0.04)',
      }}
    >
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
