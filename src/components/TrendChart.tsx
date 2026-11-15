import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import thresholdsData from '../content/thresholds.json';
import { VITALS_STORAGE_KEY, type StoredVitals } from '../pages/MeasurePage';

type PeriodKey = '24h' | '7d' | '30d';

type ThresholdZone = {
  status: string;
  min?: number;
  max?: number;
};

type ThresholdEntry = {
  indicator: string;
  label: string;
  unit: string;
  validRange: { min: number; max: number };
  zones: ThresholdZone[];
};

type TrendChartProps = {
  indicatorKey: string;
};

// Реалістичні базові значення для генерації історії місії
const BASE_VALUES: Record<string, number> = {
  heart_rate: 72,
  bp_systolic: 118,
  bp_diastolic: 76,
  body_temperature: 36.6,
  blood_glucose: 92,
  sleep_hours: 7.5,
  mood_score: 4,
};

export default function TrendChart({ indicatorKey }: TrendChartProps) {
  const [period, setPeriod] = useState<PeriodKey>('7d');

  const threshold = (thresholdsData as unknown as Record<string, ThresholdEntry>)[indicatorKey];
  const normalZone = threshold?.zones.find((z) => z.status === 'normal');
  const critHighZone = threshold?.zones.find((z) => z.status === 'critical' && z.min !== undefined);

  // Дістаємо останнє збережене значення з MeasurePage (якщо користувач його вводив)
  const latestSavedValue = useMemo(() => {
    try {
      const raw = localStorage.getItem(VITALS_STORAGE_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as Partial<StoredVitals>;
      const val = parsed[indicatorKey as keyof StoredVitals];
      return typeof val === 'number' ? val : undefined;
    } catch {
      return undefined;
    }
  }, [indicatorKey]);

  // Формуємо точки графіка залежно від вибраного періоду (24h / 7d / 30d)
  const chartData = useMemo(() => {
    const base = BASE_VALUES[indicatorKey] ?? 75;
    const isDecimal = indicatorKey === 'body_temperature' || indicatorKey === 'sleep_hours';

    const labelsByPeriod: Record<PeriodKey, string[]> = {
      '24h': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
      '7d': ['Sol 181', 'Sol 182', 'Sol 183', 'Sol 184', 'Sol 185', 'Sol 186', 'Sol 187'],
      '30d': ['Sol 158', 'Sol 163', 'Sol 168', 'Sol 173', 'Sol 178', 'Sol 183', 'Sol 187'],
    };

    const offsets = [-0.04, 0.03, -0.02, 0.06, 0.01, -0.03, 0];
    const labels = labelsByPeriod[period];

    return labels.map((timeLabel, idx) => {
      const isLast = idx === labels.length - 1;
      if (isLast && latestSavedValue !== undefined) {
        return { time: timeLabel, value: latestSavedValue };
      }
      const rawVal = base * (1 + offsets[idx]);
      const rounded = isDecimal ? Number(rawVal.toFixed(1)) : Math.round(rawVal);
      return { time: timeLabel, value: rounded };
    });
  }, [indicatorKey, period, latestSavedValue]);

  const yDomain = useMemo(() => {
    const vals = chartData.map((d) => d.value);
    if (normalZone?.min !== undefined) vals.push(normalZone.min);
    if (normalZone?.max !== undefined) vals.push(normalZone.max);
    if (critHighZone?.min !== undefined) vals.push(critHighZone.min);

    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const pad = (maxVal - minVal) * 0.15 || 2;
    return [Math.floor(minVal - pad), Math.ceil(maxVal + pad)];
  }, [chartData, normalZone, critHighZone]);

  return (
    <div>
      {/* Верхня панель графіка: вибір періоду + легенда порогів */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['24h', '7d', '30d'] as PeriodKey[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid var(--nasa-blue)',
                backgroundColor: period === p ? 'var(--nasa-blue)' : '#ffffff',
                color: period === p ? '#ffffff' : 'var(--nasa-blue)',
              }}
            >
              {p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>
          {normalZone?.max !== undefined && (
            <span style={{ color: '#15803d', fontWeight: 700 }}>
              --- Normal Max ({normalZone.max} {threshold?.unit})
            </span>
          )}
          {critHighZone?.min !== undefined && (
            <span style={{ color: '#dc2626', fontWeight: 700 }}>
              --- Critical ({critHighZone.min} {threshold?.unit})
            </span>
          )}
        </div>
      </div>

      {/* Контейнер графіка Recharts */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" stroke="#475569" fontSize={12} />
            <YAxis domain={yDomain} stroke="#475569" fontSize={12} />
            <Tooltip
              formatter={(value) => [`${value} ${threshold?.unit ?? ''}`, threshold?.label ?? 'Value']}
              contentStyle={{ borderRadius: '8px', borderColor: '#cbd5e1' }}
            />

            {/* Зелена пунктирна лінія верхньої межі норми */}
            {normalZone?.max !== undefined && (
              <ReferenceLine
                y={normalZone.max}
                stroke="#14d427"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}

            {/* Зелена пунктирна лінія нижньої межі норми */}
            {normalZone?.min !== undefined && (
              <ReferenceLine
                y={normalZone.min}
                stroke="#14d427"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}

            {/* Червона пунктирна лінія критичного порогу */}
            {critHighZone?.min !== undefined && (
              <ReferenceLine
                y={critHighZone.min}
                stroke="#f6270b"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke="#0b3e91"
              strokeWidth={3}
              dot={{ r: 5, fill: '#0b3e91', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 7, fill: '#fc3d21' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}