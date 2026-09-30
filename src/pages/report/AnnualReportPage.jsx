import { useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { CheckIcon } from '@/components/icons';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { YearPicker } from '@/components/common/YearPicker/YearPicker';
import { AppTabs, AppSegmentedTabs } from '@/components/common/AppTabs/AppTabs';
import { TonalButton } from '@/components/common/TonalButton/TonalButton';
import { C, noto, dm, labelSx } from './ghgReportTheme';
import {
  Svg,
  ReadField,
  EditableField,
  Card,
  tintIconBtn,
  PrintSubHeading,
} from './components/GhgPrimitives';
import { ExpandableTable } from './components/ExpandableTable';
import { useAnnualReportData } from './hooks/useAnnualReportData';
import {
  scopeRowsToTree,
  overallRowsToTree,
  orgDataToFacilities,
  GHG_CATEGORIES,
  METHODS,
  GAS_COLS,
  SOURCE_COLS,
} from './reportAdapters';
import { downloadReportPdf, printReportPdf } from './pdfGenerator';

const TABS = [
  { key: 'org', letter: 'A', name: 'Organizational Details' },
  { key: 'boundary', letter: 'B', name: 'Boundary Conditions' },
  { key: 'method', letter: 'C', name: 'Methodologies' },
  { key: 'emissions', letter: 'D', name: 'Emissions' },
  { key: 'offsets', letter: 'E', name: 'Offsets' },
];
const APP_TABS_LIST = TABS.map((t) => ({ key: t.key, badge: t.letter, label: t.name }));
const SECTION_NAMES = [
  'A. Organizational Details',
  'B. Boundary Conditions',
  'C. Methodologies',
  'D. Emissions',
  'E. Offsets',
];

const gasColumns = GAS_COLS.map(([label, sub]) => ({ label, sub }));
const gasTemplate = 'minmax(200px,1.8fr) repeat(6, minmax(72px,1fr))';

// ── Tab panels — same structure as the design handoff's panels, fed by real API data instead
//    of ghgData.js mocks. `forcePdf` fully expands every tree table (for the hidden PDF clone).
function OrgPanel({ orgDetails, address, selectedYear }) {
  if (!orgDetails) {
    return null;
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', p: '18px', maxWidth: 620 }}>
      <ReadField label="Organization Name" value={orgDetails.name} />
      <ReadField label="Organization Address" value={address} />
      <ReadField label="Inventory Contact Name" value={orgDetails.contactPerson} />
      <ReadField label="Contact Information" value={orgDetails.phone} />
      <ReadField label="Reporting Period" value={selectedYear} />
    </Box>
  );
}

function OrganizationalBoundaryBlock({
  orgDetails,
  facilities,
  facilitiesText,
  onFacilitiesTextChange,
  forcePdf,
}) {
  return (
    <>
      <ReadField
        label="Organizational boundary approach used for GHG inventory"
        value={orgDetails.boundy}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: 820 }}>
        <Box>
          <Typography sx={labelSx}>
            List of Facilities Included Under Selected Organizational Boundary
          </Typography>
          <Typography sx={{ fontFamily: noto, fontSize: 11, color: C.captionMuted }}>
            List all of the organization-wide facilities included under the selected organizational
            boundary and include the ownership status (owned or leased) for each facility.
          </Typography>
        </Box>
        <ExpandableTable
          firstCol="Facility"
          childLabel="plants"
          defaultOpen
          minWidth={560}
          colTemplate="minmax(220px,1.6fr) minmax(140px,1fr) minmax(120px,0.8fr)"
          columns={[{ label: 'Type of Control' }, { label: 'Equity Share, %' }]}
          rows={facilities}
          forceOpen={forcePdf}
        />
      </Box>
      <EditableField
        label="Have any facilities, operations and/or emissions sources been excluded from this inventory? If yes, please specify."
        value={facilitiesText}
        onChange={onFacilitiesTextChange}
      />
    </>
  );
}

function OperationalBoundaryBlock() {
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Typography component="label" sx={labelSx}>
          List of Categories for GHG
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {GHG_CATEGORIES.map((c) => (
            <Box
              key={c}
              sx={{
                fontFamily: noto,
                fontSize: 11.5,
                fontWeight: 700,
                color: C.tintText,
                bgcolor: C.tint,
                border: `1px solid ${C.tintBorder}`,
                borderRadius: '20px',
                px: '12px',
                py: '5px',
              }}
            >
              {c}
            </Box>
          ))}
        </Box>
      </Box>
      <ReadField label="Are Scope 3 emissions included in this inventory?" value="No" />
    </>
  );
}

