import type { EvaluationResult, Scenario } from '../core/types';

/**
 * Единый асинхронный контракт между UI и бэкендом (локальным или удалённым).
 */
export interface HealthApiAdapter {
  getEvaluation(): Promise<EvaluationResult>;
  getScenarios(): Promise<Scenario[]>;
  loadScenario(scenarioId: string): Promise<EvaluationResult>;
  resetData(): Promise<EvaluationResult>;
}
