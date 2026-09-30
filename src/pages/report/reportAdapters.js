// Reshapes useAnnualReportData()'s output (already the real API data, with Angular's business
// logic/bugs faithfully reproduced — see DECARB_REPORT_ANALYSIS.md) into the
// `[{ name, values: string[], children: [[name, ...values]] }]` shape ExpandableTable expects
// (per the design handoff). No business logic lives here — purely a data-shape translation.
import { fmt0 } from './reportFormat';

const SCOPE_VALUE_KEYS = ['co2e', 'co2', 'ch4', 'n2o'];

// Tab D, Table 1 & 2 (base year / selected year scope totals).
export function scopeRowsToTree(rows) {
  const parents = rows.filter((r) => r.scope === 'parent');
  return parents.map((parent) => ({
    name: parent.label,
    values: [...SCOPE_VALUE_KEYS.map((k) => fmt0(parent[k])), '-', '-'],
    children: rows
      .filter((r) => r.scope === parent.label)
      .map((child) => [child.label, ...SCOPE_VALUE_KEYS.map((k) => fmt0(child[k])), '-', '-']),
  }));
}

const SOURCE_TYPE_KEYS = [
  'stationary',
  'mobile',
  'process_emision',
  'fugitive',
  'electricity',
  'steam',
];

// Tab D, Table 3 (emissions disaggregated by source type, site→plant tree).
export function overallRowsToTree(rows) {
  const parents = rows.filter((r) => r.scope === 'parent');
  return parents.map((parent) => ({
    name: parent.plantName,
    values: SOURCE_TYPE_KEYS.map((k) => fmt0(parent[k])),
    children: rows
      .filter((r) => r.scope === 'child' && r.siteId === parent.siteId)
      .map((child) => [child.plantName, ...SOURCE_TYPE_KEYS.map((k) => fmt0(child[k]))]),
  }));
}

// Tab B, Facilities table. Business rule preserved from Angular: type-of-control/equity-share
// are only ever shown on the site (parent) row — plant (child) rows always render blank for
// both columns, regardless of what's on the underlying record (report.component.html:422-425).
export function orgDataToFacilities(orgData) {
  const sites = orgData.filter((o) => !o.plant);
  return sites.map((site) => ({
    name: site.label,
    values: [site.boundary || '', site.boundy || ''],
    children: orgData
      .filter((o) => o.plant && o.siteId === site.siteId)
      .map((plant) => [plant.label, '', '']),
  }));
}

// Static content, not from the API — verbatim from report.component.ts / report.component.html.
export const GHG_CATEGORIES = [
  'Stationary emissions',
  'Mobile emissions',
  'Process emissions',
  'Fugitive emissions',
  'Electricity emissions',
  'Steam emissions',
];

export const METHODS = [
  [
    'Stationary Sources:',
    'U.S. EPA. Greenhouse Gas Inventory Guidance. Direct Emissions from Stationary Combustion Sources. January 2016.',
  ],
  [
    'Mobile Sources:',
    'U.S. EPA. Greenhouse Gas Inventory Guidance. Direct Emissions from Mobile Combustion Sources. January 2016.',
  ],
  [
    'Refrigeration/AC Use:',
    'U.S. EPA. Greenhouse Gas Inventory Guidance. Direct Fugitive Emissions from Refrigeration, Air Conditioning, Fire Suppression, and Industrial Gases. November 2014.',
  ],
  [
    'Indirect Electricity/Steam Purchases:',
    'U.S. EPA. Greenhouse Gas Inventory Guidance. Indirect Emissions from Purchased Electricity. January 2016.',
  ],
];

export const GAS_COLS = [
  ['Total', 'mtCO2e'],
  ['CO2', 'mt'],
  ['CH4', 'mt'],
  ['N2O', 'mt'],
  ['HFC', 'mt'],
  ['PFC', 'mt'],
];

export const SOURCE_COLS = [
  { group: 'direct', label: 'a. Stationary Combustion' },
  { group: 'direct', label: 'b. Mobile Combustion' },
  { group: 'direct', label: 'c. Process Sources' },
  { group: 'direct', label: 'd. Fugitive Sources' },
  { group: 'indirect', label: 'a. Purchased / Acquired Electricity' },
  { group: 'indirect', label: 'b. Purchased / Acquired Steam' },
];