function BoundaryPanel({ orgDetails, orgData, facilitiesText, onFacilitiesTextChange, forcePdf }) {
  const [sub, setSub] = useState(0);
  const facilities = useMemo(() => orgDataToFacilities(orgData), [orgData]);
  if (!orgDetails) {
    return null;
  }
  // PDF/print: stack both sub-sections in full, instead of showing only whichever sub-tab is
  // active — the design handoff's sub-tabs are interactive-only and never had a "print all" mode.
  if (forcePdf) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', p: '16px 18px 18px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PrintSubHeading index={1}>Organizational Boundary</PrintSubHeading>
          <OrganizationalBoundaryBlock
            orgDetails={orgDetails}
            facilities={facilities}
            facilitiesText={facilitiesText}
            onFacilitiesTextChange={onFacilitiesTextChange}
            forcePdf
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PrintSubHeading index={2}>Operational Boundary</PrintSubHeading>
          <OperationalBoundaryBlock />
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '16px 18px 18px' }}>
      <AppSegmentedTabs
        items={['Organizational Boundary', 'Operational Boundary']}
        value={sub}
        onChange={setSub}
      />
      {sub === 0 ? (
        <OrganizationalBoundaryBlock
          orgDetails={orgDetails}
          facilities={facilities}
          facilitiesText={facilitiesText}
          onFacilitiesTextChange={onFacilitiesTextChange}
        />
      ) : (
        <OperationalBoundaryBlock />
      )}
    </Box>
  );
}

function MethodPanel({ orgDetails, dbName }) {
  if (!orgDetails) {
    return null;
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', p: '18px', maxWidth: 820 }}>
      <ReadField maxWidth="none" label="1. Base database for Emission Factors" value={dbName} />
      <ReadField
        maxWidth="none"
        label="2. Reference GWP AR Version"
        value={orgDetails.gwp ? String(orgDetails.gwp).toUpperCase() : ''}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Typography component="label" sx={labelSx}>
          3. Methodologies used to calculate or measure emissions
        </Typography>
        <Box
          sx={{ border: `1.5px solid ${C.fieldBorder}`, borderRadius: '8px', bgcolor: C.fieldBg }}
        >
          {METHODS.map(([k, v], i) => (
            <Box
              key={k}
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px minmax(0,1fr)',
                gap: '14px',
                px: '12px',
                py: '10px',
                borderBottom: i < METHODS.length - 1 ? `1px solid ${C.fieldBorder}` : 'none',
              }}
            >
              <Typography sx={{ fontFamily: noto, fontSize: 12, fontWeight: 700, color: C.text }}>
                {k}
              </Typography>
              <Typography sx={{ fontFamily: noto, fontSize: 12, lineHeight: 1.5, color: C.body }}>
                {v}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <ReadField
        maxWidth="none"
        label="4. Emission Factors"
        value="Refer Annexure A. Default emission factors are overridden with custom factors wherever custom factors input given"
      />
      <ReadField
        maxWidth="none"
        label="5. Activity Data"
        value="Refer 1st column in Annexure A for tag numbers and description of activity data."
      />
    </Box>
  );
}

function EmissionsPanel({
  orgDetails,
  selectedYear,
  clarificationOfCompany,
  onClarificationOfCompanyChange,
  contextForAnySignificant,
  onContextForAnySignificantChange,
  baseYearRows,
  emissionYearRows,
  overallTableRows,
  forcePdf,
}) {
  const [sub, setSub] = useState(0);
  const baseYearTree = useMemo(() => scopeRowsToTree(baseYearRows), [baseYearRows]);
  const emissionYearTree = useMemo(() => scopeRowsToTree(emissionYearRows), [emissionYearRows]);
  const overallTree = useMemo(() => overallRowsToTree(overallTableRows), [overallTableRows]);
  if (!orgDetails) {
    return null;
  }

  const baseYearInfoBlock = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: 620 }}>
      <ReadField label="Year chosen as base year" value={orgDetails.baselineYear} />
      <EditableField
        label="Clarification of company-determined policy for making base year emissions recalculations"
        value={clarificationOfCompany}
        onChange={onClarificationOfCompanyChange}
      />
      <EditableField
        label="Context for any significant emissions changes that trigger base year emissions recalculations"
        value={contextForAnySignificant}
        onChange={onContextForAnySignificantChange}
      />
    </Box>
  );
  const baseYearTable = (
    <ExpandableTable
      firstCol="Emission Type"
      childLabel="sites"
      columns={gasColumns}
      rows={baseYearTree}
      colTemplate={gasTemplate}
      forceOpen={forcePdf}
    />
  );
  const emissionYearTable = (
    <ExpandableTable
      firstCol="Emission Type"
      childLabel="sites"
      columns={gasColumns}
      rows={emissionYearTree}
      colTemplate={gasTemplate}
      forceOpen={forcePdf}
    />
  );
  const sourceTypeTable = (
    <ExpandableTable
      firstCol="Site"
      childLabel="plants"
      minWidth={900}
      colTemplate="minmax(200px,1.5fr) repeat(6, minmax(104px,1fr))"
      groups={[
        { label: 'Direct emissions · Scope 1', span: 4 },
        { label: 'Indirect emissions · Scope 2', span: 2 },
      ]}
      dividers={[0, 4]}
      columns={SOURCE_COLS}
      rows={overallTree}
      forceOpen={forcePdf}
    />
  );

  // PDF/print: stack all four sub-sections in full, instead of showing only whichever sub-tab
  // is active — same reasoning as BoundaryPanel above.
  if (forcePdf) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', p: '16px 18px 18px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PrintSubHeading index={1}>Base Year Information</PrintSubHeading>
          {baseYearInfoBlock}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PrintSubHeading index={2}>
            Emission for Base Year {orgDetails.baselineYear}
          </PrintSubHeading>
          {baseYearTable}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PrintSubHeading index={3}>Emission for Year {selectedYear}</PrintSubHeading>
          {emissionYearTable}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PrintSubHeading index={4}>Emissions by Source Type</PrintSubHeading>
          {sourceTypeTable}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '16px 18px 18px' }}>
      <AppSegmentedTabs
        items={[
          'Base Year Information',
          `Emission for Base Year ${orgDetails.baselineYear}`,
          `Emission for Year ${selectedYear}`,
          'Emissions by Source Type',
        ]}
        value={sub}
        onChange={setSub}
      />
      {sub === 0 && baseYearInfoBlock}
      {sub === 1 && baseYearTable}
      {sub === 2 && emissionYearTable}
      {sub === 3 && sourceTypeTable}
    </Box>
  );
}

