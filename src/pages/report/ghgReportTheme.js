// Design tokens for the GHG Report page — ported from the approved Claude-design handoff
// (C:\Users\gpetkar\Desktop\report page code\GHGReport.jsx). Every hex below was cross-checked
// against src/theme/muiTheme.js's componentTokens and repointed to the matching token — the two
// that had no existing match (`divider`, `fieldBorder`) were added there as `border.tableDivider`
// / `border.field` (2026-09-30) rather than kept as page-local literals, so any other page using
// the shared Dropdown/YearPicker/AppTabs components (src/components/common/) gets the same
// values. This file is now just semantic aliasing for readability within the report page's own
// bespoke bits (Card, ReadField, ExpandableTable) — the shared components import
// componentTokens directly and don't use this file at all.
import { componentTokens } from '@/theme';

const t = componentTokens;

export const C = {
  page: t.shell.mainBg, // '#FAF9FE'
  card: t.surface.card, // '#FFFFFF'
  white: t.surface.card, // '#FFFFFF' — semantic alias where "white" (not "the card surface") is the intent
  border: t.border.default, // '#ECE5DB'
  borderSoft: t.border.row, // '#F5F1EB' — fixed 2026-09-30: was wrongly pointing at `border.divider` (#F0EBE3, a different value)
  divider: t.border.tableDivider, // '#E5DDD0'
  popoverBorder: t.border.menu, // '#EFE8DF'
  headBg: t.surface.tableHead, // '#FAF7F2'
  fieldBg: t.surface.tableHead, // '#FAF7F2'
  fieldBorder: t.border.field, // '#EDE6DC'
  hover: t.surface.hoverRow, // '#FBF8F3'
  ink: t.text.heading, // '#2F2F2F'
  text: t.text.key, // '#363636'
  body: t.text.body, // '#4A4A4A'
  muted: t.text.label, // '#8A847B'
  subtleText: t.text.muted, // '#5A554E' — distinct from `muted` above (`text.label`); both exist in componentTokens as separate values
  head: t.text.faint, // '#A5A5A5'
  headDark: t.text.secondary, // '#7C766D'
  empty: t.text.disabled, // '#B8B2A8'
  orange: t.brand.orange, // '#F2A056'
  orangeDeep: t.brand.orangeDeep, // '#E08A3C'
  tint: t.tint.orange, // '#FCEAD5'
  tintBorder: t.tint.orangeBorder, // '#F6DEC3'
  tintText: t.brand.orangeText, // '#B4682A'
  openRow: t.tint.orangeRow, // '#FDF6EE'
  // Added 2026-09-30 alongside componentTokens.chrome (see muiTheme.js) — values that had no
  // existing match anywhere in the theme.
  iconTileBg: t.chrome.iconTileBg, // '#FBEBD9'
  cardHeaderBorder: t.chrome.cardHeaderBorder, // '#F2EEE7'
  pageText: t.chrome.pageBaseText, // '#3A3A3A'
  captionMuted: t.chrome.mutedBadgeText, // '#A59F95'
  tonalHover: t.chrome.tonalHover, // '#F9DDBE'
  tintIconBorderHover: t.chrome.tintIconBorderHover, // '#F2C999'
};

// Self-hosted variable fonts (see main.jsx / docs/design-system.md) — the handoff assumed a
// Google Fonts CDN load, this project loads DM Sans Variable / Noto Sans Variable instead.
export const noto = t.font.body;
export const dm = t.font.ui;

export const thSx = {
  fontFamily: noto,
  fontSize: 10,
  fontWeight: 700,
  color: C.head,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  lineHeight: 1.4,
};

export const labelSx = {
  fontFamily: noto,
  fontSize: 11,
  fontWeight: 600,
  color: C.muted,
};
