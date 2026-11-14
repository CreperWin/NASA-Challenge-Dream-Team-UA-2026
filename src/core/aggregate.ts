import { INDICATORS } from './indicators';
import { INDICATOR_IDS, REGION_IDS } from './types';
import type { IndicatorId, IndicatorResult, RegionId, Status } from './types';

export type RegionStatus = Status | 'no-data';
export type IndicatorResults = Partial<Record<IndicatorId, IndicatorResult>>;

const SEVERITY: Record<Status, number> = { normal: 0, attention: 1, critical: 2 };

/** Найгірший зі статусів; порожній список означає normal. */
export function worstStatus(statuses: Status[]): Status {
  return statuses.reduce<Status>(
    (worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst),
    'normal',
  );
}

/** Показники, що належать області тіла. */
export function indicatorsOfRegion(region: RegionId): IndicatorId[] {
  return INDICATOR_IDS.filter((id) => INDICATORS[id].region === region);
}

/** Результати, у яких є хоча б одне вимірювання. */
function withData(results: IndicatorResults, ids: readonly IndicatorId[]): IndicatorResult[] {
  const out: IndicatorResult[] = [];
  for (const id of ids) {
    const r = results[id];
    if (r && r.latest.length > 0) out.push(r);
  }
  return out;
}

export function regionStatuses(results: IndicatorResults): Record<RegionId, RegionStatus> {
  const out = {} as Record<RegionId, RegionStatus>;
  for (const region of REGION_IDS) {
    const related = withData(results, indicatorsOfRegion(region));
    out[region] = related.length === 0 ? 'no-data' : worstStatus(related.map((r) => r.status));
  }
  return out;
}

export function overallStatus(results: IndicatorResults): Status {
  return worstStatus(withData(results, INDICATOR_IDS).map((r) => r.status));
}