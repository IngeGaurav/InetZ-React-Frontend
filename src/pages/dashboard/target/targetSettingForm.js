// Form definition for the Target Setting page: option lists, validation, payload builder.
// Option lists are the Angular component's hardcoded constants, kept exactly
// (docs/TARGET_SETTING_ANALYSIS.md A.2 / Q9). Validation goes BEYOND Angular's on purpose
// (Q3 — Angular only had "required" on a few fields and let invalid combinations reach the
// backend, which answers with an opaque "failled"): every rule below is a client-side guard that
// prevents a request the backend cannot compute.
import { z } from 'zod';

export const SECTORS = ['Power', 'Ammonia', 'HVCs', 'Methanol'];
export const ABSOLUTE = 'Absolute Contraction';
export const SECTORAL = 'Sectoral Decarbonization';
export const METHODS = [ABSOLUTE, SECTORAL];
export const TARGET_YEAR_OUTPUT = 'Target Year Output';
export const FIX_MARKET = 'Fix Market';
export const PROJECTION_METHODS = [TARGET_YEAR_OUTPUT, FIX_MARKET];

const range = (from, to) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
// Base / most-recent years: 2015 … current year. Target years: current year + 1 … 2050.
export const pastYears = (currentYear) => range(2015, currentYear).map(String);
export const futureYears = (currentYear) => range(currentYear + 1, 2050).map(String);

export const DEFAULT_VALUES = {
  siteName: '',
  sector: '',
  method: ABSOLUTE,
  baseYear: '',
  targetYear: '',
  mostRecentYear: '',
  projectionMethod: '',
  yearActivity: '',
};

export const targetFormSchema = z
  .object({
    siteName: z.string().min(1, 'Site is required.'),
    sector: z.string().min(1, 'Sector is required.'),
    method: z.enum(METHODS),
    baseYear: z.string().min(1, 'Base Year is required.'),
    targetYear: z.string().min(1, 'Target Year is required.'),
    mostRecentYear: z.string(),
    projectionMethod: z.string(),
    yearActivity: z.string(),
  })
  .superRefine((v, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    const base = Number(v.baseYear);
    if (v.baseYear && v.targetYear && base >= Number(v.targetYear)) {
      issue('targetYear', 'Target Year must be after the Base Year.');
    }
    if (v.method === ABSOLUTE) {
      if (!v.mostRecentYear) {
        issue('mostRecentYear', 'Most Recent Year is required.');
      } else if (v.baseYear && Number(v.mostRecentYear) <= base) {
        issue('mostRecentYear', 'Most Recent Year must be after the Base Year.');
      }
    } else {
      if (!v.projectionMethod) {
        issue('projectionMethod', 'Projection Method is required.');
      }
      // The backend subtracts the target-year activity from base-year output for "Target Year
      // Output"; with it missing the calculation throws. "Fix Market" does not use it.
      if (v.projectionMethod === TARGET_YEAR_OUTPUT) {
        const n = Number(v.yearActivity);
        if (!v.yearActivity || !Number.isFinite(n) || n <= 0) {
          issue('yearActivity', 'Target Year Activity is required (a number above 0).');
        }
      }
    }
  });

// Request body exactly as Angular's calculate() builds it: only the fields valid for the method.
export const buildPayload = (v, siteId) => {
  const payload = {
    siteId: Number(siteId),
    sector: v.sector,
    targetSettingMethod: v.method,
    baseYear: Number(v.baseYear),
    targetYear: Number(v.targetYear),
  };
  if (v.method === ABSOLUTE) {
    payload.mostRecentYear = Number(v.mostRecentYear);
  } else {
    payload.projectionMethod = v.projectionMethod;
    if (v.yearActivity !== '') {
      payload.yearActivity = Number(v.yearActivity);
    }
  }
  return payload;
};
