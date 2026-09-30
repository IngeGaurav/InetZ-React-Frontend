// Matches Angular's `{{ value | number:'1.0-0' }}` pipe: round to 0 decimals, thousands
// separators, empty string (not '0' or '—') for null/undefined — used throughout the report
// tables. Kept local to this feature rather than added to the shared formatUtils.js, since it's
// a fixed-precision variant other call sites don't need.
export const fmt0 = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '';
  }
  return Math.round(num).toLocaleString('en-US');
};