const OffsetsPanel = ({ selectedYear }) => (
  <Box sx={{ p: '18px' }}>
    <Box
      sx={{
        bgcolor: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '14px',
        overflowX: 'auto',
      }}
    >
      <Box sx={{ minWidth: 640 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)',
            bgcolor: C.headBg,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {[
            'Quantity of GHG (mtCO2e)',
            'Type of offset project',
            'Were the offsets verified/certified/approved by an external GHG program (e.g., CDM)',
          ].map((l, i) => (
            <Box
              key={l}
              sx={{
                fontFamily: noto,
                fontSize: 10,
                fontWeight: 700,
                color: C.head,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: '18px',
                py: '12px',
                borderLeft: i ? `1.5px solid ${C.divider}` : 'none',
                textWrap: 'balance',
              }}
            >
              {l}
            </Box>
          ))}
        </Box>
        <Box sx={{ py: '28px', textAlign: 'center' }}>
          <Typography sx={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: C.ink }}>
            No offsets reported
          </Typography>
          <Typography sx={{ fontFamily: noto, fontSize: 11.5, color: C.muted }}>
            No offset projects were recorded for {selectedYear}.
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

// Print-options popover — not part of the design handoff (its mockup used a bare window.print()
// button), but Angular's real print flow lets the user pick which of the 5 sections to include
// before printing (see DECARB_REPORT_ANALYSIS.md A.2/A.5) — kept as real functionality, styled
// to match the shared Dropdown/YearPicker popover language (src/components/common/) rather than
// a plain MUI menu.
function PrintOptionsPopover({ anchor, onClose, sectionsSelected, onToggleSection, onPrint }) {
  return (
    <Popover
      open={!!anchor}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            mt: '6px',
            width: 260,
            p: '14px',
            borderRadius: '14px',
            border: `1px solid ${C.popoverBorder}`,
            boxShadow: '0 10px 30px rgba(40,30,20,0.12)',
          },
        },
      }}
    >
      <Typography
        sx={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: C.ink, mb: '10px' }}
      >
        Sections to Print
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', mb: '12px' }}>
        {SECTION_NAMES.map((name) => {
          const checked = sectionsSelected.includes(name);
          return (
            <ButtonBase
              key={name}
              onClick={() => onToggleSection(name)}
              sx={{
                gap: '9px',
                justifyContent: 'flex-start',
                height: 32,
                px: '8px',
                borderRadius: '7px',
                fontFamily: noto,
                fontSize: 12,
                fontWeight: checked ? 700 : 500,
                color: checked ? C.tintText : C.subtleText,
                bgcolor: checked ? C.tint : 'transparent',
                '&:hover': { bgcolor: checked ? C.tint : C.hover },
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  flex: 'none',
                  borderRadius: '5px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: checked ? C.orange : C.white,
                  border: `1.5px solid ${checked ? C.orange : C.divider}`,
                  color: C.white,
                }}
              >
                {checked && <CheckIcon size={13} />}
              </Box>
              {name}
            </ButtonBase>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TonalButton onClick={onPrint}>Print</TonalButton>
      </Box>
    </Popover>
  );
}

/**
 * GHG Annual Report (/report/report) — visual layer ported pixel-accurately from the approved
 * design handoff (C:\Users\gpetkar\Desktop\report page code\GHGReport.jsx), wired to real API
 * data via useAnnualReportData(). See D:\InetZ\DECARB_REPORT_ANALYSIS.md for the full
 * Angular→backend trace this data layer was built from.
 */
const AnnualReportPage = () => {
  const data = useAnnualReportData();
  const {
    selectedSite,
    setSelectedSite,
    selectedYear,
    setSelectedYear,
    sideList,
    yearList,
    orgDetails,
    dbName,
    address,
    orgData,
    baseYearRows,
    emissionYearRows,
    overallTableRows,
  } = data;

  const [tab, setTab] = useState(0);
  const [printAnchor, setPrintAnchor] = useState(null);
  const [sectionsSelected, setSectionsSelected] = useState(SECTION_NAMES);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Ephemeral, unsaved fields — matches Angular exactly (no backing endpoint; see
  // DECARB_REPORT_ANALYSIS.md B.3-adjacent note — these are plain component state there too).
  const [facilitiesText, setFacilitiesText] = useState('');
  const [clarificationOfCompany, setClarificationOfCompany] = useState('');
  const [contextForAnySignificant, setContextForAnySignificant] = useState('');

  const pdfContentRef = useRef(null);

  const toggleSection = (name) =>
    setSectionsSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const runPdfAction = async (action) => {
    const el = pdfContentRef.current;
    if (!el) {
      return;
    }
    el.style.display = 'block';
    setIsGeneratingPdf(true);
    try {
      await action(el);
    } finally {
      el.style.display = 'none';
      setIsGeneratingPdf(false);
    }
  };

  // Download always exports every section, regardless of the print popover's selection —
  // matches ReportComponent.generatePdf() resetting section visibility before rendering.
  const handleDownload = () => runPdfAction(downloadReportPdf);

  // Print respects whichever sections are currently checked — matches generatePdfPrint().
  const handlePrint = () => {
    setPrintAnchor(null);
    runPdfAction(printReportPdf);
  };

  const panelProps = {
    orgDetails,
    address,
    selectedYear,
    dbName,
    orgData,
    facilitiesText,
    onFacilitiesTextChange: setFacilitiesText,
    clarificationOfCompany,
    onClarificationOfCompanyChange: setClarificationOfCompany,
    contextForAnySignificant,
    onContextForAnySignificantChange: setContextForAnySignificant,
    baseYearRows,
    emissionYearRows,
    overallTableRows,
  };

  const panel = useMemo(
    () =>
      ({
        org: <OrgPanel {...panelProps} />,
        boundary: <BoundaryPanel {...panelProps} />,
        method: <MethodPanel {...panelProps} />,
        emissions: <EmissionsPanel {...panelProps} />,
        offsets: <OffsetsPanel selectedYear={selectedYear} />,
      })[TABS[tab].key],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- panelProps is a fresh object every render by design
    [
      tab,
      orgDetails,
      address,
      selectedYear,
      dbName,
      orgData,
      facilitiesText,
      clarificationOfCompany,
      contextForAnySignificant,
      baseYearRows,
      emissionYearRows,
      overallTableRows,
    ]
  );

  const SECTION_KEY_BY_NAME = {
    'A. Organizational Details': 'org',
    'B. Boundary Conditions': 'boundary',
    'C. Methodologies': 'method',
    'D. Emissions': 'emissions',
    'E. Offsets': 'offsets',
  };
  const pdfSectionKeys = new Set(sectionsSelected.map((n) => SECTION_KEY_BY_NAME[n]));

  return (
    <>
      <PageTitle title="Annual Report" />
      <Box
        sx={{
          fontFamily: dm,
          color: C.pageText,
          bgcolor: C.page,
          minHeight: '100%',
          px: '18px',
          pb: '24px',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            bgcolor: C.page,
            px: '4px',
            pt: '12px',
            pb: '14px',
            boxShadow: '0 8px 8px -8px rgba(47,47,47,0.10)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: C.iconTileBg,
                border: `1px solid ${C.tintBorder}`,
                color: C.orangeDeep,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Svg size={18} sw={1.9}>
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </Svg>
            </Box>
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontFamily: dm,
                  fontSize: 18,
                  fontWeight: 800,
                  color: C.ink,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                }}
              >
                GHG Report for Year {selectedYear}
              </Typography>
              <Typography sx={{ fontFamily: noto, fontSize: 11, color: C.muted, mt: '3px' }}>
                Greenhouse gas inventory · {selectedSite}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <Dropdown
              label="Site"
              options={sideList}
              value={selectedSite}
              onChange={setSelectedSite}
              width={200}
            />
            <YearPicker
              label="Reporting Year"
              years={yearList}
              value={selectedYear}
              onChange={setSelectedYear}
            />
            <Box sx={{ width: '1px', height: 26, bgcolor: C.border, mx: '2px', mb: '5px' }} />
            <Tooltip title="Download">
              <IconButton aria-label="Download" sx={tintIconBtn} onClick={handleDownload}>
                <Svg>
                  <path d="M12 3v12" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M4 19h16" />
                </Svg>
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton
                aria-label="Print"
                sx={tintIconBtn}
                onClick={(e) => setPrintAnchor(e.currentTarget)}
              >
                <Svg>
                  <path d="M6 9V3h12v6" />
                  <rect x="3" y="9" width="18" height="8" rx="2" />
                  <path d="M6 14h12v7H6z" />
                </Svg>
              </IconButton>
            </Tooltip>
            <PrintOptionsPopover
              anchor={printAnchor}
              onClose={() => setPrintAnchor(null)}
              sectionsSelected={sectionsSelected}
              onToggleSection={toggleSection}
              onPrint={handlePrint}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', pt: '14px', px: '4px' }}>
          <AppTabs tabs={APP_TABS_LIST} value={tab} onChange={setTab} />
          <Card letter={TABS[tab].letter} title={TABS[tab].name}>
            {panel}
          </Card>
        </Box>
      </Box>

      <Backdrop
        open={isGeneratingPdf}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1, flexDirection: 'column', gap: 2 }}
      >
        <CircularProgress color="inherit" />
        <Typography color="inherit">Generating PDF, please wait…</Typography>
      </Backdrop>

      {/* Hidden full-report clone — html2canvas/jsPDF renders exactly this DOM node. All sections
          the print popover has checked (or all 5, for the plain Download button) are rendered
          with every tree table fully expanded. Matches report.component.html's #pdf-content. */}
      <Box
        ref={pdfContentRef}
        sx={{ display: 'none', bgcolor: C.page, p: '18px', flexDirection: 'column', gap: '14px' }}
      >
        <Typography sx={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: C.ink }}>
          GHG Report for Year {selectedYear}
        </Typography>
        {pdfSectionKeys.has('org') && (
          <Card letter="A" title="Organizational Details">
            <OrgPanel {...panelProps} />
          </Card>
        )}
        {pdfSectionKeys.has('boundary') && (
          <Card letter="B" title="Boundary Conditions">
            <BoundaryPanel {...panelProps} forcePdf />
          </Card>
        )}
        {pdfSectionKeys.has('method') && (
          <Card letter="C" title="Methodologies">
            <MethodPanel {...panelProps} />
          </Card>
        )}
        {pdfSectionKeys.has('emissions') && (
          <Card letter="D" title="Emissions">
            <EmissionsPanel {...panelProps} forcePdf />
          </Card>
        )}
        {pdfSectionKeys.has('offsets') && (
          <Card letter="E" title="Offsets">
            <OffsetsPanel selectedYear={selectedYear} />
          </Card>
        )}
      </Box>
    </>
  );
};

export default AnnualReportPage;
