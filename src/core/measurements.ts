import { thresholds } from './data';
import type { Measurement, MetricId, Scenario } from './types';
import { METRIC_IDS } from './types';

/** Створює вимірювання; одиниця береться з thresholds.json. */
export function createMeasurement(
  type: MetricId,
  value: number,
  timestamp: string | Date = new Date(),
  missionDay?: number,
): Measurement {
  return {
    type,
    value,
    unit: thresholds[type].unit,
    timestamp: typeof timestamp === 'string' ? timestamp : timestamp.toISOString(),
    ...(missionDay === undefined ? {} : { missionDay }),
  };
}

/**
 * Розгортає сценарій у список вимірювань (один запис на величину на день).
 * День місії → ISO-час: startDate + (day - firstDay) діб, 08:00 UTC.
 * Це ж використає B14 (відтворення сценарію).
 */
export function measurementsFromScenario(
  scenario: Scenario,
  upToDayIndex: number = scenario.days.length - 1,
  startDate: Date = new Date('2026-01-01T08:00:00Z'),
): Measurement[] {
  if (scenario.days.length === 0) return [];
  const firstDay = scenario.days[0].day;
  const result: Measurement[] = [];
  for (const d of scenario.days.slice(0, upToDayIndex + 1)) {
    const ts = new Date(startDate.getTime() + (d.day - firstDay) * 86_400_000).toISOString();
    for (const id of METRIC_IDS) {
      const v = d.values[id];
      if (v !== undefined) result.push(createMeasurement(id, v, ts, d.day));
    }
  }
  return result;
}
