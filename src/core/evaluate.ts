import { INDICATORS } from './indicators';
import { thresholds } from './data';
import { findZone } from './zones';
import type {
  EvaluationResult,
  IndicatorId,
  IndicatorResult,
  Measurement,
  MetricId,
  Profile,
  RegionId,
  Status,
  Trend,
} from './types';
import { INDICATOR_IDS, METRIC_IDS, REGION_IDS } from './types';

const DAY_MS = 86_400_000;
const TREND_WINDOW_DAYS = 3;
/** Зміна «відстані від норми» менша за цю частку ширини норми вважається стабільною. */
const TREND_EPSILON = 0.05;

const SEVERITY: Record<Status, number> = { normal: 0, attention: 1, critical: 2 };

export function worstStatus(statuses: Status[]): Status {
  return statuses.reduce<Status>((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a), 'normal');
}

// ---------- допоміжне ----------

function time(m: Measurement): number {
  return new Date(m.timestamp).getTime();
}

function isUsable(m: Measurement): boolean {
  return METRIC_IDS.includes(m.type) && Number.isFinite(m.value) && Number.isFinite(time(m));
}

/** Нормальна зона величини (перша зі статусом normal). */
function normalZone(metric: MetricId) {
  return thresholds[metric].zones.find((z) => z.status === 'normal');
}

function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

function withUnit(metric: MetricId, text: string): string {
  const unit = thresholds[metric].unit;
  return unit === 'score' ? text : `${text} ${unit}`;
}

function normalRangeText(metric: MetricId): string {
  const z = normalZone(metric);
  if (!z) return 'the normal range';
  if (z.min !== undefined && z.max !== undefined) {
    return withUnit(metric, `${fmt(z.min)}–${fmt(z.max)}`);
  }
  if (z.min !== undefined) return `${withUnit(metric, fmt(z.min))} or more`;
  if (z.max !== undefined) return `under ${withUnit(metric, fmt(z.max))}`;
  return 'any value';
}

/**
 * Відстань значення від норми в частках ширини норми (0 = у нормі).
 * Для напіввідкритих норм ширина = |межа|, щоб уникнути ділення на 0.
 */
function distanceFromNormal(metric: MetricId, value: number): number {
  const z = normalZone(metric);
  if (!z) return 0;
  const lo = z.min ?? -Infinity;
  const hi = z.max ?? Infinity;
  const width =
    Number.isFinite(lo) && Number.isFinite(hi)
      ? hi - lo
      : Math.abs(Number.isFinite(lo) ? lo : hi) || 1;
  if (value < lo) return (lo - value) / width;
  if (value >= hi) return (value - hi) / width;
  return 0;
}

function metricStatus(metric: MetricId, value: number): Status {
  return findZone(value, thresholds[metric].zones)?.status ?? 'normal';
}

// ---------- тренд ----------

/**
 * Останнє значення проти середнього за попередні 3 доби (від часу останнього вимірювання).
 * Краще/гірше = ближче/далі від норми. Нема історії → 'unknown'.
 */
function metricTrend(metric: MetricId, all: Measurement[], latest: Measurement): Trend {
  const t = time(latest);
  const previous = all.filter(
    (m) => m.type === metric && time(m) < t && time(m) >= t - TREND_WINDOW_DAYS * DAY_MS,
  );
  if (previous.length === 0) return 'unknown';
  const avg = previous.reduce((s, m) => s + m.value, 0) / previous.length;
  const delta = distanceFromNormal(metric, latest.value) - distanceFromNormal(metric, avg);
  if (delta > TREND_EPSILON) return 'worsening';
  if (delta < -TREND_EPSILON) return 'improving';
  return 'stable';
}

function combineTrends(trends: Trend[]): Trend {
  if (trends.includes('worsening')) return 'worsening';
  if (trends.includes('improving')) return 'improving';
  if (trends.includes('stable')) return 'stable';
  return 'unknown';
}

// ---------- причина ----------

function metricReason(metric: MetricId, value: number, status: Status, label: string): string {
  const shown = metric === 'mood_score' ? `${fmt(value)} out of 5` : withUnit(metric, fmt(value));
  if (status === 'normal') return `${label} is ${shown}, within the normal range.`;
  const z = normalZone(metric);
  const below = z?.min !== undefined && value < z.min;
  const dir = below ? 'below' : 'above';
  const range = normalRangeText(metric);
  return status === 'critical'
    ? `${label} is ${shown}, far ${dir} the normal range (${range}).`
    : `${label} is ${shown}, ${dir} the normal range (${range}).`;
}

// ---------- evaluate ----------

function evaluateIndicator(id: IndicatorId, measurements: Measurement[]): IndicatorResult {
  const def = INDICATORS[id];
  const latest: Measurement[] = [];
  for (const metric of def.metrics) {
    let last: Measurement | undefined;
    for (const m of measurements) {
      if (m.type === metric && (!last || time(m) >= time(last))) last = m;
    }
    if (last) latest.push(last);
  }

  if (latest.length === 0) {
    return {
      indicator: id,
      status: 'normal',
      reason: `No ${def.label.toLowerCase()} measurements yet.`,
      trend: 'unknown',
      latest,
    };
  }

  const perMetric = latest.map((m) => ({ m, status: metricStatus(m.type, m.value) }));
  const status = worstStatus(perMetric.map((p) => p.status));
  const multi = def.metrics.length > 1;

  let reason: string;
  if (status === 'normal' && multi) {
    // «Blood pressure is 116/74 mmHg, within the normal range.»
    const values = perMetric.map((p) => fmt(p.m.value)).join('/');
    reason = `${def.label} is ${withUnit(perMetric[0].m.type, values)}, within the normal range.`;
  } else {
    const worst = perMetric.find((p) => p.status === status)!;
    const label = multi ? thresholds[worst.m.type].label : def.label;
    reason = metricReason(worst.m.type, worst.m.value, status, label);
  }

  return {
    indicator: id,
    status,
    reason,
    trend: combineTrends(latest.map((m) => metricTrend(m.type, measurements, m))),
    latest,
  };
}

/**
 * B3: rules engine. Усе керується thresholds.json.
 * - показник без вимірювань: status 'normal', latest [] (в overall і в області не враховується);
 * - область без жодного показника з даними: 'no-data'.
 */
export function evaluate(measurements: Measurement[], _profile: Profile): EvaluationResult {
  const usable = measurements.filter(isUsable);

  const indicators = {} as Record<IndicatorId, IndicatorResult>;
  for (const id of INDICATOR_IDS) indicators[id] = evaluateIndicator(id, usable);

  const withData = INDICATOR_IDS.filter((id) => indicators[id].latest.length > 0);

  const regions = {} as Record<RegionId, Status | 'no-data'>;
  for (const region of REGION_IDS) {
    const inRegion = withData.filter((id) => INDICATORS[id].region === region);
    regions[region] =
      inRegion.length === 0 ? 'no-data' : worstStatus(inRegion.map((id) => indicators[id].status));
  }

  return { overall: worstStatus(withData.map((id) => indicators[id].status)), indicators, regions };
}
