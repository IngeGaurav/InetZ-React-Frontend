import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { emissionDashboardService as svc } from '@/services/emissionDashboardService';
import { queryKeys } from '@/constants/queryKeys';
import { buildEquipmentRows, buildProgressionByName } from '../emissionAdapters';

const K = queryKeys.emissionDashboard;

/**
 * Data + selection state for /dashboard/emission-dashboard/equipment ("Equipment Overview").
 * Port of EquipmentEmissionComponent: `output/equipmentTable/0` (no marketBased param — location
 * basis always, as in Angular) drives the table and the per-site pie; `output/equipmentGraphBar`
 * (no params, all-time) drives the progression line. Row 0 is selected by default.
 */
export function useEquipmentEmissionData() {
  const tableQ = useQuery({
    queryKey: K.equipmentTable(),
    queryFn: () => svc.getEquipmentTable(0),
  });
  const graphQ = useQuery({
    queryKey: K.equipmentGraphBar(),
    queryFn: svc.getEquipmentGraphBar,
  });

  const { columns, rows } = useMemo(() => buildEquipmentRows(tableQ.data), [tableQ.data]);
  const progressionByName = useMemo(() => buildProgressionByName(graphQ.data), [graphQ.data]);

  const [selectedId, setSelectedId] = useState(0);
  const selectedRow = rows.find((r) => r.id === selectedId) ?? rows[0];

  // Pie: one slice per site with a non-null value for the selected equipment; each site keeps the
  // same colour index it has in the table's column order.
  const pie = useMemo(() => {
    if (!selectedRow) {
      return null;
    }
    const labels = [];
    const values = [];
    const colorIndexes = [];
    selectedRow.bySite.forEach((value, i) => {
      if (value !== null) {
        labels.push(columns[i]);
        values.push(value);
        colorIndexes.push(i);
      }
    });
    return labels.length ? { labels, values, colorIndexes } : null;
  }, [selectedRow, columns]);

  // Progression: empty chart when the API has no entry for this equipment (dummy fallback removed
  // in Angular too).
  const progression = useMemo(() => {
    const live = selectedRow ? progressionByName[selectedRow.label] : null;
    return live?.value?.length ? { categories: live.label, data: live.value } : null;
  }, [selectedRow, progressionByName]);

  return { columns, rows, selectedRow, setSelectedId, pie, progression };
}
