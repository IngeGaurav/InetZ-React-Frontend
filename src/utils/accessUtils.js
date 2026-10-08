/**
 * Per-site access check — port of Angular's EmissionApiService.isWriteAccess().
 * SUPER_ADMIN may access every site; any other role needs an entry in the user's
 * `userSiteAccessDetails` with the matching site id and `access` truthy. Client-side only, as in
 * Angular — the backend does not enforce it (docs/EMISSION_DASHBOARD_ANALYSIS.md B.3).
 */
export const isWriteAccess = (user, siteId) => {
  if (user?.role === 'SUPER_ADMIN') {
    return true;
  }
  if (!siteId) {
    return false;
  }
  return !!(user?.userSiteAccessDetails ?? []).find((s) => s.id === Number(siteId) && s.access);
};

/** Angular hides "Edit/Enter Data" for the USER role (EmissionApiService.hasDashboardAccess). */
export const hasDashboardAccess = (user) => user?.role !== 'USER';
