// App-wide tab components ported from the GHG Report design handoff (2026-09-30) — distinct
// look from MUI's own Tabs/Tab (already themed in muiTheme.js as a plain underline style): these
// carry a small letter/number badge per tab. Use whichever style fits the page; these aren't a
// replacement for MUI Tabs, just an additional themed pattern this app now has both of.
//
// AppTabs — primary underline tabs with a colored badge (e.g. "A", "B", "C" or "1", "2").
//   <AppTabs tabs={[{ key, badge: 'A', label }]} value={index} onChange={setIndex} />
//
// AppSegmentedTabs — pill-shaped segmented control for sub-navigation within a section.
//   <AppSegmentedTabs items={['One', 'Two']} value={index} onChange={setIndex} />
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { componentTokens } from '@/theme';

const t = componentTokens;

const AppTabs = ({ tabs, value, onChange }) => (
  <Box
    sx={{
      display: 'flex',
      gap: '4px',
      flexWrap: 'wrap',
      boxShadow: `inset 0 -1px 0 ${t.border.default}`,
    }}
  >
    {tabs.map((tab, i) => {
      const on = i === value;
      return (
        <ButtonBase
          key={tab.key}
          onClick={() => onChange(i)}
          sx={{
            gap: '8px',
            px: '14px',
            py: '10px',
            borderBottom: `2px solid ${on ? t.brand.orange : 'transparent'}`,
            fontFamily: t.font.ui,
            fontSize: 12.5,
            fontWeight: on ? 800 : 600,
            color: on ? t.text.heading : t.text.label,
            whiteSpace: 'nowrap',
            '&:hover': { color: t.text.heading },
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '6px',
              display: 'grid',
              placeItems: 'center',
              fontSize: 10.5,
              fontWeight: 800,
              bgcolor: on ? t.brand.orange : t.border.row,
              color: on ? t.surface.card : t.text.label,
            }}
          >
            {tab.badge}
          </Box>
          {tab.label}
        </ButtonBase>
      );
    })}
  </Box>
);

// `size="sm"` is a compact variant (30px overall) for card headers sitting next to 30px icon buttons.
const AppSegmentedTabs = ({ items, value, onChange, size = 'md' }) => {
  const sm = size === 'sm';
  return (
    <Box
      role="tablist"
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        maxWidth: '100%',
        alignSelf: 'flex-start',
        gap: sm ? '3px' : '4px',
        p: sm ? '3px' : '4px',
        bgcolor: t.border.row,
        border: `1px solid ${t.border.default}`,
        borderRadius: '12px',
        boxShadow: 'inset 0 1px 2px rgba(60,40,20,0.05)',
      }}
    >
      {items.map((name, i) => {
        const on = i === value;
        return (
          <ButtonBase
            key={name}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(i)}
            sx={{
              gap: sm ? '6px' : '9px',
              height: sm ? 22 : 36,
              px: sm ? '10px' : '16px',
              borderRadius: sm ? '7px' : '9px',
              border: `1px solid ${on ? t.tint.orangeBorder : 'transparent'}`,
              bgcolor: on ? t.surface.card : 'transparent',
              boxShadow: on ? '0 2px 6px rgba(60,40,20,0.10)' : 'none',
              fontFamily: t.font.ui,
              fontSize: sm ? 11.5 : 13,
              fontWeight: on ? 800 : 600,
              color: on ? t.text.heading : t.text.label,
              whiteSpace: 'nowrap',
              transition: 'background-color .18s, box-shadow .18s, color .18s, border-color .18s',
              '&:hover': {
                bgcolor: on ? t.surface.card : t.tint.orangeHover,
                color: on ? t.text.heading : t.brand.orangeText,
              },
              '&.Mui-focusVisible': { boxShadow: t.shadow.focus },
            }}
          >
            <Box
              sx={{
                width: sm ? 16 : 22,
                height: sm ? 16 : 22,
                borderRadius: sm ? '5px' : '7px',
                display: 'grid',
                placeItems: 'center',
                fontSize: sm ? 9.5 : 11,
                fontWeight: 800,
                bgcolor: on ? t.brand.orange : t.surface.card,
                border: `1px solid ${on ? t.brand.orange : t.border.default}`,
                color: on ? t.surface.card : t.chrome.mutedBadgeText,
                transition: 'background-color .18s, color .18s',
              }}
            >
              {i + 1}
            </Box>
            {name}
          </ButtonBase>
        );
      })}
    </Box>
  );
};

export { AppTabs, AppSegmentedTabs };
