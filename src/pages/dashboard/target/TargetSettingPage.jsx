import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { FlagIcon } from '@/components/icons';
import { C, CATEGORICAL, dm, noto } from '@/pages/dashboard/emission/emissionTheme';
import { donutOptions, lineOptions } from '@/pages/dashboard/emission/emissionChartOptions';
import { PageHeader } from '@/pages/dashboard/emission/components/PageHeader';
import { ChartCard } from '@/pages/dashboard/emission/components/ChartCard';
import { Row, Cell, pageContainerSx } from '@/pages/dashboard/emission/components/Layout';
import { useTargetSettingData } from './hooks/useTargetSettingData';
import { TargetForm } from './components/TargetForm';
import { TargetTable } from './components/TargetTable';
import { buildPayload } from './targetSettingForm';

/**
 * Target Setting (/dashboard/target-setting) — port of Angular's TargetSettingComponent
 * (docs/TARGET_SETTING_ANALYSIS.md). Form → POST /target (the page's only write), stored-targets
 * table, Actual vs Target line chart (scoped to the clicked site), site-wise donut.
 *
 * Deviations from Angular (all recorded in the analysis doc, section F): stricter form validation;
 * a confirm step before overwriting a site's existing target; the line chart (and the Emission
 * Dashboard) refetch after a calculation; "%" shown on % Reduction; failure toast with a useful
 * message instead of the raw "failled".
 */
const TargetSettingPage = () => {
  // '' = organisation; otherwise the clicked site's NAME (what the barChart endpoint takes).
  const [selectedSite, setSelectedSite] = useState('');
  // Calculation waiting for the user's confirmation to overwrite an existing target.
  const [pending, setPending] = useState(null);

  const { rows, orgRow, pie, bar, sites, orgName, canCalculate, mutation } =
    useTargetSettingData(selectedSite);

  const siteNames = useMemo(() => sites.map((s) => s.name), [sites]);

  const run = (payload) => mutation.mutate(payload);

  const onSubmit = (values) => {
    const site = sites.find((s) => s.name === values.siteName);
    if (!site) {
      return;
    }
    const payload = buildPayload(values, site.id);
    const existing = rows.find((r) => Number(r.siteId) === Number(site.id));
    if (existing) {
      // Re-running deletes the site's current target and rewrites it, and the Emission Dashboard
      // reads those rows live — so never overwrite silently (Q4).
      setPending({ payload, siteName: site.name, existing });
    } else {
      run(payload);
    }
  };

  const displayName = selectedSite || orgName;

  const lineOpts = useMemo(
    () =>
      bar
        ? lineOptions({
            categories: bar.categories,
            series: [
              { name: 'Actual', data: bar.actual, color: C.teal },
              { name: 'Target', data: bar.target, color: C.orange },
            ],
          })
        : null,
    [bar]
  );

  const donutOpts = useMemo(
    () =>
      pie
        ? donutOptions({
            items: pie.labels.map((name, i) => ({
              name,
              y: pie.values[i] ?? 0,
              color: CATEGORICAL[i % CATEGORICAL.length],
            })),
          })
        : null,
    [pie]
  );

  return (
    <>
      <PageTitle title="Target Setting" />
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
          icon={<FlagIcon size={19} />}
          title="Target Setting"
          subtitle="Organization - Decarbonization Target"
        />

        <Row cols={{ base: 'minmax(0, 1fr) minmax(0, 2fr)' }}>
          <Cell>
            <TargetForm
              siteNames={siteNames}
              canCalculate={canCalculate}
              isSubmitting={mutation.isPending}
              onSubmit={onSubmit}
            />
          </Cell>
          <Cell>
            <TargetTable
              rows={rows}
              orgRow={orgRow}
              selectedName={selectedSite}
              onSelect={setSelectedSite}
            />
          </Cell>
        </Row>

        <Row cols={{ base: 'minmax(0, 3fr) minmax(0, 1fr)' }}>
          <Cell>
            <ChartCard
              title={`Actual Vs Target tCO₂e Emissions - ${displayName}`}
              options={lineOpts}
              height={220}
              chartKey={displayName}
            />
          </Cell>
          <Cell>
            {/* Title kept as in Angular, although the values are each site's TARGET-year total,
                not a reduction (analysis B.7). */}
            <ChartCard
              title="Site-wise tCO₂e Emission Reduction"
              options={donutOpts}
              height={220}
              expandable={false}
            />
          </Cell>
        </Row>
      </Box>

      <Dialog open={!!pending} onClose={() => setPending(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: dm, fontWeight: 800 }}>Replace existing target?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: noto, fontSize: 13, color: C.body }}>
            <b>{pending?.siteName}</b> already has a target ({pending?.existing?.method}, target
            year {pending?.existing?.targetYear}). Calculating again <b>replaces it</b> — and the
            Emission Dashboard&apos;s targets and gauges change immediately.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPending(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              run(pending.payload);
              setPending(null);
            }}
          >
            Replace target
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TargetSettingPage;
