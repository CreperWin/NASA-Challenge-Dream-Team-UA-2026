export const INDICATOR_IDS = [
  'heart_rate',
  'blood_pressure',
  'body_temperature',
  'blood_glucose',
  'sleep',
  'mood',
] as const;
export type IndicatorId = (typeof INDICATOR_IDS)[number];

// Один показник може мати кілька вимірюваних величин (тиск = два числа).
export const METRIC_IDS = [
  'heart_rate',
  'bp_systolic',
  'bp_diastolic',
  'body_temperature',
  'blood_glucose',
  'sleep_hours',
  'mood_score',
] as const;
export type MetricId = (typeof METRIC_IDS)[number];

export const REGION_IDS = [
  'cardiovascular',
  'bones_muscles',
  'brain_mind',
  'immune',
  'metabolism',
] as const;
export type RegionId = (typeof REGION_IDS)[number];

export const STATUSES = ['normal', 'attention', 'critical'] as const;
export type Status = (typeof STATUSES)[number];

export type Trend = 'improving' | 'stable' | 'worsening' | 'unknown';

export interface Measurement {
  type: MetricId;
  value: number;
  unit: string;
  timestamp: string; // ISO 8601
  missionDay?: number;
}

export interface Profile {
  name: string;
  baseline?: Partial<Record<MetricId, number>>;
}

// ---- thresholds.json ----
// Зона: min включно, max виключно; якщо min або max немає, межі немає.
export interface Zone {
  status: Status;
  min?: number;
  max?: number;
}

export interface MetricThreshold {
  indicator: IndicatorId;
  label: string;
  unit: string;
  validRange: { min: number; max: number }; // що можна ввести у формі
  zones: Zone[]; // мають покривати весь validRange без прогалин і накладань
  source: string; // посилання на джерело
  verified: boolean; // true лише коли значення звірені з джерелом
}
export type ThresholdsFile = Record<MetricId, MetricThreshold>;

// ---- content.json ----
export interface SourceRef {
  label: string;
  url: string;
}

export interface IndicatorContent {
  title: string;
  howToMeasure: string;
  whyItMatters: string;
  spaceRisk: string;
  whenToWorry: string;
  actions: string[];
  callFlightSurgeon: string;
  sources: SourceRef[];
}
export type ContentFile = Record<IndicatorId, IndicatorContent>;

// ---- scenario JSON ----
export interface ScenarioDay {
  day: number; // день місії
  values: Partial<Record<MetricId, number>>;
}

export interface Scenario {
  id: string;
  title: string;
  story: string;
  days: ScenarioDay[];
}

// ---- результат evaluate() ----
export interface IndicatorResult {
  indicator: IndicatorId;
  status: Status;
  reason: string; // одне речення простими словами
  trend: Trend;
  latest: Measurement[]; // останнє вимірювання по кожній величині
}

export interface EvaluationResult {
  overall: Status;
  indicators: Record<IndicatorId, IndicatorResult>;
  regions: Record<RegionId, Status | 'no-data'>;
}
