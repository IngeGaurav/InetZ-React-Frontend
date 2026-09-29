import { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import Badge from '@mui/material/Badge';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import { tokens, statusChipSx, trendChipSx, tabsPillSx } from '@/theme';
import { BellIcon, AlertTriangleIcon, ChevronDownIcon } from '@/components/icons';
import { iconGroups, iconCount } from '@/components/icons/iconRegistry';

const { color, utility, status, trend, hierarchy, domain, dashboardLevel, cardGradient, gradient } =
  tokens;

const utilityOptions = Object.keys(utility);

const Section = ({ title, children }) => (
  <div className="mb-10">
    <Typography variant="h5" sx={{ mb: 2, color: color.text.heading }}>
      {title}
    </Typography>
    {children}
  </div>
);

const Swatch = ({ name, hex, sub }) => (
  <div
    className="flex items-center gap-2 rounded-lg border p-2"
    style={{ borderColor: color.border.card, background: color.surface.card }}
  >
    <div
      className="h-9 w-9 shrink-0 rounded-md border"
      style={{ background: hex, borderColor: color.border.soft }}
    />
    <div className="min-w-0">
      <div className="truncate text-xs font-semibold" style={{ color: color.text.bodyStrong }}>
        {name}
      </div>
      <div className="truncate text-[10px]" style={{ color: color.text.faint }}>
        {sub || hex}
      </div>
    </div>
  </div>
);

const dataGridColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'equipment', headerName: 'Equipment', flex: 1 },
  { field: 'utility', headerName: 'Utility', flex: 1 },
  { field: 'sec', headerName: 'SEC', width: 100, type: 'number' },
  { field: 'status', headerName: 'Status', width: 130 },
];

const dataGridRows = [
  { id: 1, equipment: 'Boiler Unit A', utility: 'Steam', sec: 128.4, status: 'Running' },
  { id: 2, equipment: 'Chiller 2', utility: 'Chilled Water', sec: 84.1, status: 'Normal' },
  { id: 3, equipment: 'Compressor B', utility: 'Electricity', sec: 62.0, status: 'Maintenance' },
  { id: 4, equipment: 'Fan-101', utility: 'Cooling Water', sec: 45.7, status: 'Critical' },
];

/**
 * TEMPORARY — visual QA page at the "/" route (see src/routes/index.jsx) to check every
 * themed MUI component + design-system color token against the source mockup, without
 * needing to log in. Remove this file and its route once the theme has been eyeballed.
 */
