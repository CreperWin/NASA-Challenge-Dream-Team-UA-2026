import type { Scenario } from '../../core/types';

const modules = import.meta.glob<{ default: Scenario }>('./*.json', { eager: true });

export const scenarios: Scenario[] = Object.values(modules).map((m) => m.default);

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}