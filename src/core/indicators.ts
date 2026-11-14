import type { IndicatorId, MetricId, RegionId } from './types';

export const INDICATORS: Record<
  IndicatorId,
  { label: string; metrics: MetricId[]; region: RegionId }
> = {
  heart_rate: { label: 'Heart rate', metrics: ['heart_rate'], region: 'cardiovascular' },
  blood_pressure: {
    label: 'Blood pressure',
    metrics: ['bp_systolic', 'bp_diastolic'],
    region: 'cardiovascular',
  },
  body_temperature: {
    label: 'Body temperature',
    metrics: ['body_temperature'],
    region: 'immune',
  },
  blood_glucose: { label: 'Blood glucose', metrics: ['blood_glucose'], region: 'metabolism' },
  sleep: { label: 'Sleep', metrics: ['sleep_hours'], region: 'brain_mind' },
  mood: { label: 'Mood', metrics: ['mood_score'], region: 'brain_mind' },
};

export const REGIONS: Record<RegionId, { label: string }> = {
  cardiovascular: { label: 'Cardiovascular system' },
  bones_muscles: { label: 'Bones and muscles' },
  brain_mind: { label: 'Brain and mind' },
  immune: { label: 'Immune system' },
  metabolism: { label: 'Metabolism' },
};
