import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { EditIcon } from '@/components/icons';
import { C, dm, noto } from '@/pages/dashboard/emission/emissionTheme';
import { PageHeader } from '@/pages/dashboard/emission/components/PageHeader';
import { cardSx } from '@/pages/dashboard/emission/components/ChartCard';
import { pageContainerSx, compact } from '@/pages/dashboard/emission/components/Layout';
import { editEnterDataService } from '@/services/editEnterDataService';
import { emissionDashboardService } from '@/services/emissionDashboardService';
import { queryKeys } from '@/constants/queryKeys';
import { ROUTES } from '@/constants/routes';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { isWriteAccess, hasDashboardAccess } from '@/utils/accessUtils';

const ALL = { id: -1, name: 'All' };

// Local yyyy-MM-dd (Angular's formatDate).
const toYmd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Angular's `formatStrings` pipe: underscores → spaces, Title Case; empty → the literal '[]'.
const formatType = (value) =>
  !value ? '[]' : value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmt2 = (n) =>
  n === null || n === undefined || n === ''
    ? ''
    : Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const gridSx = {
  border: 0,
  fontFamily: noto,
  fontSize: 12,
  color: C.body,
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
  '& .MuiDataGrid-row:hover': { bgcolor: C.rowHover },
  '& .cell-edit': { cursor: 'text', bgcolor: C.hoverTint },
  [compact]: {
    '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader': { px: '10px' },
    '& .MuiDataGrid-columnHeaderTitle': { fontSize: 9.5, letterSpacing: '0.02em' },
    fontSize: 11.5,
  },
};

/**
 * Edit/Enter Data (/dashboard/edit-enter-data) — direct port of Angular's EditEnterDataComponent,
 * with NO behavioural changes (docs/EDIT_ENTER_DATA_ANALYSIS.md). Date / Site / Plant filters →
 * table of recorded values with a click-to-edit "New Value" cell → Submit posts the WHOLE table to
 * `emissions/postEditDetails`. Every problem found in Angular's version (and the changes proposed
 * for later) is recorded in that document, section B / C / E — none are fixed here.
 */
