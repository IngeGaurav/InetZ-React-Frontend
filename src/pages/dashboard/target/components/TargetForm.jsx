import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { C, noto } from '@/pages/dashboard/emission/emissionTheme';
import { cardSx, CardHeader } from '@/pages/dashboard/emission/components/ChartCard';
import { compact } from '@/pages/dashboard/emission/components/Layout';
import {
  ABSOLUTE,
  SECTORAL,
  SECTORS,
  METHODS,
  PROJECTION_METHODS,
  DEFAULT_VALUES,
  targetFormSchema,
  pastYears,
  futureYears,
} from '../targetSettingForm';

const Field = ({ label, error, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
    {children}
    {error && (
      <Typography sx={{ fontFamily: noto, fontSize: 11, color: C.error, mt: '2px' }}>
        {error}
      </Typography>
    )}
  </Box>
);

/**
 * "Set Target" form — port of Angular's `organizationForm`. Conditional fields per method
 * (Absolute Contraction → Most Recent Year; Sectoral → Projection Method + Target Year Activity),
 * and switching method clears the other method's fields, as Angular does. Validation is stricter
 * than Angular's (targetSettingForm.js). `onSubmit(values)` is called only with a valid form.
 */
export const TargetForm = ({ siteNames, canCalculate, isSubmitting, onSubmit }) => {
  const currentYear = new Date().getFullYear();
  const past = useMemo(() => pastYears(currentYear), [currentYear]);
  const future = useMemo(() => futureYears(currentYear), [currentYear]);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    resolver: zodResolver(targetFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const method = useWatch({ control, name: 'method' });
  const projectionMethod = useWatch({ control, name: 'projectionMethod' });
  const baseYear = useWatch({ control, name: 'baseYear' });

  // Switching method clears the fields that belong to the other one (Angular's
  // setAbsoluteContractionValidators / setSectoralDecarbonizationValidators).
  useEffect(() => {
    if (method === ABSOLUTE) {
      setValue('projectionMethod', '');
      setValue('yearActivity', '');
    } else {
      setValue('mostRecentYear', '');
    }
    trigger();
  }, [method, setValue, trigger]);

  // Cross-field rules (target > base, most recent > base) must re-run when the base year moves.
  useEffect(() => {
    trigger(['targetYear', 'mostRecentYear']);
  }, [baseYear, trigger]);

  const err = (name) => (touchedFields[name] ? errors[name]?.message : undefined);

  const select = (name, label, options, placeholder) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field label={label} error={err(name)}>
          <Dropdown
            label={label}
            options={options}
            value={field.value || placeholder}
            width="100%"
            compact
            onChange={(v) => {
              field.onChange(v);
              field.onBlur();
            }}
          />
        </Field>
      )}
    />
  );

  return (
    <Box
      sx={{
        ...cardSx,
        p: '12px 15px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        [compact]: { p: '10px 11px 12px' },
      }}
    >
      <CardHeader title="Set Target" subtitle="Calculate a decarbonization target for a site" />
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        {select('siteName', 'Organization/Site', siteNames, 'Select Organization')}
        {select('sector', 'Sector', SECTORS, 'Select Sector')}
        {select('method', 'Target Setting Method', METHODS, METHODS[0])}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '10px',
          }}
        >
          {select('baseYear', 'Base Year', past, 'Select Year')}
          {select('targetYear', 'Target Year', future, 'Select Year')}
        </Box>

        {method === ABSOLUTE && select('mostRecentYear', 'Most Recent Year', past, 'Select Year')}

        {method === SECTORAL && (
          <>
            {select(
              'projectionMethod',
              'Activity Projection Method',
              PROJECTION_METHODS,
              'Select Projection Method'
            )}
            <Controller
              control={control}
              name="yearActivity"
              render={({ field }) => (
                <Field label="Target Year Activity" error={err('yearActivity')}>
                  <TextField
                    {...field}
                    type="number"
                    size="small"
                    label={
                      projectionMethod === 'Target Year Output'
                        ? 'Target Year Activity'
                        : 'Target Year Activity (not used for Fix Market)'
                    }
                    placeholder="Target Year Activity"
                    slotProps={{ htmlInput: { min: 0 } }}
                    fullWidth
                  />
                </Field>
              )}
            />
          </>
        )}

        {/* Hidden for the USER role, as in Angular (hasDashboardAccess). */}
        {canCalculate && (
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || isSubmitting}
            sx={{ alignSelf: 'flex-start', mt: '4px' }}
          >
            {isSubmitting ? 'Calculating…' : 'Calculate'}
          </Button>
        )}
      </Box>
    </Box>
  );
};