const ThemePreview = () => {
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div
        className="mt-4 rounded-xl border p-6"
        style={{ borderColor: color.border.card, background: color.surface.card }}
      >
        <Typography variant="h3" sx={{ mb: 1 }}>
          Theme preview{' '}
          <span style={{ color: color.text.faint, fontWeight: 400 }}>
            (temporary — remove before shipping)
          </span>
        </Typography>
        <Typography variant="body2" sx={{ mb: 6, color: color.text.secondary }}>
          Every themed component + color token, rendered in one place to check against
          docs/design-system.md.
        </Typography>

        <Section title="Typography">
          <div className="flex flex-col gap-1">
            <Typography variant="h1">H1 — KPI Value Large 27px/800</Typography>
            <Typography variant="h2">H2 — KPI Value 16px/800</Typography>
            <Typography variant="h3">H3 — Section / Card Title 15px/700</Typography>
            <Typography variant="h4">H4 13px/700</Typography>
            <Typography variant="h5">H5 12px/700</Typography>
            <Typography variant="h6">H6 11px/700</Typography>
            <Typography variant="subtitle1">Subtitle1 — Helper / Subtitle 12px/500</Typography>
            <Typography variant="subtitle2">Subtitle2 — Value Sub-figure 11px/700</Typography>
            <Typography variant="body1">Body1 — Table Cell Value 11px/600</Typography>
            <Typography variant="body2">Body2 — Caption / Note 10.5px/500</Typography>
            <Typography variant="caption" display="block">
              CAPTION — CARD MICRO-LABEL 10px/700
            </Typography>
            <Typography variant="overline" display="block">
              OVERLINE — TABLE HEADER 8.5PX/700
            </Typography>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
            <Button variant="contained" color="error">
              Error
            </Button>
            <Button variant="contained" disabled>
              Disabled
            </Button>
            <div className="rounded-md p-2" style={{ background: gradient.header }}>
              <Button variant="onBrand">On brand</Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button variant="contained" size="small">
              Small 28px
            </Button>
            <Button variant="contained" size="medium">
              Medium 38px
            </Button>
            <Button variant="contained" size="large">
              Large 46px
            </Button>
            <IconButton color="primary">
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Card>
              <CardHeader title="Energy Flow Summary" subheader="by unit — last 7 days" />
              <CardContent>
                <Typography variant="body2">
                  Plain card — no action area, hover has no lift.
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardActionArea>
                <CardHeader title="Clickable card" subheader="hover lifts + shadow.hover" />
                <CardContent>
                  <Typography variant="body2">Wrapped in CardActionArea.</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            <Card className="Mui-selected">
              <CardHeader title="Selected card" subheader="shadow.selected keyline" />
              <CardContent>
                <Typography variant="body2">
                  Selected state — 1px orange keyline + soft glow.
                </Typography>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Inputs & selection controls">
          <div className="flex flex-wrap items-start gap-4">
            <TextField label="Outlined input" placeholder="Type here" size="small" />
            <TextField label="Error state" error helperText="Required field" size="small" />
            <TextField label="Disabled" disabled size="small" defaultValue="Can't edit" />
            <TextField label="Select" select size="small" defaultValue="a" sx={{ minWidth: 160 }}>
              <MenuItem value="a">Option A</MenuItem>
              <MenuItem value="b">Option B</MenuItem>
              <MenuItem value="c">Option C</MenuItem>
            </TextField>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
            <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
            <RadioGroup row defaultValue="1" sx={{ display: 'inline-flex' }}>
              <FormControlLabel value="1" control={<Radio />} label="Radio 1" />
              <FormControlLabel value="2" control={<Radio />} label="Radio 2" />
            </RadioGroup>
            <FormControlLabel control={<Switch defaultChecked />} label="Switch" />
          </div>
        </Section>

        <Section title="Autocomplete (multi-select)">
          <Autocomplete
            multiple
            options={utilityOptions}
            defaultValue={[utilityOptions[0], utilityOptions[2]]}
            sx={{ maxWidth: 360 }}
            renderInput={(params) => (
              <TextField {...params} label="Utilities" placeholder="Add..." />
            )}
          />
        </Section>

        <Section title="Chips">
          <div className="flex flex-wrap gap-2">
            <Chip label="Outlined" variant="outlined" />
            <Chip label="Primary" color="primary" />
            <Chip label="Secondary" color="secondary" />
            <Chip label="Success" color="success" />
            <Chip label="Warning" color="warning" />
            <Chip label="Error" color="error" onDelete={() => {}} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip variant="metric" label="Load factor 0.82" />
            <Chip variant="metric" color="secondary" label="SEC 128.4" />
            <Chip variant="count" label="12" />
            <Chip variant="count" color="error" label="3" />
            <Chip variant="status" sx={statusChipSx('Running')} label="Running" />
            <Chip variant="status" sx={statusChipSx('Critical')} label="Critical" />
            <Chip variant="trend" sx={trendChipSx('up')} label="▲ 8.2%" />
            <Chip variant="trend" sx={trendChipSx('down')} label="▼ 3.1%" />
          </div>
        </Section>

        <Section title="Tabs (underline + pill variants)">
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Overview" />
            <Tab label="Emissions" />
            <Tab label="Utilities" />
          </Tabs>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ ...tabsPillSx, mt: 2 }}>
            <Tab label="Overview" />
            <Tab label="Emissions" />
            <Tab label="Utilities" />
          </Tabs>
        </Section>

        <Section title="Segmented / enclosed toggle buttons">
          <div className="flex flex-wrap items-center gap-4">
            <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v !== null && setTab(v)}>
              <ToggleButton value={0}>Day</ToggleButton>
              <ToggleButton value={1}>Week</ToggleButton>
              <ToggleButton value={2}>Month</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              variant="enclosed"
              value={tab}
              exclusive
              onChange={(_, v) => v !== null && setTab(v)}
            >
              <ToggleButton value={0}>Table</ToggleButton>
              <ToggleButton value={1}>Chart</ToggleButton>
              <ToggleButton value={2}>Map</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Section>

        <Section title="Progress bars">
          <div className="flex max-w-sm flex-col gap-3">
            <LinearProgress variant="determinate" value={72} color="info" />
            <LinearProgress variant="determinate" value={45} color="primary" />
            <LinearProgress variant="determinate" value={88} color="error" />
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-6">
            <Badge badgeContent={4} color="primary">
              <BellIcon size={22} style={{ color: color.text.control }} />
            </Badge>
            <Badge badgeContent={12} color="error">
              <AlertTriangleIcon size={22} style={{ color: color.text.control }} />
            </Badge>
            <div
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold"
              style={{ borderColor: color.border.soft, color: color.text.control }}
            >
              Emissions
              <Badge variant="tab" badgeContent={5} color="primary" />
            </div>
          </div>
        </Section>

        <Section title="Accordion">
          <div className="max-w-xl">
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ChevronDownIcon size={16} />}>
                Energy Flow by Unit
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Expanded by default — single-open group pattern used inside modals.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDownIcon size={16} />}>
                SEU Compliance Matrix
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">Collapsed panel content.</Typography>
              </AccordionDetails>
            </Accordion>
          </div>
        </Section>

        <Section title="Alerts">
          <div className="flex flex-col gap-2">
            <Alert severity="success">Within limits, healthy, resolved.</Alert>
            <Alert severity="warning">Approaching threshold, attention.</Alert>
            <Alert severity="error">Breach, fault, critical deviation.</Alert>
            <Alert severity="info">Neutral analytical highlight.</Alert>
          </div>
        </Section>

        <Section title="Dialog">
          <Button variant="outlined" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Modal Title</DialogTitle>
            <DialogContent>
              <Typography variant="body2">Dialog content styled per the theme.</Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="text" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={() => setDialogOpen(false)}>
                Apply
              </Button>
            </DialogActions>
          </Dialog>
        </Section>

        <Section title="Pagination (teal active)">
          <Pagination count={8} page={page} onChange={(_, v) => setPage(v)} />
        </Section>

        <Section title="Table (light-touch)">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Utility</TableCell>
                <TableCell align="right">SEC</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataGridRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.equipment}</TableCell>
                  <TableCell>{r.utility}</TableCell>
                  <TableCell align="right">{r.sec}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section title="DataGrid (MUI X Community — standard table)">
          <div style={{ height: 280 }}>
            <DataGrid rows={dataGridRows} columns={dataGridColumns} density="compact" />
          </div>
        </Section>

        <Section title="Utility colors (fixed)">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {Object.entries(utility).map(([k, hex]) => (
              <Swatch key={k} name={k} hex={hex} />
            ))}
          </div>
        </Section>

        <Section title="Status colors">
          <div className="flex flex-wrap gap-2">
            {Object.entries(status).map(([k, s]) => (
              <Chip
                key={k}
                label={k}
                sx={{ backgroundColor: s.halo, color: s.text, fontWeight: 700 }}
                icon={
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: s.hex,
                      marginLeft: 8,
                    }}
                  />
                }
              />
            ))}
          </div>
        </Section>

        <Section title="Trend chips">
          <div className="flex flex-wrap gap-2">
            <Chip
              label="▲ 8.2%"
              sx={{
                backgroundColor: trend.positiveChip.bg,
                color: trend.positiveChip.text,
                fontWeight: 700,
              }}
            />
            <Chip
              label="▼ 3.1%"
              sx={{
                backgroundColor: trend.negativeChip.bg,
                color: trend.negativeChip.text,
                fontWeight: 700,
              }}
            />
          </div>
        </Section>

        <Section title="Dashboard hierarchy levels">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
            {Object.entries(hierarchy).map(([k, h]) => (
              <div key={k} className="rounded-lg p-3" style={{ background: h.bg }}>
                <div className="text-xs font-bold" style={{ color: h.accent }}>
                  {k.toUpperCase()}
                </div>
                <div className="mt-1 text-[10px]" style={{ color: color.text.secondary }}>
                  {h.desc}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Domain / section colors">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
            {Object.entries(domain).map(([k, d]) => (
              <div key={k} className="rounded-lg p-3" style={{ background: d.bg }}>
                <div className="text-xs font-bold" style={{ color: d.accent }}>
                  {k}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Dashboard-level tint ramps">
          <div className="flex flex-col gap-2">
            {Object.entries(dashboardLevel).map(([k, lvl]) => (
              <div key={k} className="flex items-center gap-1">
                <div
                  className="w-16 shrink-0 text-xs font-semibold"
                  style={{ color: color.text.bodyStrong }}
                >
                  {k}
                </div>
                {lvl.tints.map((t, i) => (
                  <div key={i} className="h-6 flex-1 rounded" style={{ background: t }} />
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section title={`Icons (${iconCount}) — bare / light tile / dark tile`}>
          <div className="flex flex-col gap-6">
            {iconGroups.map((g) => (
              <div key={g.group}>
                <Typography
                  variant="overline"
                  display="block"
                  sx={{ mb: 1.5, color: color.text.caption }}
                >
                  {g.group}
                </Typography>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {g.icons.map((icon) => (
                    <div
                      key={icon.name}
                      className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center"
                      style={{ borderColor: color.border.soft, background: color.surface.sunken }}
                      title={icon.usage}
                    >
                      <div className="flex items-center gap-2">
                        <icon.Component size={20} style={{ color: color.text.control }} />
                        <icon.Component theme="light" />
                        <icon.Component theme="dark" />
                      </div>
                      <div
                        className="truncate text-[10px] font-medium"
                        style={{ color: color.text.secondary, maxWidth: '100%' }}
                      >
                        {icon.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Card gradients (KPI tiles)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Object.entries(cardGradient).map(([k, g]) => (
              <div
                key={k}
                className="rounded-xl border p-3"
                style={{ background: g.css, borderColor: color.border.card }}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: g.tone }}
                >
                  {k}
                </div>
                <div className="mt-1 text-[10px]" style={{ color: g.tone }}>
                  {g.use}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default ThemePreview;
