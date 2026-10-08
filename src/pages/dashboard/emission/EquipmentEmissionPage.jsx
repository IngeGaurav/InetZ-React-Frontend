import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { GridDashboardIcon } from '@/components/icons';
import { C, CATEGORICAL, dm } from './emissionTheme';
import { donutOptions, lineOptions } from './emissionChartOptions';
import { useEquipmentEmissionData } from './hooks/useEquipmentEmissionData';
import { PageHeader } from './components/PageHeader';
import { ChartCard, cardSx } from './components/ChartCard';

const fmt0 = (n) => Math.round(n).toLocaleString('en-US');

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

  const gridColumns = useMemo(
    () => [
      { field: 'label', headerName: 'Equipment', flex: 1.4, minWidth: 170, sortable: false },
      {
        field: 'total',
        headerName: 'Total',
        flex: 1,
        minWidth: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        valueFormatter: (value) => fmt0(value),
      },
      ...columns.map((name, i) => ({
        field: `site${i}`,
        headerName: name,
        flex: 1,
        minWidth: 130,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        valueGetter: (_v, row) => row.bySite[i],
        valueFormatter: (value) => (value === null || value === undefined ? '–' : fmt0(value)),
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
        }}
      >
        <PageHeader
          icon={<GridDashboardIcon size={19} />}
          title="Emission Overview"
          subtitle="Equipment-wise emissions"
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, minmax(0, 1fr))' },
            gap: '8px',
          }}
        >
          <Box sx={{ gridColumn: { lg: 'span 8' }, minWidth: 0 }}>
            <Box sx={{ ...cardSx, p: '6px', height: 340 }}>
              <DataGrid
                rows={rows}
                columns={gridColumns}
                hideFooter
                disableColumnMenu
                disableColumnSorting
                disableRowSelectionOnClick
                onRowClick={(p) => setSelectedId(p.id)}
                getRowClassName={(p) => (p.id === selectedRow?.id ? 'row-active' : '')}
                localeText={{ noRowsLabel: 'Data not available' }}
                sx={{
                  border: 0,
                  '& .MuiDataGrid-row': { cursor: 'pointer' },
                  '& .MuiDataGrid-row.row-active, & .MuiDataGrid-row.row-active:hover': {
                    bgcolor: C.hoverTint,
                    fontWeight: 700,
                  },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ gridColumn: { lg: 'span 4' }, minWidth: 0 }}>
            <ChartCard
              title={`Sitewise ${name} tCO₂e Emission`}
              options={pieOptions}
              height={250}
              expandable={false}
            />
          </Box>
        </Box>

        <Box sx={{ mt: '8px' }}>
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
