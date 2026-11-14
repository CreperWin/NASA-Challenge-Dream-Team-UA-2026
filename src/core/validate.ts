import { content, thresholds } from './data';
import { INDICATOR_IDS, METRIC_IDS, STATUSES } from './types';
import { inZone } from './zones';

export function validateData(): string[] {
  const problems: string[] = [];

  for (const id of METRIC_IDS) {
    const t = thresholds[id];
    if (!t) {
      problems.push(`thresholds: missing metric "${id}"`);
      continue;
    }
    if (t.validRange.min >= t.validRange.max) {
      problems.push(`thresholds.${id}: validRange.min must be less than validRange.max`);
    }
    for (const zone of t.zones) {
      if (!STATUSES.includes(zone.status)) {
        problems.push(`thresholds.${id}: unknown status "${zone.status}"`);
      }
    }
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const v = t.validRange.min + ((t.validRange.max - t.validRange.min) * i) / steps;
      const matches = t.zones.filter((zone) => inZone(v, zone)).length;
      if (matches !== 1) {
        problems.push(
          `thresholds.${id}: value ${v} falls into ${matches} zones (must be exactly 1)`,
        );
        break;
      }
    }
  }

  for (const id of INDICATOR_IDS) {
    if (!content[id]) problems.push(`content: missing indicator "${id}"`);
  }

  return problems;
}
