import type { Zone } from './types';

export function inZone(value: number, zone: Zone): boolean {
  return (
    (zone.min === undefined || value >= zone.min) && (zone.max === undefined || value < zone.max)
  );
}

export function findZone(value: number, zones: Zone[]): Zone | undefined {
  return zones.find((zone) => inZone(value, zone));
}