const EditEnterDataPage = () => {
  const user = useSelector(selectCurrentUser);
  const queryClient = useQueryClient();
  const apiRef = useGridApiRef();

  const [date, setDate] = useState(() => toYmd(new Date()));
  const [siteId, setSiteId] = useState(-1);
  const [plantId, setPlantId] = useState(-1);
  // Edits typed into "New Value", keyed by row; tagged with the data they were typed against so a
  // refetch / filter change starts clean (Angular replaces its table array, dropping edits).
  const [editState, setEditState] = useState({ tag: '', values: {} });

  const sitesQ = useQuery({
    queryKey: queryKeys.emissionDashboard.sites(),
    queryFn: emissionDashboardService.getSites,
  });
  const plantsQ = useQuery({
    queryKey: queryKeys.editEnterData.plants(siteId),
    queryFn: () => emissionDashboardService.getPlants(siteId),
    enabled: siteId !== -1,
  });
  const rowsQ = useQuery({
    queryKey: queryKeys.editEnterData.rows(date, siteId, plantId),
    queryFn: () => editEnterDataService.getRows({ date, site: siteId, plant: plantId }),
    // Angular only fetches when a date is selected (a cleared calendar stops fetching).
    enabled: !!date && sitesQ.isSuccess,
  });

  // Site list = "All" + sites the user has write access to; plants = "All" + the site's plants.
  const siteList = useMemo(
    () => [ALL, ...(sitesQ.data ?? []).filter((s) => isWriteAccess(user, s.id))],
    [sitesQ.data, user]
  );
  const plantList = useMemo(() => [ALL, ...(plantsQ.data ?? [])], [plantsQ.data]);

  const dataTag = `${date}|${siteId}|${plantId}|${rowsQ.dataUpdatedAt}`;
  const edits = editState.tag === dataTag ? editState.values : {};

  // Rows get a unique key (config ids repeat across emission types); `newValue` is the typed edit.
  const rows = useMemo(
    () =>
      (rowsQ.data ?? []).map((r, i) => ({
        ...r,
        rowKey: `${r.type}-${r.id}-${i}`,
        newValue: edits[`${r.type}-${r.id}-${i}`] ?? r.newValue,
      })),
    [rowsQ.data, edits]
  );

  const save = useMutation({
    // Angular posts the whole table as-is (edited or not).
    mutationFn: () =>
      editEnterDataService.saveRows(rows.map(({ rowKey: _rowKey, ...original }) => original)),
    onSuccess: (res) => {
      // Only a body status of 200 is acted on; anything else is silently ignored (as Angular).
      if (res?.status === 200) {
        toast.success('Data saved successfully');
        queryClient.invalidateQueries({ queryKey: queryKeys.editEnterData.all() });
      }
    },
    // Angular's HTTP-error handler is empty — nothing is shown.
  });

  const onSiteChange = (name) => {
    const site = siteList.find((s) => s.name === name);
    setSiteId(site ? site.id : -1);
    setPlantId(-1); // Angular resets the plant to "All" on every site change
  };
  const onPlantChange = (name) => {
    const plant = plantList.find((p) => p.name === name);
    setPlantId(plant ? plant.id : -1);
  };

  const columns = useMemo(
    () => [
      {
        field: 'type',
        headerName: 'Emission Type',
        flex: 1.2,
        minWidth: 130,
        sortable: false,
        valueFormatter: (v) => formatType(v),
      },
      { field: 'tag', headerName: 'ID/Tag', flex: 1.2, minWidth: 130, sortable: false },
      { field: 'site', headerName: 'Site', flex: 1, minWidth: 110, sortable: false },
      { field: 'plant', headerName: 'Plant', flex: 1, minWidth: 110, sortable: false },
      {
        field: 'value',
        headerName: 'Value',
        flex: 0.8,
        minWidth: 90,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        valueFormatter: (v) => fmt2(v),
      },
      {
        field: 'newValue',
        headerName: 'New Value',
        flex: 0.8,
        minWidth: 100,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        editable: true,
        cellClassName: 'cell-edit',
      },
    ],
    []
  );

  // Role rule (Angular ngOnInit): a USER is sent away. Angular's target (/report/equipment, the old
  // dashboard) is not ported, so the emission dashboard is used.
  if (!hasDashboardAccess(user)) {
    return <Navigate to={ROUTES.DASHBOARD_EMISSION} replace />;
  }

  return (
    <>
      <PageTitle title="Edit GHG Data" />
      <Box
        sx={{
          fontFamily: dm,
          color: C.pageText,
          bgcolor: C.page,
          minHeight: '100%',
          px: '18px',
          pb: '22px',
          ...pageContainerSx,
        }}
      >
        <PageHeader
          icon={<EditIcon size={19} />}
          title="Edit GHG Data"
          subtitle="Edit recorded emission input values for a date"
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', width: 170 }}>
              <Box
                component="label"
                htmlFor="eed-date"
                sx={{ fontFamily: noto, fontSize: 11, fontWeight: 600, color: C.subtle }}
              >
                Time stamp
              </Box>
              <TextField
                id="eed-date"
                type="date"
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Box>
            <Dropdown
              label="Site"
              options={siteList.map((s) => s.name)}
              value={siteList.find((s) => s.id === siteId)?.name ?? ALL.name}
              width={190}
              compact
              onChange={onSiteChange}
            />
            <Dropdown
              label="Plant"
              options={plantList.map((p) => p.name)}
              value={plantList.find((p) => p.id === plantId)?.name ?? ALL.name}
              width={190}
              compact
              onChange={onPlantChange}
            />
          </Box>
        </PageHeader>

        <Box sx={{ px: '4px', pt: '12px' }}>
          <Box sx={{ ...cardSx, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ minHeight: 300, height: 'calc(100vh - 290px)', maxHeight: 640 }}>
              <DataGrid
                apiRef={apiRef}
                rows={rows}
                columns={columns}
                getRowId={(r) => r.rowKey}
                hideFooter
                disableColumnMenu
                disableColumnSorting
                disableColumnResize
                disableRowSelectionOnClick
                columnHeaderHeight={36}
                rowHeight={40}
                localeText={{ noRowsLabel: 'No data available' }}
                // Click-to-edit, like Angular's pEditableColumn (DataGrid defaults to double-click).
                onCellClick={(p) => {
                  if (p.field === 'newValue' && p.cellMode === 'view') {
                    apiRef.current.startCellEditMode({ id: p.id, field: p.field });
                  }
                }}
                processRowUpdate={(updated) => {
                  setEditState({
                    tag: dataTag,
                    values: { ...edits, [updated.rowKey]: updated.newValue },
                  });
                  return updated;
                }}
                sx={gridSx}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: '12px' }}>
            {/* Angular: enabled whenever the table has rows, whether or not anything was edited. */}
            <Button
              variant="contained"
              onClick={() => save.mutate()}
              disabled={rows.length === 0 || save.isPending}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default EditEnterDataPage;
