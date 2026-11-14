import type { Measurement } from './types';
import { METRIC_IDS } from './types';

// B10: збереження вимірювань у localStorage (синхронне API, без залежностей).
// Якщо localStorage недоступний (приватне вікно, quota), працює пам'ять сторінки.
const KEY = 'ahm.measurements.v1';
let memory: Measurement[] = [];

function isMeasurement(x: unknown): x is Measurement {
  if (typeof x !== 'object' || x === null) return false;
  const m = x as Record<string, unknown>;
  return (
    typeof m.type === 'string' &&
    (METRIC_IDS as readonly string[]).includes(m.type) &&
    typeof m.value === 'number' &&
    Number.isFinite(m.value) &&
    typeof m.unit === 'string' &&
    typeof m.timestamp === 'string' &&
    Number.isFinite(new Date(m.timestamp).getTime()) &&
    (m.missionDay === undefined || typeof m.missionDay === 'number')
  );
}

/** Завантажує всі вимірювання, відсортовані за часом. Пошкоджені записи відкидаються. */
export function loadMeasurements(): Measurement[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [...memory];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMeasurement).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  } catch {
    return [...memory];
  }
}

/** Перезаписує всі вимірювання. */
export function saveMeasurements(list: Measurement[]): void {
  memory = [...list];
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* лишається копія в пам'яті */
  }
}

/** Додає одне або кілька вимірювань і повертає оновлений список. */
export function addMeasurements(...items: Measurement[]): Measurement[] {
  const next = [...loadMeasurements(), ...items];
  saveMeasurements(next);
  return loadMeasurements();
}

export function clearMeasurements(): void {
  memory = [];
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
