import Box from '@mui/material/Box';

/**
 * Container-query layout helpers for the Emission Dashboard pages.
 *
 * The pages are laid out against the width of the *content area* (viewport minus sidebar), not
 * the viewport — browser zoom (110% / 125%) and a collapsed/expanded sidebar both change that
 * width, and a viewport media query can't see the sidebar. Put `pageContainerSx` on the page root;
 * <Row cols={{ base, 860: ... }}> then switches grid columns when the root is at least N px wide.
 *
 * Explicit grid tracks (not flex-wrap with min basis) so cards never drop to an orphan row —
 * every width gets a deliberate arrangement.
 */
export const pageContainerSx = { containerType: 'inline-size' };

// The card ARRANGEMENT is identical at every width (the same rows/columns a 100%-zoom desktop
// shows - browser zoom or a smaller laptop must not move cards to another row). What changes as the
// content area narrows is the INSIDE of the cards: use this query in a component's sx to tighten
// paddings / font sizes / table cells so the same layout still fits.
export const compact = '@container (max-width: 1250px)';

// { prop: { base: v, 760: v2 } } → sx with `@container (min-width: Npx)` blocks, merged per query.
const rs = (props) => {
  const out = {};
  Object.entries(props).forEach(([prop, map]) => {
    if (map === undefined) {
      return;
    }
    Object.entries(map).forEach(([key, value]) => {
      if (key === 'base') {
        out[prop] = value;
      } else {
        const q = `@container (min-width: ${key}px)`;
        out[q] = { ...(out[q] ?? {}), [prop]: value };
      }
    });
  });
  return out;
};

export const Row = ({ cols, children }) => (
  <Box
    sx={{
      display: 'grid',
      gap: '12px',
      px: '4px',
      pt: '12px',
      ...rs({ gridTemplateColumns: cols }),
    }}
  >
    {children}
  </Box>
);

// Grid item. `span` → gridColumn, `order` → order, each as a { base, [minWidth]: value } map.
// Its single child stretches to the cell's full height so cards in a row line up.
export const Cell = ({ span, order, children }) => (
  <Box
    sx={{
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      '& > *': { flex: 1 },
      ...rs({ gridColumn: span, order }),
    }}
  >
    {children}
  </Box>
);
