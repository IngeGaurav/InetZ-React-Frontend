import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { GridDashboardIcon } from '@/components/icons';
import { C, CATEGORICAL, dm, noto } from './emissionTheme';
import { donutOptions, lineOptions } from './emissionChartOptions';
import { useEquipmentEmissionData } from './hooks/useEquipmentEmissionData';
import { PageHeader } from './components/PageHeader';
import { Row, pageContainerSx, compact } from './components/Layout';
import { ChartCard, CardHeader, cardSx } from './components/ChartCard';

const fmt0 = (n) => Math.round(n).toLocaleString('en-US');

// DataGrid skin matching the Emission Overview tables: tinted uppercase header, hairline row
// dividers, no column separators / focus outlines, active row tinted with an orange left edge.
const gridSx = {
  border: 0,
  fontFamily: noto,
  fontSize: 12,
  color: C.body,
  '--DataGrid-t-header-background-base': C.headBg,
  '& .MuiDataGrid-columnHeaders': {
    borderTop: `1px solid ${C.divider}`,
    borderBottom: `1px solid ${C.divider}`,
  },
  '& .MuiDataGrid-columnHeader': {
    bgcolor: C.headBg,
    px: '15px',
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontFamily: noto,
    fontSize: 10.5,
    fontWeight: 700,
    color: C.subtle,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  '& .MuiDataGrid-columnSeparator': { display: 'none' },
  '& .MuiDataGrid-cell': {
    px: '15px',
    borderBottom: `1px solid ${C.rowLine}`,
    fontWeight: 600,
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-cell[data-field="label"]': { fontWeight: 700, color: C.ink },
  '& .MuiDataGrid-cell[data-field="total"]': { fontWeight: 800, color: C.ink },
  [compact]: {
    '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader': { px: '10px' },
    '& .MuiDataGrid-columnHeaderTitle': { fontSize: 9.5, letterSpacing: '0.02em' },
    fontSize: 11.5,
  },
  '& .MuiDataGrid-row': { cursor: 'pointer' },
  '& .MuiDataGrid-row:hover': { bgcolor: C.rowHover },
  '& .MuiDataGrid-row.row-active, & .MuiDataGrid-row.row-active:hover': {
    bgcolor: C.hoverTint,
    boxShadow: `inset 3px 0 0 ${C.orange}`,
  },
};

/**
 * Equipment Overview (/dashboard/emission-dashboard/equipment) — port of Angular's
 * EquipmentEmissionComponent. A table of equipment totals by site; clicking a row drives the
 * site-wise pie and the progression line for that equipment. See
 * docs/EMISSION_DASHBOARD_ANALYSIS.md A.4 / A.7.
 *
 * Table is MUI X DataGrid (Community): clickable-row selection is exactly its model, and there is
 * no sticky-column or double-header requirement here (unlike the scope tables). Sorting/menus are
 * off because Angular's table has none — the backend already returns rows sorted by total desc.
 */
const EquipmentEmissionPage = () => {
  const { columns, rows, selectedRow, setSelectedId, pie, progression } =
    useEquipmentEmissionData();

  // Label column left-aligned; every number column (Total + one per site) right-aligned with its
  // header, so digits line up under their headings.
  const gridColumns = useMemo(
    () => [
      { field: 'label', headerName: 'Equipment', flex: 1.5, minWidth: 120, sortable: false },
      {
        field: 'total',
        headerName: 'Total',
        flex: 1,
        minWidth: 76,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        valueFormatter: (value) => fmt0(value),
      },
      ...columns.map((name, i) => ({
        field: `site${i}`,
        headerName: name,
        flex: 1,
        minWidth: 88,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        valueGetter: (_v, row) => row.bySite[i],
        valueFormatter: (value) => (value === null || value === undefined ? '—' : fmt0(value)),
      })),
    ],
    [columns]
  );

  const pieOptions = useMemo(
    () =>
      pie
        ? donutOptions({
            items: pie.labels.map((name, i) => ({
              name,
              y: pie.values[i],
              color: CATEGORICAL[pie.colorIndexes[i] % CATEGORICAL.length],
            })),
          })
        : null,
    [pie]
  );

  const progressionOptions = useMemo(
    () =>
      progression && selectedRow
        ? lineOptions({
            categories: progression.categories,
            series: [{ name: selectedRow.label, data: progression.data, color: C.orange }],
            legend: false,
          })
        : null,
    [progression, selectedRow]
  );

  const name = selectedRow?.label ?? '';

  return (
    <>
      <PageTitle title="Emission Overview — Equipment" />
      <Box
        sx={{
          fontFamily: dm,
          color: C.pageText,
          bgcolor: C.page,
          minHeight: '100%',
          px: '18px',
          pb: '24px',
          ...pageContainerSx,
        }}
      >
        <PageHeader
          icon={<GridDashboardIcon size={19} />}
          title="Emission Overview"
          subtitle="Equipment-wise emissions"
        />

        <Row cols={{ base: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                ...cardSx,
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: '12px 15px 10px' }}>
                <CardHeader
                  title="Equipment Emissions"
                  subtitle="tCO₂e by equipment and site · select a row to update the charts"
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: Math.min(440, Math.max(200, 38 + rows.length * 40)),
                  position: 'relative',
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0 }}>
                  <DataGrid
                    rows={rows}
                    columns={gridColumns}
                    hideFooter
                    disableColumnMenu
                    disableColumnSorting
                    disableColumnResize
                    disableRowSelectionOnClick
                    columnHeaderHeight={36}
                    rowHeight={40}
                    onRowClick={(p) => setSelectedId(p.id)}
                    getRowClassName={(p) => (p.id === selectedRow?.id ? 'row-active' : '')}
                    localeText={{ noRowsLabel: 'Data not available' }}
                    sx={gridSx}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <ChartCard
              title={`Sitewise ${name} tCO₂e Emission`}
              subtitle="Share of the equipment's tCO₂e by site"
              options={pieOptions}
              height={250}
              expandable={false}
            />
          </Box>
        </Row>

        <Box sx={{ px: '4px', pt: '12px', display: 'flex', flexDirection: 'column' }}>
          <ChartCard
            title={`${name} tCO₂e Emission Progression`}
            options={progressionOptions}
            height={220}
          />
        </Box>
      </Box>
    </>
  );
};

export default EquipmentEmissionPage;
